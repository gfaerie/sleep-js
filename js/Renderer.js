function GameStateRenderer(viewpoint, context, size, font, charSize, background) {
	this.viewpoint = viewpoint;
	this.context = context;
	this.size = size;
	this.font = font;
	this.charSize = charSize;
	this.background = background;
}

GameStateRenderer.prototype = {
	render : function (engine) {
	
		// debug log remove
		console.log("Render");
		var center = engine.state.objects[this.viewpoint].position;
		var xOffset = 0;
		var yOffset = 0;

		var xStart = center.x - this.size;
		var xEnd = center.x + this.size;
		var yStart = center.y - this.size;
		var yEnd = center.y + this.size;

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

		// fill with background
		for (var x = xStart; x <= xEnd; x++) {
			graphics.push(new Array(yEnd - yStart));
			for (var y = yStart; y <= yEnd; y++) {
				graphics[x - xStart][y - yStart] = engine.state.map[x][y].graphics;
			}
		}
		
		// overwrite background will objects
		for (var key in engine.state.objects) {
			var object = engine.state.objects[key];
			if (object.position.x >= xStart && object.position.x <= xEnd && object.position.y >= yStart && object.position.y <= yEnd && object.graphics) {
				graphics[object.position.x - xStart][object.position.y - yStart] = object.graphics;
			}
		}

		// draw
		this.context.fillStyle = this.background;
		this.context.fillRect(0, 0, this.size * this.charSize, this.size * this.charSize);
		for (var x = 0; x <= (xEnd - xStart); x++) {
			for (var y = 0; y <= (yEnd - yStart); y++) {
				this.drawChar(graphics[x][y], "#FF0000", x + xOffset, y + yOffset);
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
