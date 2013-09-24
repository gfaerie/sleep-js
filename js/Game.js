function Game(canvas) {
	console.log("Game: New game started");
	this.fontsize = 10;
	this.font = "san-serif";
	this.mapsize=128;
	this.renderradius=40;
	
	this.engine = new GameEngine(new GameState(this.mapsize));
	var losCalculator = new LineOfSightCalculator(30.0);
	var pathfinder = new AStarPathFinder(new ManhattanHeuristic());
	
	
	
	var ctx = canvas.getContext("2d");

	this.floor = new GameBackGround(false, ".", 1,  function(seed){return new Color(0.4 + (seed % 7) * 0.01, 0.4 + (seed % 7) * 0.01, 0.4 + (seed % 7) * 0.01)});
	this.wall = new GameBackGround(true, "#", -1,  function(seed){return new Color(0.4 + (seed % 9) * 0.03, 0.4 + (seed % 9) * 0.03, 0.4 + (seed % 9) * 0.03)});
	this.water = new GameBackGround(false, "~", 10,  function(seed){return new Color(0.990 + (seed % 7) * 0.001, 0.990 + (seed % 8) * 0.001, 0.2 + (seed % 9) * 0.01)});
	
	var player = new GameObject("@", "player", new MapPosition(10, 10), 10,function(){return new Color(0,0.9,0.9)});
	player.speed=0.03;
	var playerTorchFunction = function(){
		var time = new Date().getTime();
		var strength = 80+20*Math.sin(time/20)
		var red = 35+5*Math.sin(time/32)
		var green = 15+4*Math.sin(time/31)
		var blue = 4+Math.sin(time/41)
		return new Color(strength*red,strength*green,strength*blue);
	};
	player.light=new LightSource(losCalculator,playerTorchFunction);
	this.playerid = this.engine.state.addObject(player);
	
	var lightCaster = new LightCaster(30);
	var renderer = new GameStateRenderer(this.playerid, ctx, this.renderradius, this.font, this.fontsize, "rgb(0,0,0)", new CappedColorBlender(), new WhiteLightColorBlender(),30);


	
	this.engine.addTrigger(renderer);
	this.engine.addTrigger(lightCaster);
	this.engine.addTrigger(new GameObjectMover(pathfinder, 50));



	
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
		
		var total = 0;
		var count =0;
		// do update render cycle at 30 fps
		window.setInterval(function () {
			count = count+1;
			var start = new Date().getTime();
			parent.engine.update();
			var end = new Date().getTime();
			total = total + end-start;
			
			if(count ==200){
				var avgTime = total/count;
				console.log("Average render time: "+avgTime+" ms. Time used: "+Math.round((avgTime/33)*100.0)+"%");
				count=0;
				total=0;
			}
			
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
				
				if (x >=20 && x<=30 && y >=20 && y<=30) {
					this.engine.state.setBackground(new MapPosition(x, y), this.water);
				} 
			}
		}
	}

}
