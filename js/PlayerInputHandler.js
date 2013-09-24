function PlayerInputHandler(playerid, engine, fontsize,renderradius, canvasSelector) {
	var parent = this;
	$(canvasSelector).click(function (e) {
		var x = Math.floor((e.pageX - $(this).offset().left) / fontsize) - renderradius;
		var y = Math.floor((e.pageY - $(this).offset().top) / fontsize) - renderradius;
		var target = engine.state.objects[playerid].position.translate(x, y);
		if (engine.state.insideGame(target)) {
			engine.state.objects[playerid].path = [target];
		}
	});
}
