function PlayerInputHandler(playerid, engine, fontsize, canvas){
	this.playerid=playerid;
	this.engine=engine;
	this.fontsize=fontsize;
	this.canvas=canvas;
}

PlayerInputHandler.prototype={
	clickHandler : function(e){
		  var x = Math.floor((e.pageX-$(this).offset().left) / this.fontsize);
		  var y = Math.floor((e.pageY-$(this).offset().top) / this.fontsize);
		  var newPath = [];
		  newPath.push(new MapPosition(x,y));
		  engine.state.objects[playerid].path=newPath;
	},
	setPath . function(x,y){
	
	}
}