function Game(canvas) {
	console.log("Game: New game started");
	this.pathfinder = new AStarPathFinder(new ManhattanHeuristic());
	this.player = new GameObject("@", "player", new MapPosition(50, 50), 10);
	this.engine = new GameEngine(new GameState(100));
	this.engine.addTrigger(new GameObjectMover(this.pathfinder, 33));
	this.playerid = this.engine.state.addObject(this.player);
	var ctx = canvas.getContext("2d");
	this.renderer = new GameStateRenderer(this.playerid, ctx, 25, "san-serif", 10, "rgb(0,0,0)");
	this.floor = new GameBackGround(false, ".", 1);
	this.wall = new GameBackGround(true, "#", -1);
}

Game.prototype = {
	start : function () {
		this.populateMap();
		this.doUpdate();
	},
	doUpdate : function () {
		this.engine.update();
		this.renderer.render(this.engine);
	},
	populateMap : function () {
		for (var x = 0; x < this.engine.state.size; x++) {
			for (var y = 0; y < this.engine.state.size; y++) {
				if (x == 0 || y == 0 || x == this.engine.state.size - 1 || y == this.engine.state.size - 1) {
					this.engine.state.setBackground(new MapPosition(x, y), this.wall);
				} else {
					this.engine.state.setBackground(new MapPosition(x, y), this.floor);
				}
			}
		}
	}

}
