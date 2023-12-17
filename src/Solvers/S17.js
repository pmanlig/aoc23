// import React from 'react';
import { Renderer } from '../util';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

function color(x) {
	let hex = Math.floor(x * 255 / 10).toString(16);
	return `#${hex}${hex}${hex}`;
}

const colors = [
	color(0),
	color(1),
	color(2),
	color(3),
	color(4),
	color(5),
	color(6),
	color(7),
	color(8),
	color(9),
];

class PathRenderer extends Renderer {
	constructor(map, path, ultraPath) {
		super(colors, map[0].length, map.length, Math.floor(500 / map.length));
		this.map = map;
		this.path = path;
		this.ultraPath = ultraPath;
	}

	draw(ctx, data) {
		super.draw(ctx, data);
		for (let p = this.path; p !== undefined; p = p.prev) {
			this.drawPixel(ctx, p.x, p.y, "#FF3F3F");
		}
		for (let p = this.ultraPath; p !== undefined; p = p.prev) {
			this.drawPixel(ctx, p.x, p.y, "#3FFF3F");
		}
	}
}

// eslint-disable-next-line
const up = 0;
const right = 1;
const down = 2;
const left = 3;

const delta = [
	{ x: 0, y: -1 },
	{ x: 1, y: 0 },
	{ x: 0, y: 1 },
	{ x: -1, y: 0 }
];

class Path {
	constructor(x, y, prev, count, direction, acc, map) {
		this.x = x;
		this.y = y;
		this.prev = prev;
		this.count = count;
		this.direction = direction;
		this.acc = acc;
		this.map = map;
	}

	isOutOfBounds(x, y) {
		return x < 0 || y < 0 || x >= this.map[0].length || y >= this.map.length;
	}

	step(x, y, count, direction) {
		if (this.isOutOfBounds(x, y)) { return null; }
		return new Path(x, y, this, count, direction, this.acc + this.map[y][x], this.map);
	}

	straight() {
		let newX = this.x + delta[this.direction].x;
		let newY = this.y + delta[this.direction].y;
		return this.step(newX, newY, this.count + 1, this.direction);
	}

	turn(t) {
		let newDir = (this.direction + t) % 4;
		let newX = this.x + delta[newDir].x;
		let newY = this.y + delta[newDir].y;
		return this.step(newX, newY, 1, newDir);
	}
}

function hash(x, y, direction, count) {
	return x + 1000 * y + 1000000 * direction + 10000000 * count;
}

function findCheapestRoute(input, paths, costs, min, max, iterations) {
	let goalX = input[0].length - 1;
	let goalY = input.length - 1;

	function isGoal(p) { return p.x === goalX && p.y === goalY; }
	function addPath(p) {
		if (p === null) { return; }
		let h = hash(p.x, p.y, p.direction, p.count);
		if (costs[h] !== undefined && p.acc >= costs[h]) { return; }
		costs[h] = p.acc;
		paths.push(p);
	}
	function predict(p) { return p.acc + p.x + p.y; }
	function sorter(a, b) { return predict(b) - predict(a); }

	while (paths.length > 0 && iterations-- > 0) {
		let p = paths.pop();
		if (isGoal(p)) { return p; }
		if (p.count < max) { addPath(p.straight()); }
		if (p.count >= min) {
			let l = p.turn(left);
			while (l !== null && l.count < min) { l = l.straight(); }
			if (null !== l) { addPath(l); }
			let r = p.turn(right);
			while (r !== null && r.count < min) { r = r.straight(); }
			if (null !== r) { addPath(r); }
		}

		paths.sort(sorter);
	}

	return null;
}

function elapsed(from, to) {
	let seconds = Math.floor((to - from) / 1000);
	let minutes = Math.floor(seconds / 60);
	return `${minutes}:${("00" + seconds % 60).slice(-2)}`
}

function startPaths(input) {
	let origin = { x: 0, y: 0, acc: 0 }
	return [
		new Path(1, 0, origin, 1, right, input[0][1], input),
		new Path(0, 1, origin, 1, down, input[1][0], input)
	];

}

export class S17 extends Solver {
	setup(input) {
		let test = "2413432311323\n3215453535623\n3255245654254\n3446585845452\n4546657867536\n1438598798454\n4457876987766\n3637877979653\n4654967986887\n4564679986453\n1224686865563\n2546548887735\n4322674655533"
			.split('\n').map(l => l.split('').map(n => parseInt(n, 10)));

		let x = findCheapestRoute(test, startPaths(test), [], 1, 3, 1000000000);
		console.log(x.acc === 102 ? "Test passed" : "Test FAILED");
		x = findCheapestRoute(test, startPaths(test), [], 4, 10, 1000000000);
		console.log(x.acc === 94 ? "Test passed" : "Test FAILED");

		this.input = input.split('\n').map(l => l.split('').map(n => parseInt(n, 10)));
		this.start = Date.now();
		this.renderer = new PathRenderer(this.input);
		this.paths = startPaths(this.input);
		this.costs = [];

		this.setState({
			solution: `Least amount of heat loss: Computing...\n\
			Least heat loss with ultra crucibles: Computing...\n\
			Time elapsed: ${elapsed(this.start, Date.now())}`, bmp: this.input,
			renderer: this.renderer
		});
	}

	solve() {
		if (this.sol1 === undefined) {
			let sol = findCheapestRoute(this.input, this.paths, this.costs, 1, 3, 1000);
			if (null !== sol) {
				// Found it!
				this.sol1 = sol;
				this.paths = startPaths(this.input);
				this.costs = [];
				this.renderer = new PathRenderer(this.input, sol);
			}
		} else {
			let sol = findCheapestRoute(this.input, this.paths, this.costs, 4, 10, 1000);
			if (null !== sol) {
				// Found it!
				this.sol2 = sol;
				return {
					solution: `Least amount of heat loss: ${this.sol1.acc}\n\
					Least heat loss with ultra crucibles: ${this.sol2.acc}\n\
					Time elapsed: ${elapsed(this.start, Date.now())}`,
					bmp: this.input,
					renderer: new PathRenderer(this.input, this.sol1, this.sol2)
				}
			}
		}

		this.setState({
			solution: `Least amount of heat loss: ${this.sol1 ? this.sol1.acc : "Computing..."}\n\
			Least heat loss with ultra crucibles: ${this.sol2 ? this.sol2.acc : "Computing..."}\n\
			Time elapsed: ${elapsed(this.start, Date.now())}`,
			bmp: this.input,
			renderer: this.renderer
		});
	}
}