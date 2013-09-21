function Color(red, green, blue) {
	this.red = red;
	this.green = green;
	this.blue = blue;
}

function LightSource(losCalculator, color, intensity) {
	this.color = color;
	this.intensity = intensity;
	this.losCalculator = losCalculator;
	this.castLight = losCalculator.castLight;
}

function CappedColorBlender() {
	this.blend = function (color, abs) {
		var red = Math.max(0, Math.min(color.red * (1 - abs.red), 255));
		var green = Math.max(0, Math.min(color.green * (1 - abs.green), 255));
		var blue = Math.max(0, Math.min(color.blue * (1 - abs.blue), 255));
		return new Color(red, green, blue);
	};
}

function WhiteLightColorBlender() {
	this.blend = function (color, abs) {
		var maxLight = Math.max(Math.max(color.red, color.green), color.blue);

		var red = Math.max(0, maxLight * (1 - abs.red));
		var green = Math.max(0, maxLight * (1 - abs.green));
		var blue = Math.max(0, maxLight * (1 - abs.blue));

		var maxColor = Math.max(Math.max(red, green), blue);
		if (maxColor > 255) {
			red = red * 255 / maxColor;
			green = green * 255 / maxColor;
			blue = blue * 255 / maxColor;
		}
		return new Color(red, green, blue);
	}
}

function LightCaster() {
	this.castLight = function (state) {
		//zero the current light
		for (var i = 0; i < state.size; i++) {
			state.light[i] = new Array(state.size);
		}

		var currentObject = null;

		// what tiles are blocked
		var blockFunction = function (x, y) {
			return !state.numberInsideGame(x, y) || (state.map[x][y].solid === true);
		}

		// what do we do when a tile is lit
		var lightCallBack = function (x, y, s) {
			if (state.numberInsideGame(x, y)) {
				var color = state.light[x][y];
				var attrition = 1 / (currentObject.positions.numberDistanceTo(x, y) + 1);
				if (!color) {
					color = new Color(s.light.color.red * attrition, s.light.color.green * attrition, s.light.color.blue * attrition);
					state.light[x][y] = color;
					color.lastLitBy = s.id;
				} else if (color.lastLitBy != s.id) {
					color.red = color.red + s.light.color.red * attrition;
					color.green = color.green + s.light.color.green * attrition;
					color.blue = color.blue + s.light.color.blue * attrition;
					color.lastLitBy = s.id;
				}

			}
		}

		// loop over all objects, render light for all objects that has a light
		for (var key in state.objects) {
			currentObject = state.objects[key];
			if (currentObject.light) {
				currentObject.light.castLight(lightCallBack, blockFunction, currentObject.position.x, currentObject.position.y, currentObject);
			}
		}

	}

}

function LineOfSightCalculator(length) {
	this.length = length;
	this.xTransform = [1, 1, 1, 1, -1, -1, -1, -1];
	this.yTransform = [1, 1, -1, -1, -1, -1, 1, 1];
	this.invertTransform = [false, true, true, false, false, true, true, false];
	this.invertBeamOrderOnBlock = [false, true, false, true, false, true, false, true, false];
	this.angleSpread = Math.Pi / 4;

	// all rays raching the end of an octant
	var allOuterRays = GraphicsHelper.buildLines(0, 0, 0, this.angleSpread, length);

	// initialize map of which positions are touched by which rays
	var positionRayMap = [];
	for (var i = 0; i < Math.ceil(length); i++) {
		positionRayMap[i] = new Array(Math.ceil(length));
	}

	// set of positions to check
	var allPositionsSet = {};
	for (var i = 0; i < allOuterRays.length; i++) {
		for (var j = 0; j < allOuterRays[i].length; j++) {
			allPositionsSet[allOuterRays[i][j].mkString()] = allOuterRays[i][j];
		}
	}

	// sorted list of positions, positions closest to middel (light source) first in array
	var allPositionsArray = new Array();
	for (var key in allPositionsSet) {
		if (allPositionsSet.hasOwnProperty(key)) {
			allPositionsArray.push(allPositionsSet[key]);
		}
	}
	allPositionsArray.sort(function (a, b) {
		return a.x * a.x + a.y * a.y - b.x * b.x - b.y * b.y
	});

	// now check which positions are lite by which rays
	for (var i = 0; i < allPositionsArray.length; i++) {
		var p = allPositionsArray[i];
		var affiliatedRays = new Array();
		for (var j = 0; j < allOuterRays.length; j++) {
			var ray = allOuterRays[j];
			for (var k = 0; k < ray.length; k++) {
				if (ray[k].mkString === p.mkString) {
					affiliatedRays.push(i);
					break;
				}
			}
		}
		positionRayMap[p.x][p.y] = affiliatedRays;
	}

	this.allPositionsArray = allPositionsArray;
	this.positionRayMap = positionRayMap;
	this.numberOfRays = allOuterRays.length;
}

LineOfSightCalculator.prototype = {
	castLight : function (lightCallback, blockFunction, centerX, centerY, source) {
		var parent = this;
		for (var octant = 0; octant < 8; octant++) {
			processOctant(losCallback, blockFunction, centerX, centerY, parent.xTransform[octant], parent.yTransform[octant], parent.invertTransform[octant], source)
		}
	},
	processOctant : function (lightCallback, blockFunction, centerX, centerY, xTransform, yTransform, invertTransform, source) {
		var parent = this;
		var blockedRays = {};
		var nrBlockedRays = 0;

		var positionIndex = 0;

		// work our way from the inner most positions and outwards, checking which positions blocks which rays
		for (var i = 0; i < parent.allPositionsArray.length; i++) {
			var p = parent.allPositionsArray[i];
			var x = xTransform * (invertTransform ? p.y : p.x) + centerX;
			var y = yTransform * (invertTransform ? p.x : p.y) + centerY;
			var affliatedRays = parent.positionRayMap[p.x][p.y];
			var lit = false;
			var rayNumber = 0;
			while (rayNumber < affliatedRays.size && !lit) {
				var ray = affliatedRays[rayNumber]
					if (!blockedRays[ray]) {
						lightCallback(x, y, source);
						lit = true;
					}
					rayNumber += 1;
			}
			if (blockFunction(x, y)) {
				for (var i = 0; i < affliatedRays.length; i++) {
					var blockedRay = affliatedRays[i];
					if (!blockedRays[blockedRay]) {
						blockedRays[blockedRay] = true;
						nrBlockedRays += 1;

						// all rays are blocked
						if (nrBlockedRays >= numberOfRays) {
							return;
						}
					}
				}
			}
		}

	}
}
