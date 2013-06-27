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
		var closedSet = {};
		var openQueue = new BinaryHeap(function (node) {
				return node.heuristic + noce.cost;
			});
		if (costFunction(start) < 0) {
			openQueue.push(new AStarMapNode(null, start.x, start.y, 0, 0, 0));
		}
		while (!openQueue.isEmpty) {
			var current = openQueue.pop();
			if (current.x == end.x && current.y == end.y) {
				var returnList = [];
				return addToList(returnList, current);
			}
			for (var i = 0; i < neighbours.length; i++) {
				var neighbour = neighbours[i];
				var cost = this.sqrtTwo;
				if (pos.x == 0 || pos.y == 0) {
					cost = 1;
				}
				cost = cost * costFunction(current);
				var node = new AStarMapNode(current, current.x + pos.x, current.y + pos.y, 0, 0, cost + current.cost)
					if (!(cost < 0 || closedSet[node.mkString])) {
						node.heuristic = this.heuristic.cost(node.x, node.y, end.x, end.y)
							openQueue.push(node);
					}
			}
			closedSet[current.mkString] = true;

			if (closedSet.size > maxCheck) {
				return [];
			}
		}
		return [];
	},
	addToList : function (currentPositions, node) {
		currentPositions.push(new MapPosition(node.x, node.y));
		if (node.parent != null) {
			return addToList(currentPositions, node.parent)
		} else {
			return currentPositions
		}
	}
}
