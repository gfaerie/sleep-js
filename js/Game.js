function Game(){
	this.pathfinder = new AStarPathFinder(new ManhattanHeuristic());
	this.player = new GameObject("@","player",new MapPosition(50,50), 10);
	this.engine = new GameEngine(new GamsState(100));
	this.engine.addTrigger(new GameObjectMover(this.pathfinder, 33));
	this.playerid = this.engine.addObject(this.player);
	this.renderer = new GameStateRenderer(this.playerid,documet.getElementById("canvas").getContext("2d"),25,"san-serif",10,"rgb(0,0,0)");
	this.floor = new GameBackGround(false,".",1);
	this.wall = new GameBackGround(true,"#",-1);
	this.timeUpdateInterval = setInterval(this.doUpdate, 25);
}

Game.prototype={
	start : function(){
		this.populateMap();
		this.doUpdate();
	},
	doUpdate : function(){
		this.engine.update();
		this.renderer.render(this.engine);
	},
	populateMap : function(){
		for (var x = 0; x < this.engine.state.size; x++) {
			for (var y = 0; y < this.engine.state.size; y++) {
				if (x==0 || y==0 || x ==this.engine.state.size-1 || y ==this.engine.state.size-1){
					this.engine.setBackground(new MapPosition(x,y),this.wall);
				}
				else{
					this.engine.setBackground(new MapPosition(x,y),this.floor);
				}
			}
		}
	}
	
	
}