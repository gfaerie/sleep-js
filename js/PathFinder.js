function AStarPathFinder(heuristic) {
	this.content = [];
	this.heuristic = heuristic;
	this.sqrtTwo = Math.sqrt(2);
	this.maxCheck = 200;
	this.neighbours = [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];
}

function ManhattanHeuristic() {}

ManhattanHeuristic.prototype = {
	cost : function (x1, y1, x2, y2) {
		return Math.abs(x1 - x2) + Math.abs(y1 - y2);
	}

}
/**
A* path finding https://en.wikipedia.org/wiki/A*_search_algorithm
 */
function AStarMapNode(parent, x, y, depth, heuristic, cost) {
	this.parent = parent;
	this.x = x;
	this.y = y;
	this.depth = depth;
	this.heuristic = heuristic;
	this.cost = cost;
}

AStarMapNode.prototype = {
	mkString : function () {
		return this.x + ":" + this.y;
	}
}

AStarPathFinder.prototype = {
	findPath : function (costFunction, start, finish) {
		//var startTime = new Date().getTime();
		var closedSet = {};
		var nodes = {};
		var openQueue = new goog.structs.PriorityQueue();

		var startNode = new AStarMapNode(null, start.x, start.y, 0, 0, 0);
		openQueue.enqueue(0, startNode.mkString());
		nodes[startNode.mkString()]=startNode;
		//console.log("AStarPathFinder: Finding path from " + start.mkString()+" to " + finish.mkString());
		var i=0;
		
		while (!openQueue.isEmpty()) {
			var currentPosition = openQueue.dequeue();
			var current = nodes[currentPosition];
			var parent="None";
			if(current.parent){
			parent=current.parent.mkString();
			}
			//console.log("AStarPathFinder: Processing " + currentPosition+" with parent "+parent);
			if (current.x == finish.x && current.y == finish.y) {
				var returnList = [];
				while (current.parent) {
					//console.log("Retracing "+current.mkString());
					returnList.push(new MapPosition(current.x, current.y));
					var old = current;
					current=old.parent;
					old.parent=null;
				}
				//var time = new Date().getTime()-startTime;
				//console.log("AStarPathFinder: Finished after " + time+" ms");
				return returnList;
			}
			
			closedSet[current.mkString()] = true;
			
			for (var i = 0; i < this.neighbours.length; i++) {
				var neighbour = this.neighbours[i];
				var cost = this.sqrtTwo;
				if (neighbour.x == 0 || neighbour.y == 0) {
					cost = 1;
				}
				cost = cost * costFunction(current);
				var nodeX=current.x + neighbour[0];
				var nodeY=current.y + neighbour[1];
				var node = new AStarMapNode(current, nodeX, nodeY, current.depth + 1, this.heuristic.cost(nodeX, nodeY, finish.x, finish.y), cost + current.cost);
				var nodeKey= node.mkString();
				//console.log("AStarPathFinder: Examining " +nodeKey+"="+node.cost+" ("+cost+")");
				var explored = closedSet[nodeKey];
				var existing = nodes[nodeKey];
				var existingIsWorse =existing && node.cost<existing.cost;
				var existingIsBetter =existing && node.cost>existing.cost;

				// check if we already have the node in the nodes tree
				if(cost<0){
					//console.log("AStarPathFinder: Solid terrain");
					continue;
				}
				else if(explored){
				//	console.log("AStarPathFinder: Already explored");
						continue;
				}				
				else if(existingIsWorse){
					//console.log("AStarPathFinder: Updating");
					existing.cost=node.cost;
					existing.parent=node.parent;
					existing.depth=node.depth;
				}
				else if(existingIsBetter){
						//			console.log("AStarPathFinder: Existing path is better");

				}
				else if (!existing && !explored && cost > 0) {
					//console.log("AStarPathFinder: Adding");
					openQueue.enqueue(node.heuristic + node.cost, nodeKey);
					nodes[nodeKey]=node;
				}
			}
			
			if (closedSet.size > this.maxCheck) {
				return [];
			}
		}
		return [];
	}
}
