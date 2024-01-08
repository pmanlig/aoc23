// import React from 'react';
import { Renderer } from '../util';
import Solver from './Solvers';

class PathRenderer extends Renderer {
	constructor(map, path1, path2, forks) {
		super(val => val === '#' ? "#3F3F3F" : "#FFFFFF", map[0].length, map.length, 4);
		this.path1 = path1;
		this.path2 = path2;
		this.forks = forks;
	}

	draw(ctx, data) {
		super.draw(ctx, data);
		for (let n = this.path2; n !== null; n = n.prev) {
			if (n.prev !== null) {
				let path = this.forks[n.prev.path][n.path];
				for (let p = path; p !== null; p = p.prev) {
					this.drawPixel(ctx, p.x, p.y, "#AFFFAF");
				}
			}
		}
		for (let p = this.path1; p !== null; p = p.prev) {
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

	isValid(map) {
		return this.y > -1 && this.y < map.length &&
			this.x > -1 && this.x < map[this.y].length &&
			map[this.y][this.x] !== '#' &&
			(this.prev === null || !this.prev.hasSeen(this.x, this.y));
	}

	hash() {
		return 1000 * this.x + this.y;
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

function forks(p, map) {
	return [
		new Step(p.x + 1, p.y, p),
		new Step(p.x - 1, p.y, p),
		new Step(p.x, p.y + 1, p),
		new Step(p.x, p.y - 1, p)
	].filter(s => s.isValid(map));
}

function expand(j, map) {
	function expandPath(p) {
		for (let n = forks(p, map); n.length === 1; n = forks(p, map)) {
			p = n[0];
		}
		p.len = p.length();
		return p;
	}

	return forks(j, map).map(p => expandPath(p));
}

function survey(map) {
	let graph = {}
	let junctions = [new Step(1, 0)];
	while (junctions.length > 0) {
		let p = junctions.pop();
		let h = p.hash();
		if (!graph[h]) { graph[h] = {} }
		let paths = expand(p, map);
		paths.forEach(s => {
			graph[h][s.hash()] = s;
			if (s.y < map.length - 1 && !graph[s.hash()]) {
				junctions.push(new Step(s.x, s.y));
			}
		});
	}
	return graph;
}

class Arc {
	constructor(path, length, prev) {
		this.path = path;
		this.length = length || 0;
		this.prev = prev || null;
	}

	hasSeen(k) {
		for (let p = this; p !== null; p = p.prev) {
			if (p.path === k) { return true; }
		}
		return false;
	}

	extend(k, len) {
		return new Arc(k, len + this.length, this);
	}
}

function findLongest(map, targetY) {
	let paths = [new Arc(1000)];
	let longest = null;
	while (paths.length > 0) {
		let p = paths.pop();
		if (p.path % 1000 === targetY) {
			if (longest === null || p.length > longest.length) {
				longest = p;
			}
		} else {
			let forks = map[p.path];
			Object.keys(forks).forEach(k => {
				let x = parseInt(k, 10);
				if (!p.hasSeen(x)) {
					paths.push(p.extend(x, forks[x].len));
				}
			});
		}
	}
	return longest;
}

export class S23 extends Solver {
	solve(input) {
		let test = "#.#####################\n#.......#########...###\n#######.#########.#.###\n###.....#.>.>.###.#.###\n###v#####.#v#.###.#.###\n###.>...#.#.#.....#...#\n###v###.#.#.#########.#\n###...#.#.#.......#...#\n#####.#.#.#######.#.###\n#.....#.#.#.......#...#\n#.#####.#.#.#########v#\n#.#...#...#...###...>.#\n#.#.#v#######v###.###v#\n#...#.>.#...>.>.#.###.#\n#####v#.#.###v#.#.###.#\n#.....#...#...#.#.#...#\n#.#########.###.#.#.###\n#...###...#...#...#.###\n###.###.#.###v#####v###\n#...#...#.#.>.>.#.>.###\n#.###.###.#.###.#.#v###\n#.....###...###...#...#\n#####################.#";
		test = test.split('\n').map(l => l.split(''));
		let test1 = findPath(test);
		console.log(test1.len, test1.len === 94 ? "Test passed" : "Test FAILED");
		let m = survey(test);
		let a = findLongest(m, test.length - 1);
		console.log(a.length, a.length === 154 ? "Test passed" : "Test FAILED");

		input = input.split('\n').map(l => l.split(''));
		let sol1 = findPath(input);
		let map = survey(input);
		let sol2 = findLongest(map, input.length - 1);

		return {
			solution: `Scenic path length: ${sol1.len}\nScenic path with slopes length: ${sol2.length}`,
			bmp: input,
			renderer: new PathRenderer(input, sol1, sol2, map)
		};
	}
}