// import React from 'react';
import { Renderer } from '../util';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

const up = 0;
const right = 1;
const down = 2;
const left = 3;

const delta = [
	{ x: 0, y: -1 },
	{ x: 1, y: 0 },
	{ x: 0, y: 1 },
	{ x: -1, y: 0 }
]

const mirror_slash = [right, up, left, down];
const mirror_backslash = [left, down, right, up];
const splitter_pipe = [[up], [up, down], [down], [up, down]];
const splitter_dash = [[left, right], [right], [left, right], [left]];

function energize(input, initial) {
	let e = input.map(l => l.map(c => 0));
	let light = [initial];
	let history = [];
	while (light.length > 0) {
		let l = light[light.length - 1];
		if (l.x === -1 || l.x === input[0].length || l.y === -1 || l.y === input.length) {
			light.pop();
			continue;
		}
		if (history.some(h => h.x === l.x && h.y === l.y && h.dir === l.dir)) {
			light.pop();
			continue;
		} else {
			history.push({ ...l });
		}
		e[l.y][l.x] = 1;
		switch (input[l.y][l.x]) {
			case '.':
				l.x += delta[l.dir].x;
				l.y += delta[l.dir].y;
				break;
			case '/':
				l.dir = mirror_slash[l.dir];
				l.x += delta[l.dir].x;
				l.y += delta[l.dir].y;
				break;
			case '\\':
				l.dir = mirror_backslash[l.dir];
				l.x += delta[l.dir].x;
				l.y += delta[l.dir].y;
				break;
			case '-':
				light.pop();
				splitter_dash[l.dir].forEach(d => {
					light.push({ x: l.x + delta[d].x, y: l.y + delta[d].y, dir: d });
				});
				break;
			case '|':
				light.pop();
				splitter_pipe[l.dir].forEach(d => {
					light.push({ x: l.x + delta[d].x, y: l.y + delta[d].y, dir: d });
				});
				break;
			default:
				console.log("Error!");
				break;
		}
	}
	return e;
}

const colors = {
	0: "#7F7F7F",
	1: "#FFFF7F",
	'.': "#7F7F7F",
	'/': "#000000",
	'\\': "#000000",
	'-': "#000000",
	'|': "#000000"
}

class Ray {
	constructor(x, y, dir) {
		this.x = x;
		this.y = y;
		this.dir = dir;
	}
}

export class S16 extends Solver {
	setup(input) {
		// input = ".|...\\....\n|.-.\\.....\n.....|-...\n........|.\n..........\n.........\\\n..../.\\\\..\n.-.-/..|..\n.|....-|.\\\n..//.|....";

		this.input = input.split('\n').map(l => l.split(''));
		let bmp = energize(this.input, new Ray(0, 0, right));

		// eslint-disable-next-line
		this.renderer = new Renderer(val => colors[val], bmp[0].length, bmp.length, 5);
		this.sol1 = bmp.flat().reduce((a, b) => a + b);

		this.max = { bmp: bmp, num: this.sol1 };
		this.r = 0;
		this.c = 0;
		this.setState({ solution: `# of energized tiles: ${this.sol1}\nMax energized tiles: ${this.max.num}\nCalculating...`, bmp: this.max.bmp, renderer: this.renderer });
	}

	solve(input) {
		const cmp = (ray) => {
			let a = energize(this.input, ray);
			let b = a.flat().reduce((a, b) => a + b);
			if (b > this.max.num) { this.max = { bmp: a, num: b }; }
		}

		if (this.r < this.input.length) {
			cmp(new Ray(0, this.r, right));
			cmp(new Ray(this.input[this.r].length - 1, this.r, left));
			this.r++;
		}
		if (this.c < this.input[0].length) {
			cmp(new Ray(this.c, 0, down));
			cmp(new Ray(this.c, this.input.length - 1, up));
			this.c++;
		}
		if (this.r === this.input.length && this.c === this.input[0].length) {
			return { solution: `# of energized tiles: ${this.sol1}\nMax energized tiles: ${this.max.num}`, bmp: this.max.bmp, renderer: this.renderer };
		}

		this.setState({ solution: `# of energized tiles: ${this.sol1}\nMax energized tiles: ${this.max.num}\nCalculating... ${this.r}-${this.c}`, bmp: this.max.bmp, renderer: this.renderer });
	}
}