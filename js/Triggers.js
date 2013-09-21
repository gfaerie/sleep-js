/**
Not used yet, wrote to early

 */
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
	this.eventType = "TimeElapsed";

	this.trigger = function (engine, event) {
		if (event instanceof TimeElapsed && event.time > (this.lastcall + this.period)) {
			var diff = event.time - this.lastcall;
			this.lastcall = event.time;
			var parent = this;
			return function () {

				// loop over all objects
				for (var key in engine.state.objects) {
					var toMove = engine.state.objects[key];
					toMove.moveFraction += diff * toMove.speed;

					// object wants to move
					if (toMove.path && toMove.path.length > 0) {
						//console.log("GameObjectMover: "+key+" want to move");

						var nextTarget = toMove.path[toMove.path.length - 1];
						var currentPosition = toMove.position;
						var distance = currentPosition.distanceTo(nextTarget);

						//console.log("GameObjectMover: Next target is " + nextTarget.mkString());

						// object has moved out of its path, redraw path (meaning you set goal by setting path to something far way)
						if (distance > 2) {
							var endTarget = toMove.path[0];
							//console.log("GameObjectMover: Plotting path to " + endTarget.mkString());
							
							// check that we want to move to a valid position
							if (engine.state.insideGame(endTarget) && !engine.state.getBackground(endTarget).solid) {
								toMove.path = parent.pathfinder.findPath(function (pos) {
										if (engine.state.insideGame(pos)) {
											return engine.state.getBackground(pos).cost;
										} else {
											return -1;
										}
									}, currentPosition, endTarget);
							}
							// invalid position clear path
							else{
								toMove.path=[];
							}
						}

						// move object while possible to do so

						var cost = distance * engine.state.getBackground(nextTarget).cost;
						//console.log("GameObjectMover: Cost is " + nextTarget.mkString());
						while (toMove.path.length > 0 && toMove.moveFraction > cost) {
							toMove.position = toMove.path.pop();
							toMove.moveFraction -= cost;
						}
					}
					// object is still
					else {
						toMove.moveFraction = 0;
					}

				}
			}

		}
	};
};
