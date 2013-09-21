// A position on the map
function MapPosition(x, y) {
	this.x = x;
	this.y = y;
}

// A non-static object on the map (can move etc)
function GameObject(graphics, type, position, hp) {
	this.graphics = graphics;
	this.type = type;
	this.position = position;
	this.hp = hp;
	this.moveFraction = 0;
}

// a static background object (floor,wall etc)
function GameBackGround(solid, graphics, cost, color) {
	this.solid = solid;
	this.graphics = graphics;
	this.cost = cost;
	this.color = color;
}

// state that hold map data 
function GameState(size) {
	this.map = [];
	this.light = [];
	this.objects = {};
	this.size = size;
	this.idCounter = 0;

	for (var i = 0; i < size; i++) {
		this.map[i] = new Array(size);
		this.light[i] = new Array(size);
	}
}

// meh not the best name driver map state and state updates holding triggers for event handling
function GameEngine(state) {
	this.state = state;
	this.triggers = {};
	this.pendingEvents = [];
}

MapPosition.prototype = {
	mkString : function () {
		return this.x + ":" + this.y;
	},
	translate : function (x, y) {
		return new MapPosition(this.x + x, this.y + y);
	},
	distanceTo : function (position) {
		var xdiff = position.x - this.x;
		var ydiff = position.y - this.y;
		return Math.sqrt(xdiff * xdiff + ydiff * ydiff);
	}
};

GameState.prototype = {
	setBackground : function (position, background) {
		if (this.insideGame(position)) {
			this.map[position.x][position.y] = background;
		}
	},
	getBackground : function (position) {
		return this.map[position.x][position.y];
	},
	addObject : function (object) {
		object.id = this.idCounter++;
		this.objects[object.id] = object;
		return object.id;
	},
	removeObject : function (object) {
		delete objects[object.id];
	},
	insideGame : function (p) {
		return this.numberInsideGame(p.x,p.y);
	},
	numberInsideGame : function (x,y) {
		return x >= 0 && x < this.size && y >= 0 && y < this.size;
	}
};

GameEngine.prototype = {
	getTriggerMap : function (type) {
		if (!this.triggers[type]) {
			this.triggers[type] = {};
		}
		return this.triggers[type];
	},
	addTrigger : function (trigger) {
		trigger.id = this.state.idCounter++;
		var triggerMap = this.getTriggerMap(trigger.eventType);
		triggerMap[trigger.id] = trigger;
	},
	removeTrigger : function (trigger) {
		var map = getTriggerMap(trigger.eventType);
		delete map[trigger.id];
	},
	addEvent : function (event) {
		event.id = this.state.idCounter++;
		this.pendingEvents.push(event);
	},
	update : function () {
			// debug log remove
		this.addEvent(new TimeElapsed(new Date().getTime()));
		var triggersToExecute = [];
		for (var e = 0; e < this.pendingEvents.length; e++) {
		
			// find triggers for this event by using its type (indexed by event class type)
			var type = this.pendingEvents[e].type;
			var triggerMap = this.getTriggerMap(type)
				for (id in triggerMap) {
				
					// get the trigger
					var trigger = triggerMap[id].trigger(this, this.pendingEvents[e]);
					
					// handler can return nothing if it doesn't want tot do anything, if not execute
					if (typeof trigger !== "undefined" && trigger != null) {
						triggersToExecute.push(trigger);
					}
				};
		};
		
		// all events processed
		this.pendingEvents = [];
		
		// execute last (they might want to remove trigger, dont want to do that during loop)
		for (var i = 0; i < triggersToExecute.length; i++) {
			triggersToExecute[i]();
		};
	}
};
