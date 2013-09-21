function Color(red, green, blue) {
	this.red = red;
	this.green = green;
	this.blue = blue;
}

function LightSource(color, intensity) {
	this.color = color;
	this.intensity = intensity;
}

function CappedColorBlender() {
	this.blend = function (rgb, abs) {
		var red = Math.max(0, Math.min(color.red * (1 - abs.red), 255));
		var green = Math.max(0, Math.min(color.green * (1 - abs.green), 255));
		var blue = Math.max(0, Math.min(color.blue * (1 - abs.blue), 255));
		return new Color(red, green, blue);
	};
}

function LightCaster(losCalculator) {
	this.castLight = function (state) {
		//zero the current light
		for (var i = 0; i < state.size; i++) {
			state.light[i] = new Array(state.size);
		}

		var blockFunction = function (x, y) {
			return !state.numberInsideGame(x, y) || (state.map[x][y].solid === true);
		}

		var lightCallBack = function (x, y, s) {
			if (state.numberInsideGame(x, y)) {
				var color = state.light[x][y];
				if (!color) {
					color=new Color(s.light.color.red, s.light.color.green, s.light.color.blue);
					state.light[x][y] = color;
					color.lastLitBy=s.id;
				} else if(color.lastLitBy!=s.id){
					color.red = color.red + s.light.color.red;
					color.green = color.green + s.light.color.green;
					color.blue = color.blue + s.light.color.blue;
					color.lastLitBy=s.id;
				}

			}
		}
		
		for (var key in state.objects) {
			var currentObject = state.objects[key];
			if (currentObject.light) {
				losCalculator.castLight(lightCallBack,blockFunction,currentObject.position.x,currentObject.position.y,currentObject);
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
	var allOuterRays = GraphicsHelper.buildLines(0, 0, 0, angleSpread, length);

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
	castLight : function (lightCallback, blockFunction, centerX, centerY,source) {
		var parent = this;
		var emptyBlockSet = {};
		for (var octant = 0; octant < 8; octant++) {
			processOctant(losCallback, blockFunction, centerX, centerY, parent.xTransform[octant], parent.yTransform[octant], parent.invertTransform[octant], emptyBlockSet,source)
		}
	},
	processOctant : function (lightCallback, blockFunction, centerX, centerY, xTransform, yTransform, invertTransform, preBlockedRays,source) {
		var parent = this;
		var blockedRays = {};
		var nrBlockedRays = 0;

		if (preBlockedRays.size >= numberOfRays) {
			return;
		}

		for (var blocked = 0; blocked < preBlockedRays.length; blocked++) {
			var ray = preBlockedRays[blocked];
			blockedRays[ray] = true;
			nrBlockedRays += 1;
		}

		var positionIndex = 0;
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
						lightCallback(x, y,source);
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
						if (nrBlockedRays >= numberOfRays) {
							return;
						}
					}
				}
			}
		}

	}
}
