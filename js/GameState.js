function MapPosition(x,y){
	this.x=x;
	this.y=y;
}

MapPosition.prototype = {
	mkString : function(){
		return this.x+":"+this.y;
	},
	translate : function(x,y){
		return new MapPosition(this.x+x,this.y+y);
	},
	distanceTo : function(position){
		var xdiff = position.x-this.x;
		var ydiff = position.y-this.y;
		return Math.sqrt(xdiff*xdiff+ydiff*ydiff);
	}
}

function GameObject(graphics, type, position, hp) {
	this.graphics = graphics;
	this.type = type;
	this.position = position;
	this.hp=hp;
	this.moveFraction=0;
}

function GameBackGround(solid, graphics, cost) {
	this.solid = solid;
	this.graphics = graphics;
	this.cost=cost;
}

function GameState(int size) {
	this.map = [];
	this.light = [];
	this.objects = {};
	this.size = size;
	this.idCounter=0;

	for (var i = 0; i < size; i++) {
		map[i] = new Array(size);
		light[i] = new Array(size);
	}
}

GameState.prototype = {
	setBackground : function (position, background) {
		if (insideGame(position)) {
			this.map[position.x][position.y] = background;
		}
	},
	getBackground : function (position) {
		return this.map[position.x][position.y];
	},
	addObject : function (object) {
		object.id = this.idCounter++;
		objects[object.id] = object;
		return object.id;
	},
	removeObject : function (object) {
		delete objects[object.id];
	},
	insideGame : function (position) {
		return position.x >= 0 && position.x < this.size && position.y >= 0 && position.y < this.size;
	}
}

function GameEngine(state) {
	this.state = state;
	this.triggers = {};
	this.pendingEvents = [];
}

GameEngine.prototype = {
	getTriggerMap : function(type){
		if(!this.triggers[type]){
			this.triggers[type] = {};
		}
		return this.triggers[type];
	},
	addTrigger : function(trigger){
		trigger.id=this.state.idCounter++;
		var map = getTriggerMap(trigger.eventType);
		map[trigger.id]=trigger;
	},
	removeTrigger: function(trigger){
		var map = getTriggerMap(trigger.eventType);
		delete  map[trigger.id];
	},
	addEvent : function(event){
		event.id=this.state.idCounter++;
		this.pendingEvents.push(event);
	},
	update : function () {
		addEvent(new TimeElapsed(new Date().getTime()));
		for (var e = 0; e < pendingEvents.length; e++) {
			var triggerMap = getTriggerMap(typeof pendingEvents[e])
			for (id in triggerMap) {
				var trigger = triggerMap[id].trigger(this, pendingEvents[e]);
				if (typeof trigger !== "undefined" && trigger !=null) {
					triggersToExecute.push(trigger);
				}
			};
		};
		this.pendingEvents=[];
		for (var i = 0; i < triggersToExecute.length; i++) {
			triggersToExecute[i]();
		};
	}
}
