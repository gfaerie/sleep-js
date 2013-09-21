function LightSource(red, green, blue, intensity) {
	this.red = red;
	this.green = green;
	this.blue = blue;
	this.intensity = intensity;
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
	castLight : function (lightCallback, blockFunction, centerX, centerY) {
		var parent = this;
		var emptyBlockSet = {};
		for (var octant = 0; octant < 8; octant++) {
			processOctant(losCallback, blockFunction, centerX, centerY, parent.xTransform[octant], parent.yTransform[octant], parent.invertTransform[octant], emptyBlockSet)
		}
	},
	processOctant : function (lightCallback, blockFunction, centerX, centerY, xTransform, yTransform, invertTransform, preBlockedRays) {
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
						lightCallback(x, y);
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
