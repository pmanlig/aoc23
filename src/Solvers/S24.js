// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

class Hailstone {
	constructor(x, y, z, dx, dy, dz) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.dx = dx;
		this.dy = dy;
		this.dz = dz;
	}

	normalize() {
		this.d = this.dy / this.dx;
		this.n = this.y - this.x * this.d;
	}

	isFuture(x) {
		return x < this.x ?
			this.dx < 0 :
			this.dx > 0;
	}

	static listFromInput(input) {
		return input.split('\n').map(l => Hailstone.fromInput(l));
	}

	static fromInput(input) {
		try {
			return new Hailstone(...input.match(/^(\d+),\s+(\d+),\s+(\d+)\s+@\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)/).slice(1).map(n => parseInt(n, 10)));
		} catch (e) {
			console.log("Error", input);
			return null;
		}
	}
}

function intersect(a, b) {
	if (a.d === b.d) { return null; }
	let x = (b.n - a.n) / (a.d - b.d);
	return { x: x, y: a.n + a.d * x }
}

// eslint-disable-next-line
function intersections(hailstones) {
	let res = [];
	hailstones.forEach(h => h.normalize());
	for (let i = 0; i < hailstones.length; i++) {
		for (let j = i + 1; j < hailstones.length; j++) {
			let c = intersect(hailstones[i], hailstones[j]);
			if (null !== c) { res.push({ x: c.x, y: c.y, a: hailstones[i], b: hailstones[j] }); }
		}
	}
	return res;
}

function validate(int, from, to) {
	if (int.x < from || int.x > to || int.y < from || int.y > to) { return false; }
	if (!int.a.isFuture(int.x)) { return false; }
	if (!int.b.isFuture(int.x)) { return false; }
	return true;
}

function willHit(input, x0, y0, z0, dxt, dyt, dzt, dt) {
	let t = ((x0 - input.x) / (input.dx - dxt / dt));
	return t >= 0 && t % 1 === 0 && y0 + t * dyt / dt === input.y + t * input.dy && z0 + t * dzt / dt === input.z + t * input.dz;
}

function maxTime(a, min, max) {
	return Math.max(
		a.dx > 0 ? (max - a.x) / a.dx : (min - a.x) / a.dx,
		a.dy > 0 ? (max - a.y) / a.dy : (min - a.y) / a.dy,
		a.dz > 0 ? (max - a.z) / a.dz : (min - a.z) / a.dz);
}

function findTrajectory(input, min, max) {
	let maxT = maxTime(input[0], min, max);
	console.log("Max time: ", maxT);
	for (let t1 = 0; t1 <= maxT; t1++) {
		let x1 = input[0].x + t1 * input[0].dx;
		let y1 = input[0].y + t1 * input[0].dy;
		let z1 = input[0].z + t1 * input[0].dz;
		for (let t2 = 0; t2 <= maxT; t2++) {
			let x2 = input[1].x + t2 * input[1].dx;
			let y2 = input[1].y + t2 * input[1].dy;
			let z2 = input[1].z + t2 * input[1].dz;
			let dt = t2 - t1;
			let dxt = x2 - x1;
			let dyt = y2 - y1;
			let dzt = z2 - z1;
			let x0 = x1 - t1 * dxt / dt;
			let y0 = y1 - t1 * dyt / dt;
			let z0 = z1 - t1 * dzt / dt;
			if (x0 % 1 === 0 && input.slice(2).every(i => willHit(i, x0, y0, z0, dxt, dyt, dzt, dt))) {
				return { x: x0, y: y0, z: z0 };
			}
		}
	}
}

export class S24 extends Solver {
	solve(input) {
		let test = "19, 13, 30 @ -2,  1, -2\n18, 19, 22 @ -1, -1, -2\n20, 25, 34 @ -2, -2, -4\n12, 31, 28 @ -1, -2, -1\n20, 19, 15 @  1, -5, -3";
		test = Hailstone.listFromInput(test);
		let test1 = intersections(test);
		console.log(2 === test1.filter(i => validate(i, 7, 27)).length ? "Test passed" : "Test FAILED");
		let test2 = findTrajectory(test, 7, 27);
		console.log(47 === test2.x + test2.y + test2.z ? "Test passed" : "Test FAILED");

		input = Hailstone.listFromInput(input);
		let int = intersections(input);
		let sol1 = int.filter(i => validate(i, 200000000000000, 400000000000000)).length;
		let sol2 = findTrajectory(input, 200000000000000, 400000000000000);

		return { solution: `Number of intersections: ${sol1}\nLaunch coordinate sum: ${sol2.x + sol2.y + sol2.z}` };
	}
}