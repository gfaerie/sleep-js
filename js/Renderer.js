function GameStateRenderer(viewpoint, context, size, font, charSize, background, backgroundBlender, objectBlender, period) {
	this.viewpoint = viewpoint;
	this.context = context;
	this.size = size;
	this.font = font;
	this.charSize = charSize;
	this.background = background;
	this.backgroundBlender = backgroundBlender;
	this.objectBlender = objectBlender;
	this.period = period;
	this.lastcall = 0;
	this.eventType = "TimeElapsed";
}

GameStateRenderer.prototype = {
	trigger : function (engine, event) {
		var parent = this;
		if (event instanceof TimeElapsed && event.time > (parent.lastcall + parent.period)) {
			parent.lastcall = event.time;
			return function(){parent.render(parent,engine)};
		}
	},
	render : function(parent,engine) {
		// debug log remove
		var center = engine.state.objects[parent.viewpoint].position;
		var xOffset = 0;
		var yOffset = 0;

		var xStart = center.x - parent.size;
		var xEnd = center.x + parent.size;
		var yStart = center.y - parent.size;
		var yEnd = center.y + parent.size;

		if (xStart < 0) {
			xOffset = -xStart;
			xStart = 0;
		}
		if (yStart < 0) {
			yOffset = -yStart;
			yStart = 0;
		}
		if (xEnd >= engine.state.size) {
			xEnd = engine.state.size - 1;
		}
		if (yEnd >= engine.state.size) {
			yEnd = engine.state.size - 1;
		}

		var graphics = [];
		var light = [];

		// fill with background
		for (var x = xStart; x <= xEnd; x++) {
			graphics.push(new Array(yEnd - yStart));
			light.push(new Array(yEnd - yStart));
			for (var y = yStart; y <= yEnd; y++) {
				graphics[x - xStart][y - yStart] = engine.state.map[x][y].graphics;
				if (engine.state.light[x] && engine.state.light[x][y]) {
					light[x - xStart][y - yStart] = parent.backgroundBlender.blend(engine.state.light[x][y], engine.state.map[x][y].color(x + 31 * y));
				}
			}
		}

		// overwrite background will objects
		for (var key in engine.state.objects) {
			var object = engine.state.objects[key];
			if (object.position.x >= xStart && object.position.x <= xEnd && object.position.y >= yStart && object.position.y <= yEnd && object.graphics) {
				graphics[object.position.x - xStart][object.position.y - yStart] = object.graphics;
				if (engine.state.light[object.position.x] && engine.state.light[object.position.x][object.position.y]) {
					light[object.position.x - xStart][object.position.y - yStart] = parent.objectBlender.blend(engine.state.light[object.position.x][object.position.y], object.color());
				}
			}
		}

		// draw
		parent.context.fillStyle = this.background;
		parent.context.fillRect(0, 0, (2 * this.size + 1) * this.charSize, (2 * this.size + 1) * this.charSize);
		for (var x = 0; x <= (xEnd - xStart); x++) {
			for (var y = 0; y <= (yEnd - yStart); y++) {
				if (light[x][y]) {
					parent.drawChar(graphics[x][y], "rgb(" + light[x][y].red + "," + light[x][y].green + "," + light[x][y].blue + ")", x + xOffset, y + yOffset);
				}
			}
		}

	},
	drawChar : function (graphics, color, x, y) {
		var drawX = x * this.charSize;
		var drawY = (y + 1) * this.charSize;
		this.context.fillStyle = color;
		this.context.font = this.font;
		if (graphics != null) {
			this.context.fillText(graphics, drawX, drawY)
		}
	}
}
