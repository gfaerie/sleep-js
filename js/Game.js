function Game(canvas) {
	console.log("Game: New game started");
	this.fontsize = 10;
	this.font = "san-serif";
	this.mapsize=256;
	this.renderradius=35;
	this.pathfinder = new AStarPathFinder(new ManhattanHeuristic());
	this.player = new GameObject("@", "player", new MapPosition(10, 10), 10);
	this.player.speed=0.03;
	this.engine = new GameEngine(new GameState(this.mapsize));
	this.engine.addTrigger(new GameObjectMover(this.pathfinder, 50));
	this.playerid = this.engine.state.addObject(this.player);
	var ctx = canvas.getContext("2d");
	this.renderer = new GameStateRenderer(this.playerid, ctx, this.renderradius, this.font, this.fontsize, "rgb(0,0,0)");
	this.floor = new GameBackGround(false, ".", 1);
	this.wall = new GameBackGround(true, "#", -1);
}

Game.prototype = {
	start : function () {
		var parent = this;
		// click means players want to move there, right now we teleport
		$("#canvas").click(function (e) {
			var x = Math.floor((e.pageX - $(this).offset().left) / parent.fontsize)-parent.renderradius;
			var y = Math.floor((e.pageY - $(this).offset().top) / parent.fontsize)-parent.renderradius;
			var target = parent.engine.state.objects[parent.playerid].position.translate(x,y);
			if(parent.engine.state.insideGame(target)){			
				parent.engine.state.objects[parent.playerid].path = [target];
			}
		});
		this.populateMap();
		
		// do update render cycle at 30 fps
		window.setInterval(function () {
			parent.engine.update();
			parent.renderer.render(parent.engine);
		}, 33);
	},
	populateMap : function () {
		for (var x = 0; x < this.engine.state.size; x++) {
			for (var y = 0; y < this.engine.state.size; y++) {
				if (Math.floor(x/5)%3==0 && Math.floor(y/5)%3==0) {
					this.engine.state.setBackground(new MapPosition(x, y), this.wall);
				} 
				else if (x == 0 || y == 0 || x == this.engine.state.size - 1 || y == this.engine.state.size - 1) {
					this.engine.state.setBackground(new MapPosition(x, y), this.wall);
				} 
				else {
					this.engine.state.setBackground(new MapPosition(x, y), this.floor);
				}
			}
		}
	}

}
