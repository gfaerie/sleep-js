function Color(red, green, blue) {
	this.red = red;
	this.green = green;
	this.blue = blue;

	this.mkString = function () {
		return this.red + "," + this.green + "," + this.blue;
	}
}

function LightSource(losCalculator, colorCalc) {
	this.colorCalc = colorCalc;
	this.losCalculator = losCalculator;

	this.castLight = function (state, centerX, centerY) {
		var parent = this;
		var currentColor = parent.colorCalc();

		// what tiles are blocked
		var blockFunction = function (x, y) {
			return (state.numberInsideGame(x, y) !== true) || (state.map[x][y].solid === true);
		};

		// what do we do when a tile is lit
		var lightAction = function (x, y, attrition) {
			if (state.numberInsideGame(x, y)) {
				var color = state.light[x][y];
				if (color === null || color === undefined) {
					color = new Color(currentColor.red * attrition, currentColor.green * attrition, currentColor.blue * attrition);
					color.lastLitBy = parent;
					state.light[x][y] = color;
				} else if (color.lastLitBy !== parent) {
					color.red = color.red + currentColor.red * attrition;
					color.green = color.green + currentColor.green * attrition;
					color.blue = color.blue + currentColor.blue * attrition;
					color.lastLitBy = parent;
				}
			}
		};

		losCalculator.castLight(lightAction, blockFunction, centerX, centerY);
	};
}

function CappedColorBlender() {
	this.blend = function (color, abs) {
		var red = Math.round(Math.max(0, Math.min(color.red * (1 - abs.red), 255)));
		var green = Math.round(Math.max(0, Math.min(color.green * (1 - abs.green), 255)));
		var blue = Math.round(Math.max(0, Math.min(color.blue * (1 - abs.blue), 255)));
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
		return new Color(Math.round(red), Math.round(green), Math.round(blue));
	}
}

function LightCaster(period) {
	this.period = period;
	this.lastcall = 0;
	this.eventType = "TimeElapsed";
	this.trigger = function (engine, event) {
		var parent = this;
		if (event instanceof TimeElapsed && event.time > (parent.lastcall + parent.period)) {
			parent.lastcall = event.time;
			return function(){parent.castLight(engine.state)};
		}
	}
	this.castLight = function (state) {
		//zero the current light
		for (var i = 0; i < state.size; i++) {
			state.light[i] = new Array(state.size);
		}

		// loop over all objects, render light for all objects that has a light
		for (var key in state.objects) {
			var currentObject = state.objects[key];
			if (currentObject.light) {
				currentObject.light.castLight(state, currentObject.position.x, currentObject.position.y);
			}
		}

	}
}

function LineOfSightCalculator(length) {
	this.length = length;
	this.xTransform = [1, 1, 1, 1, -1, -1, -1, -1];
	this.yTransform = [1, 1, -1, -1, -1, -1, 1, 1];
	this.invertTransform = [false, true, true, false, false, true, true, false];
	this.angleSpread = Math.PI / 4;

	// all rays raching the end of an octant
	var allOuterRays = GraphicsHelper.buildLines(0, 0, 0, this.angleSpread, length);

	// initialize map of which positions are touched by which rays
	var positionRayMap = [];
	for (var i = 0; i <= Math.ceil(length); i++) {
		positionRayMap[i] = new Array(Math.ceil(length) + 1);
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
		return Math.sqrt(a.x * a.x + a.y * a.y) - Math.sqrt(b.x * b.x + b.y * b.y);
	});

	// now check which positions are lite by which rays
	for (var i = 0; i < allPositionsArray.length; i++) {
		var p = allPositionsArray[i];
		p.attrition = 1/(p.distanceTo(new MapPosition(0, 0)) + 1.0);
		var affiliatedRays = new Array();
		for (var j = 0; j < allOuterRays.length; j++) {
			var ray = allOuterRays[j];
			for (var k = 0; k < ray.length; k++) {
				if (ray[k].mkString() === p.mkString()) {
					affiliatedRays.push(j);
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
	castLight : function (lightCallback, blockFunction, centerX, centerY) {
		var parent = this;
		for (var octant = 0; octant < 8; octant++) {
			parent.processOctant(lightCallback, blockFunction, centerX, centerY, parent.xTransform[octant], parent.yTransform[octant], parent.invertTransform[octant]);
		}
	},
	processOctant : function (lightCallback, blockFunction, centerX, centerY, xTransform, yTransform, invertTransform) {
		var parent = this;
		var blockedRays = {};
		var nrBlockedRays = 0;

		// work our way from the inner most positions and outwards, checking which positions blocks which rays
		for (var i = 0; i < parent.allPositionsArray.length; i++) {
			var p = parent.allPositionsArray[i];
			var x = xTransform * (invertTransform ? p.y : p.x) + centerX;
			var y = yTransform * (invertTransform ? p.x : p.y) + centerY;
			var affliatedRays = parent.positionRayMap[p.x][p.y];
			var lit = false;
			var rayNumber = 0;
			while (rayNumber < affliatedRays.length && !lit) {
				var ray = affliatedRays[rayNumber];
				if (blockedRays[ray] !== true) {
					lightCallback(x, y, p.attrition);
					lit = true;
				}
				rayNumber = rayNumber + 1;
			}

			if (blockFunction(x, y)) {
				for (var j = 0; j < affliatedRays.length; j++) {
					var blockedRay = affliatedRays[j];
					if (blockedRays[blockedRay] !== true) {

						blockedRays[blockedRay] = true;
						nrBlockedRays = nrBlockedRays + 1;
						// all rays are blocked
						if (nrBlockedRays >= parent.numberOfRays) {
							return;
						}
					}
				}
			}
		}

	}
}
