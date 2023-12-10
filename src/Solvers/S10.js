// import React from 'react';
import Solver from './Solvers';
import { Renderer } from '../util';
// import { SearchState, PixelMap } from '../util';

const colors = [
	"#7FFF7F",
	"#000000",
	"#FFFFFF",
	"#7F7F7F"
];

const sprites = {
	'.': [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
	'|': [[0, 1, 0], [0, 1, 0], [0, 1, 0]],
	'-': [[0, 0, 0], [1, 1, 1], [0, 0, 0]],
	'F': [[0, 0, 0], [0, 1, 1], [0, 1, 0]],
	'J': [[0, 1, 0], [1, 1, 0], [0, 0, 0]],
	'7': [[0, 0, 0], [1, 1, 0], [0, 1, 0]],
	'L': [[0, 1, 0], [0, 1, 1], [0, 0, 0]],
	'S': [[0, 1, 0], [1, 1, 1], [0, 1, 0]]
}

const dir_up = 0;
const dir_right = 1;
const dir_down = 2;
const dir_left = 3;

const dir_cw = 1;
const dir_ccw = 3;

const directions = [
	{ y: -1, x: 0, allowed: "7|F" },
	{ y: 0, x: 1, allowed: "J-7" },
	{ y: 1, x: 0, allowed: "L|J" },
	{ y: 0, x: -1, allowed: "F-L" }
]

function doFill(x, y, fill) {
	if (y > -1 && y < fill.length && x > -1 && x < fill[y].length && fill[y][x] === 0) {
		fill[y][x] = 2;
		doFill(x + 1, y, fill);
		doFill(x - 1, y, fill);
		doFill(x, y + 1, fill);
		doFill(x, y - 1, fill);
	}
}

export class S10 extends Solver {
	solve(input) {
		function findStart(input) {
			for (let y = 0; y < input.length; y++) {
				for (let x = 0; x < input[y].length; x++) {
					if (input[y][x] === 'S') { return { x: x, y: y }; }
				}
			}
		}

		function constructLoop(start, map, direction) {
			let current = start;
			let loop = [{ ...start, dir: direction }];
			while (true) {
				let d = directions[direction];
				let x = current.x + d.x;
				let y = current.y + d.y;
				// console.log("next step", loop, current, x, y, map, d);
				if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) { return false; }
				if (map[y][x] === 'S') { return loop; }
				let t = d.allowed.indexOf(map[y][x]);
				if (t === -1) { return false; }
				current = { x: x, y: y, dir: direction };
				direction = (direction + t + 3) % 4
				loop.push(current);
			}
		}

		function findLoop(input) {
			let start = findStart(input);
			let d = 0;
			let loop = false;
			while (!loop && d++ < 3) { loop = constructLoop(start, input, d); }
			return loop;
		}

		function findEnclosed(map, loop) {
			let fill = map.map(l => l.map(c => 0));

			loop.forEach(p => fill[p.y][p.x] = 1);
			for (let y = 0; y < fill.length; y++) {
				doFill(0, y, fill);
				doFill(fill[y].length - 1, y, fill);
			}
			for (let x = 1; x < fill[0].length; x++) {
				doFill(x, 0, fill);
				doFill(x, fill.length - 1, fill);
			}
			return fill;
		}

		function findDirection(loop, fill, map) {
			function isOutside(x, y) {
				return y < 0 || y >= fill.length || x < 0 || x >= fill[0].length || fill[y][x] === 2;
			}

			for (let i = 1; i < loop.length; i++) {
				let p = loop[i];
				if (map[p.y][p.x] === '|') {
					if (isOutside(p.x - 1, p.y)) { return p.dir === dir_up ? dir_ccw : dir_cw; }
					if (isOutside(p.x + 1, p.y)) { return p.dir === dir_up ? dir_cw : dir_ccw; }
				}
				if (map[p.y][p.x] === '-') {
					if (isOutside(p.x, p.y - 1)) { return p.dir === dir_right ? dir_ccw : dir_cw; }
					if (isOutside(p.x, p.y + 1)) { return p.dir === dir_right ? dir_cw : dir_ccw; }
				}
			}
		}

		function fillDirection(loop, fill, map, direction) {
			for (let i = 1; i < loop.length; i++) {
				let p = loop[i], d = (p.dir + direction) % 4;
				switch (map[p.y][p.x]) {
					case '|':
						if (d === dir_left) { doFill(p.x - 1, p.y, fill); }
						else { doFill(p.x + 1, p.y, fill); }
						break;
					case 'F':
						if (d === dir_left || d === dir_up) {
							doFill(p.x - 1, p.y, fill);
							doFill(p.x, p.y - 1, fill);
						}
						break;
					case '7':
						if (d === dir_right || d === dir_up) {
							doFill(p.x + 1, p.y, fill);
							doFill(p.x, p.y - 1, fill);
						}
						break;
					case 'L':
						if (d === dir_left || d === dir_down) {
							doFill(p.x - 1, p.y, fill);
							doFill(p.x, p.y + 1, fill);
						}
						break;
					case 'J':
						if (d === dir_right || d === dir_down) {
							doFill(p.x + 1, p.y, fill);
							doFill(p.x, p.y - 1, fill);
						}
						break;
					case '-':
						if (d === dir_up) { doFill(p.x, p.y - 1, fill); }
						else { doFill(p.x, p.y + 1, fill); }
						break;
					default:
						break;
				}
			}
		}

		function countEnclosed(map) {
			return map.map(l => l.filter(c => c === 0).length).reduce((a, b) => a + b);
		}

		function createBmp(input, fill) {
			let bmp = input.flatMap(l => [
				l.flatMap(c => sprites[c][0]),
				l.flatMap(c => sprites[c][1]),
				l.flatMap(c => sprites[c][2])
			]);
			for (let y = 0; y < fill.length; y++) {
				for (let x = 0; x < fill[y].length; x++) {
					if (fill[y][x] !== 0) {
						let f = fill[y][x] === 2 ? 3 : 2;
						for (let r = 0; r < 3; r++) {
							for (let c = 0; c < 3; c++) {
								if (bmp[y * 3 + r][x * 3 + c] === 0) { bmp[y * 3 + r][x * 3 + c] = f; }
							}
						}
					}
				}
			}
			return bmp;
		}

		// input = "7-F7-\n.FJ|7\nSJLL7\n|F--J\nLJ.LJ";
		// input = "FF7FSF7F7F7F7F7F---7\nL|LJ||||||||||||F--J\nFL-7LJLJ||||||LJL-77\nF--JF--7||LJLJ7F7FJ-\nL---JF-JLJ.||-FJLJJ7\n|F|F-JF---7F7-L7L|7|\n|FFJF7L7F-JF7|JL---7\n7-L-JL7||F7|L7F-7F7|\nL.L7LFJ|||||FJL7||LJ\nL7JLJL-JLJLJL--JLJ.L";
		input = input.split('\n').map(l => l.split(''));
		let loop = findLoop(input);
		let sol1 = Math.floor(loop.length / 2);
		let fill = findEnclosed(input, loop);
		let outside = findDirection(loop, fill, input);
		fillDirection(loop, fill, input, outside);
		let sol2 = countEnclosed(fill);
		let bmp = createBmp(input, fill);

		return {
			solution: `Furthest pipe: ${sol1}\nEnclosed area: ${sol2}`,
			bmp: bmp,
			renderer: new Renderer(val => colors[val], bmp[0].length, bmp.length, 1)
		};
	}
}