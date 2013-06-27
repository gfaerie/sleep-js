function CleanupDeadObjects(period) {
	this.period = period;
	this.lastcall = 0;
	this.eventType = typeof TimeElapsed
		this.trigger = function (engine, event) {
		if (event instanceof TimeElapsed && event.time > (lastcall + period)) {
			lastcall = event.time;
			return function () {
				var toRemove = [];

				// check all objects
				for (var key in engine.state.objects) {
					if (engine.state.objects[key].hp < 0) {
						toRemove.push(key);
					}
				}

				// remove the low hp objects
				for (var i = 0; i < toRemove.length; i++) {
					engine.state.objects.removeObject(toRemove[i]);
				}
			};
		};
	};
}

function GameObjectMover(pathfinder, period) {
	this.pathfinder = pathfinder;
	this.period = period;
	this.lastcall = 0;
	this.eventType = typeof TimeElapsed
		this.trigger = function (engine, event) {
		if (event instanceof TimeElapsed && event.time > (lastcall + period)) {
			var diff = event.time - lastcall;
			this.lastcall = event.time;
			return function () {
				// loop over all objects
				for (var key in engine.state.objects) {
					var toMove = engine.state.objects[key];
					toMove.moveFraction += diff * toMove.speed;

					// object wants to move
					if (toMove.path && toMove.path.length > 0) {
						var nextTarget = toMove.path[toMove.path.length - 1];
						var currentPosition = toMove.position;
						var distance = currentPosition.distanceTo(nextTarget);

						// object has moved out of its path, redraw path
						if (distance > 2) {
							var endTarget = toMove.path[0];
							toMove.path = this.pathfinder.findPath(function (pos) {
									if (engine.state.insideGame(pos)) {
										return engine.state.getBackground(pos);
									} else {
										return -1;
									}
								}, currentPosition, endTarget);
						}
					}
					// object is still
					else {
						toMove.moveFraction = 0;
					}

					// move object while possible to do so
					while (toMove.path.length > 0 && toMove.moveFraction > toMove.path[toMove.path.length - 1].cost) {
						toMove.position = toMove.path.pop();
						toMove.moveFraction -= toMove.position.cost;
					}
				}
			}

		}
	};
};
