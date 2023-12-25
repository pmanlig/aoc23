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

function willHit(input, x0, dtt, dtd) {
	let t = ((x0 - input.x) / (input.dx - dtt / dtd));
	return t >= 0 && t % 1 === 0;
}

function findTrajectory(input, v, dv) {
	input.sort((a, b) => Math.abs(b[dv]) - Math.abs(a[dv]));
	if (v === "x") { console.log([...input]); }
	for (let t1 = 0; t1 < 10; t1++) {
		let x1 = input[0][v] + t1 * input[0][dv];
		if (v === "x" && t1 === 5) { console.log("Examinging t=5", input[0], v, dv); }
		if (v === "x" && t1 === 5) { console.log("Examinging t=5", x1, input[0][v], t1 * input[0][dv]); }
		for (let t2 = 0; t2 < 10; t2++) {
			let x2 = input[1][v] + t2 * input[1][dv];
			let dtt = x2 - x1, dtd = t2 - t1;
			let x0 = x1 - t1 * dtt / dtd;
			if (v === "x" && t1 === 5 && t2 === 4) {
				console.log("Examining t=4", x2);
				console.log("Correct solution", x0, dtt / dtd);
			}
			if (x0 % 1 === 0 && input.slice(2).every(i => willHit(i, x0, dtt, dtd))) {
				if (v === "x") {
					console.log("Found solution", t1, t2, x0, dtt / dtd);
					console.log(input.slice(2).map(i => ((x0 - i.x) / (i.dx - dtt / dtd))));
				}
				return x0;
			}
		}
	}
}

function targetSolution(input) {
	let sol = { x: 0, y: 0, z: 0 }
	sol.x = findTrajectory(input, "x", "dx");
	sol.y = findTrajectory(input, "y", "dy");
	sol.z = findTrajectory(input, "z", "dz");
	console.log(sol);
	return sol;
}

export class S24 extends Solver {
	solve(input) {
		let test = "19, 13, 30 @ -2,  1, -2\n18, 19, 22 @ -1, -1, -2\n20, 25, 34 @ -2, -2, -4\n12, 31, 28 @ -1, -2, -1\n20, 19, 15 @  1, -5, -3";
		test = Hailstone.listFromInput(test);
		let test1 = intersections(test);
		console.log(2 === test1.filter(i => validate(i, 7, 27)).length ? "Test passed" : "Test FAILED");
		let test2 = targetSolution(test);
		console.log(47 === test2.x + test2.y + test2.z);

		input = Hailstone.listFromInput(input);
		let int = intersections(input);
		let sol1 = int.filter(i => validate(i, 200000000000000, 400000000000000)).length;

		return { solution: `Number of intersections: ${sol1}` };
	}
}