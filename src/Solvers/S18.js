// import React from 'react';
import { Renderer, drawFilledRect, drawLine } from '../util';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

// eslint-disable-next-line
Array.prototype.sum = function () { return this.reduce((a, b) => a + b, 0); }

class DigRenderer extends Renderer {
	constructor(map) {
		super(x => x === 0 ? "#000000" : x, map[0].length, map.length, Math.max(1, Math.floor(600 / map.length)));
	}
}

const debug_vertical = 59;

class TrueRenderer extends Renderer {
	constructor(width, height, lines, holes) {
		super(null, width, height, 1);
		this.lines = lines;
		this.holes = holes;
		this.x = Math.min(...lines.map(l => l.fromX));
		this.scaleWidth = Math.max(...lines.map(l => l.toX)) - this.x;
		this.y = Math.min(...lines.map(l => l.fromY));
		this.scaleHeight = Math.max(...lines.map(l => l.toY)) - this.y;
	}

	draw(ctx) {
		ctx.strokeStyle = "#CFFFCF";
		ctx.fillStyle = "#CFFFCF";
		ctx.lineWidth = 1;
		this.holes.hole.forEach(h => {
			drawFilledRect(ctx,
				((h.x0 - this.x) / this.scaleWidth) * this.width,
				((h.y0 - this.y) / this.scaleHeight) * this.height,
				((h.x1 - this.x) / this.scaleWidth) * this.width,
				((h.y1 - this.y) / this.scaleHeight) * this.height);
		});
		ctx.strokeStyle = "#CFCFCF";
		ctx.fillStyle = "#CFCFCF";
		this.holes.partials.forEach(h => {
			drawFilledRect(ctx,
				((h.x0 - this.x) / this.scaleWidth) * this.width,
				((h.y0 - this.y) / this.scaleHeight) * this.height,
				this.width,
				((h.y1 - this.y) / this.scaleHeight) * this.height);
		});
		ctx.strokeStyle = "#FF7F7F";
		this.lines.forEach(l => {
			drawLine(ctx,
				((l.fromX - this.x) / this.scaleWidth) * this.width,
				((l.fromY - this.y) / this.scaleHeight) * this.height,
				((l.toX - this.x) / this.scaleWidth) * this.width,
				((l.toY - this.y) / this.scaleHeight) * this.height);
		});
		let verticals = this.lines.filter(a => a.fromX === a.toX).sort((a, b) => a.fromX - b.fromX);
		ctx.strokeStyle = "#0F0FFF";
		verticals.slice(debug_vertical - 1, debug_vertical).forEach(l => {
			drawLine(ctx,
				((l.fromX - this.x) / this.scaleWidth) * this.width,
				((l.fromY - this.y) / this.scaleHeight) * this.height,
				((l.toX - this.x) / this.scaleWidth) * this.width,
				((l.toY - this.y) / this.scaleHeight) * this.height);
		});
	}
}

// eslint-disable-next-line
const up = 0;
// eslint-disable-next-line
const right = 1;
// eslint-disable-next-line
const down = 2;
// eslint-disable-next-line
const left = 3;

// eslint-disable-next-line
const delta = [
	{ x: 0, y: -1 },
	{ x: 1, y: 0 },
	{ x: 0, y: 1 },
	{ x: -1, y: 0 }
];

const directions = {
	U: 0,
	R: 1,
	D: 2,
	L: 3
}

class Instruction {
	constructor(direction, distance, rgb) {
		this.direction = directions[direction];
		this.distance = parseInt(distance, 10);
		this.rgb = rgb;
	}
}

function parse(input) {
	return input.split('\n').map(l => l.match(/^([RLUD]) (\d+) \((#[0-9a-f]+)\)/).slice(1)).map(l => new Instruction(...l));
}

function connect(input) {
	let x = 0, y = 0;
	for (let i = 0; i < input.length; i++) {
		input[i].x = x;
		input[i].y = y;
		let d = input[i].distance;
		while (d-- > 0) {
			x += delta[input[i].direction].x;
			y += delta[input[i].direction].y;
		}
	}
}

function input2bmp(input) {
	let x0 = Math.min(...input.map(i => i.x));
	let y0 = Math.min(...input.map(i => i.y));
	let w = Math.max(...input.map(i => i.x)) - x0 + 1;
	let h = Math.max(...input.map(i => i.y)) - y0 + 1;
	let bmp = [];
	for (let r = 0; r < h; r++) {
		bmp[r] = [];
		for (let c = 0; c < w; c++) {
			bmp[r][c] = 0;
		}
	}
	for (let i = 0; i < input.length; i++) {
		let x = input[i].x - x0;
		let y = input[i].y - y0;
		let d = input[i].distance;
		while (d-- > 0) {
			x += delta[input[i].direction].x;
			y += delta[input[i].direction].y;
			bmp[y][x] = input[i].rgb;
		}
	}
	return bmp;
}

function fill(bmp, x, y) {
	let queue = [{ x: x, y: y }];
	while (queue.length > 0) {
		let c = queue.pop();
		if (c.x > -1 && c.y > -1 && c.y < bmp.length && c.x < bmp[c.y].length && bmp[c.y][c.x] === 0) {
			bmp[c.y][c.x] = "#FFFFFF";
			for (let i = 0; i < 4; i++) {
				queue.push({ x: c.x + delta[i].x, y: c.y + delta[i].y });
			}
		}
	}
}

function finalize(bmp) {
	for (let x = 0; x < bmp[0].length; x++) {
		fill(bmp, x, 0);
		fill(bmp, x, bmp.length - 1);
	}
	for (let y = 0; y < bmp.length; y++) {
		fill(bmp, 0, y);
		fill(bmp, bmp[y].length - 1, y);
	}
}

function count(bmp) {
	return bmp.flat().map(c => c === "#FFFFFF" ? 0 : 1).reduce((a, b) => a + b);
}

function adjust(i, x, y) {
	let exDist = parseInt(i.rgb.slice(1, 6), 16);
	let exDir = (parseInt(i.rgb.slice(6), 16) + 3) % 4;
	let x1 = x + delta[exDir].x * exDist;
	let y1 = y + delta[exDir].y * exDist;
	i.exDir = exDir;
	i.exDist = exDist;
	i.fromX = Math.min(x, x1);
	i.fromY = Math.min(y, y1);
	i.toX = Math.max(x, x1);
	i.toY = Math.max(y, y1);
}

function adjustInput(input) {
	let x = 0, y = 0;
	for (let i = 0; i < input.length; i++) {
		adjust(input[i], x, y);
		x += delta[input[i].exDir].x * input[i].exDist;
		y += delta[input[i].exDir].y * input[i].exDist;
	}
}

class Rectangle {
	constructor(x0, x1, y0, y1) {
		this.x0 = x0;
		this.x1 = x1;
		this.y0 = y0;
		this.y1 = y1;
	}

	overlap(seg) {
		return (this.y0 <= seg.fromY && this.y1 > seg.fromY) ||
			(this.y0 < seg.toY && this.y1 >= seg.toY) ||
			(this.y0 >= seg.fromY && this.y0 < seg.toY) ||
			(this.y1 > seg.fromY && this.y1 <= seg.toY);
	}

	area() {
		return (this.x1 - this.x0 + 1) * (this.y1 - this.y0 + 1);
	}
}

function exclude(n, p) {
	if (p.y1 >= n.y1 && p.y0 <= n.y0) { return []; }
	let res = [];
	if (p.y1 >= n.y0 && p.y1 < n.y1) { res.push(new Rectangle(n.x0, undefined, p.y1 + 1, n.y1)); }
	if (p.y0 > n.y0 && p.y0 <= n.y1) { res.push(new Rectangle(n.x0, undefined, n.y0, p.y0 - 1)); }
	return res;
}

function newPartials(line, partials) {
	let res = [new Rectangle(line.fromX, undefined, line.fromY, line.toY)];
	partials.forEach(p => {
		res = res.flatMap(n => exclude(n, p));
	});
	return res;
}

function close(line, p) {
	if (line.fromY >= p.y1 || line.toY <= p.y0) { return [p]; }
	p.x1 = line.fromX;
	let res = [p];
	if (line.fromY > p.y0) {
		res.push(new Rectangle(p.x0, undefined, p.y0, line.fromY + 1));
		p.y0 = line.fromY + 1;
	}
	if (line.toY < p.y1) {
		res.push(new Rectangle(p.x0, undefined, line.toY - 1, p.y1));
		p.y1 = line.toY - 1;
	}

	return res;
}

function closePartials(line, partials) {
	return partials.flatMap(p => close(line, p));
}

function trueCount(input) {
	// return trueCount2(input);
	// eslint-disable-next-line
	adjustInput(input);

	let verticals = input.filter(a => a.fromX === a.toX).sort((a, b) => a.fromX - b.fromX);
	// console.log("Vertical lines", verticals);
	// let horizontals = input.filter(a => a.fromY === a.toY).sort((a, b) => a.fromY - b.fromY);
	let partials = [];
	let hole = [];

	let maxLine = debug_vertical;

	for (let v = 0; v < verticals.length && maxLine-- > 0; v++) {
		let _debug = maxLine === 0;
		if (_debug) console.log("Debugging segment #", v);
		let s = verticals[v];
		if (_debug) console.log("Vertical", s);
		let overlaps = partials.filter(x => x.overlap(s));
		if (_debug) console.log("Overlaps", overlaps);
		let newPart = newPartials(s, partials.filter(x => x.overlap(s)));
		if (_debug) console.log("New partials", newPart);
		partials = closePartials(s, partials).concat(newPart);
		hole = hole.concat(partials.filter(p => p.x1 !== undefined));
		partials = partials.filter(p => p.x1 === undefined);
		// if (maxLine === 0) { partials = newPart; }
		/*
		if (_debug) console.log("New partials", newPart);
		partials = partials.filter(x => !x.overlap(s));
		// for (let w = partials.find(x => x.overlap(s)); w !== undefined; w = partials.find(x => x.overlap(s)))
		if (_debug) console.log("Overlaps", [...overlaps]);
		let excludes = [];
		while (overlaps.length > 0) {
			let x = overlaps.pop();
			if (s.fromX > x.x0) {
				let common = new Rectangle(x.x0, s.fromX,
					s.fromY === x.y0 ? x.y0 : Math.max(s.fromY + 1, x.y0),
					s.toY === x.y1 ? x.y1 : Math.min(s.toY - 1, x.y1));
				if (_debug) console.log("matching rectangle", common);
				if (isNaN(common.y1)) {
					if (_debug) console.log("NaN found", s, x);
				}
				hole.push(common);
				excludes.push(common);
				if (common.y1 < x.y1) {
					if (_debug) console.log("Adding partial #1", common, x);
					partials.push(new Rectangle(x.x0, undefined, common.y1 + 1, x.y1));
				}
				if (common.y0 > x.y0) {
					if (_debug) console.log("Adding partial #2");
					partials.push(new Rectangle(x.x0, undefined, x.y0, common.y0 - 1));
				}
			}
		}
		excludes = excludes.concat(partials).sort((a, b) => a.y0 - b.y0);
		if (excludes.length > 0) {
			if (_debug) console.log("Excluding", [...excludes]);
			if (s.fromY < excludes[0].y0) {
				if (_debug) console.log("Adding partial #3");
				partials.push(new Rectangle(s.fromX, undefined, s.fromY, excludes[0].y0 - 1));
			}
			if (s.toY > excludes[excludes.length - 1].y1) {
				if (_debug) console.log("Adding partial #4", s, excludes[excludes.length - 1]);
				partials.push(new Rectangle(s.fromX, undefined, excludes[excludes.length - 1].y1 + 1, s.toY));
			}
			for (let n = 1; n < excludes.length; n++) {
				let n0 = excludes[n - 1];
				let n1 = excludes[n];
				if (n0.y1 < n.y0 - 1) {
					if (_debug) console.log("Adding partial #5");
					partials.push(new Rectangle(s.fromX, undefined, n0.y1 + 1, n1.y0 - 1));
				}
			}
		} else {
			if (_debug) console.log("Adding partial #6");
			partials.push(new Rectangle(s.fromX, undefined, s.fromY, s.toY));
		}
		*/
		if (_debug) {
			console.log(`Processed vertical y0: ${s.fromY} y1: ${s.toY} x0: ${s.fromX}`);
			console.log("partials", [...partials]);
			console.log("hole", [...hole]);
		}
	}

	if (partials.length > 0) { console.log("ERROR - partials", partials); }

	// return hole.map(h => h.area()).sum();
	return { hole: hole, partials: partials };
}

export class S18 extends Solver {
	solve(input) {
		let test = "R 6 (#70c710)\nD 5 (#0dc571)\nL 2 (#5713f0)\nD 2 (#d2c081)\nR 2 (#59c680)\nD 2 (#411b91)\nL 5 (#8ceee2)\nU 2 (#caa173)\nL 1 (#1b58a2)\nU 2 (#caa171)\nR 2 (#7807d2)\nU 3 (#a77fa3)\nL 2 (#015232)\nU 2 (#7a21e3)";
		test = parse(test);
		connect(test);
		let testBmp = input2bmp(test);
		finalize(testBmp);
		console.log(count(testBmp) === 62 ? "Test passed" : "Test FAILED");
		// let testVolume = trueCount(test).hole.map(h => h.area()).sum();
		// console.log(testVolume, testVolume - 952408144115, testVolume === 952408144115 ? "Test passed" : "Test FAILED");

		input = parse(input);
		connect(input);
		let bmp = input2bmp(input);
		finalize(bmp);
		let sol1 = count(bmp);
		let holes = trueCount(input);
		let sol2 = holes.hole.map(h => h.area()).sum();
		// eslint-disable-next-line
		let digRenderer = new DigRenderer(bmp);
		let trueRenderer = new TrueRenderer(800, 600, input, holes);

		return {
			solution: `Trench will hold ${sol1} cubic meters of lava\n\
			When instructions are corrected, the trench now holds ${sol2} cubic meters of lava`,
			bmp: bmp, renderer: trueRenderer
		};
	}
}