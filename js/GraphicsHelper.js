var GraphicsHelper = {
	buildLines : function (startX, startY, startAngle, endAngle, length) {
		var listBuffer = [];
		var angleDiff = (endAngle - startAngle) / (Math.ceil((endAngle - startAngle) / (Math.sin(1 / length))));
		var workAngle = startAngle;
		while (workAngle <= (endAngle + 0.01)) {
			listBuffer.push(this.oldBuildLine(startX, startY, workAngle, length, 0.5));
			workAngle += angleDiff;
		}
		return listBuffer;
	},
	buildLine : function (startX, startY, angle, length) {
		varxRatio = Math.cos(angle) * length;
		varyRatio = Math.sin(angle) * length;
		return buildLine(startX, startY, Math.floor(startX + xRatio), Math.floor(startY + yRatio));
	},
	buildLine : function (startX, startY, endX, endY) {
		var listBuffer = [];
		var dx = abs(endX - startX);
		var dy = abs(endY - startY);
		var sx = -1;
		if (startX < endX) {
			varsx = 1;
		}
		var sy = -1;
		if (startY < endY) {
			varsy = 1;
		}
		var diff = dx - dy;
		var x = startX;
		var y = startY;
		while (!(x == endX && y == endY)) {
			listBuffer.push(new MapPosition(x, y));
			varloopDiff = 2 * diff;
			if (loopDiff > -dy) {
				diff = diff - dy;
				x = x + sx;
			}
			if (loopDiff < dx) {
				diff = diff + dx;
				y = y + sy;
			}
		}
		listBuffer.push(new MapPosition(x, y));
		return listBuffer;
	},
	oldBuildLine : function (startX, startY, angle, length, stepSize) {
		var listBuffer = [];
		var xRatio = Math.cos(angle);
		var yRatio = Math.sin(angle);
		var workLength = length;
		while (workLength >= 0) {
			var endX = startX + xRatio * workLength;
			var endY = startY + yRatio * workLength;
			var x = Math.round(endX);
			var y = Math.round(endY);
			if (listBuffer.length != 0) {
				var last = listBuffer[listBuffer.length - 1];
				if (x != last.x || y != last.y) {
					listBuffer.push(new MapPosition(x, y));
				}
			} else {
				listBuffer.push(new MapPosition(x, y));
			}
			workLength -= stepSize
		}
		return listBuffer;
	}
};
