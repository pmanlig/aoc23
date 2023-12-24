// import React from 'react';
import { Renderer } from '../util';
import Solver from './Solvers';

class PathRenderer extends Renderer {
	constructor(map, path) {
		super(val => val === '#' ? "#3F3F3F" : "#FFFFFF", map[0].length, map.length, 4);
		this.path = path;
	}

	draw(ctx, data) {
		super.draw(ctx, data);
		for (let p = this.path; p !== null; p = p.prev) {
			this.drawPixel(ctx, p.x, p.y, "#FFAFAF");
		}
	}
}

class Step {
	constructor(x, y, prev) {
		this.x = x;
		this.y = y;
		this.prev = prev || null;
	}

	hasSeen(x, y) {
		for (let p = this; p !== null; p = p.prev) {
			if (p.x === x && p.y === y) { return true; }
		}
		return false;
	}

	length() {
		let len = -1;
		for (let p = this; p !== null; p = p.prev) { len++; }
		return len;
	}
}

function tryAddPath(x, y, p, paths, map) {
	if (y < 0 || y >= map.length || x < 0 || x >= map[y].length || map[y][x] === '#') { return; }
	if (p.hasSeen(x, y)) { return; }
	p = new Step(x, y, p);
	switch (map[y][x]) {
		case '>':
			tryAddPath(x + 1, y, p, paths, map);
			return;
		case '<':
			tryAddPath(x - 1, y, p, paths, map);
			return;
		case 'v':
			tryAddPath(x, y + 1, p, paths, map);
			return;
		case '^':
			tryAddPath(x, y - 1, p, paths, map);
			return;
		default:
			break;
	}
	paths.push(p);
}

function tryAddSlopedPath(x, y, p, paths, map) {
	if (y < 0 || y >= map.length || x < 0 || x >= map[y].length || map[y][x] === '#') { return; }
	if (p.hasSeen(x, y)) { return; }
	p = new Step(x, y, p);
	paths.push(p);
}

function findPath(map) {
	let paths = [new Step(1, 0)];
	let complete = [];
	while (paths.length > 0) {
		let p = paths.pop();
		if (p.y === map.length - 1) { complete.push(p); }
		else {
			tryAddPath(p.x + 1, p.y, p, paths, map);
			tryAddPath(p.x - 1, p.y, p, paths, map);
			tryAddPath(p.x, p.y + 1, p, paths, map);
			tryAddPath(p.x, p.y - 1, p, paths, map);
		}
	}
	complete.forEach(p => p.len = p.length());
	complete.sort((a, b) => b.len - a.len);
	return complete[0];
}

function findSlopedPath(map) {
	let paths = [new Step(1, 0)];
	let complete = [];
	while (paths.length > 0) {
		let p = paths.pop();
		if (p.y === map.length - 1) { complete.push(p); }
		else {
			tryAddSlopedPath(p.x + 1, p.y, p, paths, map);
			tryAddSlopedPath(p.x - 1, p.y, p, paths, map);
			tryAddSlopedPath(p.x, p.y + 1, p, paths, map);
			tryAddSlopedPath(p.x, p.y - 1, p, paths, map);
		}
	}
	complete.forEach(p => p.len = p.length());
	complete.sort((a, b) => b.len - a.len);
	return complete[0];
}

export class S23 extends Solver {
	solve(input) {
		let test = "#.#####################\n#.......#########...###\n#######.#########.#.###\n###.....#.>.>.###.#.###\n###v#####.#v#.###.#.###\n###.>...#.#.#.....#...#\n###v###.#.#.#########.#\n###...#.#.#.......#...#\n#####.#.#.#######.#.###\n#.....#.#.#.......#...#\n#.#####.#.#.#########v#\n#.#...#...#...###...>.#\n#.#.#v#######v###.###v#\n#...#.>.#...>.>.#.###.#\n#####v#.#.###v#.#.###.#\n#.....#...#...#.#.#...#\n#.#########.###.#.#.###\n#...###...#...#...#.###\n###.###.#.###v#####v###\n#...#...#.#.>.>.#.>.###\n#.###.###.#.###.#.#v###\n#.....###...###...#...#\n#####################.#";
		test = test.split('\n').map(l => l.split(''));
		let test1 = findPath(test);
		console.log(test1.len, test1.len === 94 ? "Test passed" : "Test FAILED");
		let test2 = findSlopedPath(test);
		console.log(test2.len, test2.len === 154 ? "Test passed" : "Test FAILED");

		input = input.split('\n').map(l => l.split(''));
		let sol1 = findPath(input);
		let sol2 = findSlopedPath(input);

		return {
			solution: `Scenic path length: ${sol1.len}\nScenic path with slopes length: ${sol2.len}`,
			bmp: input,
			renderer: new PathRenderer(input, sol1)
		};
	}
}