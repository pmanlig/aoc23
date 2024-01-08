// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

// eslint-disable-next-line
Array.prototype.sum = function () { return this.reduce((a, b) => a + b, 0); }

function parse(input) {
	let components = {};
	let connections = [];
	input.split('\n').forEach(l => {
		let x = l.match(/([a-z]+)/g);
		components[x[0]] = {};
		for (let i = 1; i < x.length; i++) {
			components[x[i]] = {};
			connections.push({ a: x[0], b: x[i] });
		}
	});
	return {
		components: Object.keys(components),
		connections: connections
	};
}

function findConnected(components, connections) {
	let a = {}
	for (let add = [components[0]]; add.length > 0;) {
		let x = add.pop();
		a[x] = {};
		connections.filter(c => c.a === x || c.b === x).forEach(c => {
			let n = c.a === x ? c.b : c.a;
			if (!a[n]) {
				a[n] = {}
				add.push(n);
			}
		});
	}
	return a;
}

function validSolution(components, connections) {
	let a = findConnected(components, connections);
	let b = findConnected(components.filter(x => !a[x]), connections);
	if (Object.keys(a).length + Object.keys(b).length === components.length) {
		return Object.keys(a).length * Object.keys(b).length;
	}
	return 0;
}

function findDisconnect({ components, connections }) {
	for (let i = 0; i < connections.length; i++) {
		for (let j = i + 1; j < connections.length; j++) {
			for (let k = j + 1; k < connections.length; k++) {
				let x = validSolution(components, connections.filter((c, x) => x !== i && x !== j && x !== k));
				if (x > 0) { return x; }
			}
		}
	}
	return 0;
}

function findPath(comp, group, cx) {
	let shorts = { comp: 0 }
	let paths = [[comp]];
	while (paths.length > 0) {
		let p = paths.pop();
		let last = p[p.length - 1];
		if (group.indexOf(last) !== -1) { return p; }
		let steps = cx[last];
		steps.forEach(s => {
			if (!shorts[s] || shorts[s] > p.length) {
				shorts[s] = p.length;
				paths.push([...p, s]);
			}
		});
		paths.sort((a, b) => b.length - a.length);
	}
	return null;
}

function fourPaths(comp, group, connections) {
	let paths = [], cx = {};
	connections.forEach(c => {
		if (!cx[c.a]) { cx[c.a] = []; }
		if (!cx[c.b]) { cx[c.b] = []; }
		cx[c.a].push(c.b);
		cx[c.b].push(c.a);
	});
	while (paths.length < 4) {
		let p = findPath(comp, group, cx);
		if (null === p) { return false; }
		paths.push(p);
		for (let i = 1; i < p.length; i++) {
			cx[p[i - 1]] = cx[p[i - 1]].filter(x => x !== p[i]);
			cx[p[i]] = cx[p[i]].filter(x => x !== p[i - 1]);
		}
	}
	return true;
}

// eslint-disable-next-line
function groupComponents(connections) {
	let components = [...new Set(connections.flatMap(c => [c.a, c.b]))];
	let groupA = [components[0]];
	let groupB = [];
	components = components.slice(1);
	while (components.length > 0) {
		let c = components.pop();
		if (fourPaths(c, groupA, connections)) {
			groupA.push(c);
		} else {
			groupB.push(c);
		}
	}
	return groupA.length * groupB.length;
}

// eslint-disable-next-line
function logStats(connections) {
	let m = {}
	connections.forEach(c => {
		if (!m[c.a]) m[c.a] = [];
		if (!m[c.b]) m[c.b] = [];
		m[c.a].push(c.b);
		m[c.b].push(c.a);
	});
	let stats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	Object.values(m).forEach(v => stats[v.length]++);
	console.log(stats.join(','));
}

function timeFrom(start) {
	let span = Date.now() - start;

	return `${Math.floor(span / 60 / 1000)}:${(Math.floor(span / 1000) % 60).toString().padStart(2, '0')}`
}

export class S25 extends Solver {
	setup(input) {
		let test = "jqt: rhn xhk nvd\nrsh: frs pzl lsr\nxhk: hfx\ncmg: qnr nvd lhk bvb\nrhn: xhk bvb hfx\nbvb: xhk hfx\npzl: lsr hfx nvd\nqnr: nvd\nntq: jqt hfx bvb xhk\nnvd: lhk\nlsr: lhk\nrzs: qnr cmg lsr rsh\nfrs: qnr lhk lsr";
		test = parse(test);
		console.log(54 === findDisconnect(test) ? "Test passed" : "Test FAILED");
		console.log(54 === groupComponents(test.connections) ? "Test passed" : "Test FAILED");
		console.log(fourPaths("xhk", ["cmg"], test.connections) ? "Four paths found" : "CANNOT find four paths");
		console.log(fourPaths("xhk", ["bvb"], test.connections) ? "Four paths found" : "CANNOT find four paths");
		console.log(fourPaths("xhk", ["hfx"], test.connections) ? "Four paths found" : "CANNOT find four paths");
		console.log(fourPaths("xhk", ["jqt"], test.connections) ? "Four paths found" : "CANNOT find four paths");
		console.log(fourPaths("xhk", ["ntq"], test.connections) ? "Four paths found" : "CANNOT find four paths");

		this.input = parse(input);
		this.components = [...new Set(this.input.connections.flatMap(c => [c.a, c.b]))];
		this.groupA = [this.components[0]];
		this.groupB = [];
		this.components = this.components.slice(1);
		this.setState({ solution: `Calculating groups... ${this.components.length} components remaining\nTime: 0:00` });
		this.start = Date.now();
	}

	solve() {
		let batch = 5;
		while (batch-- > 0 && this.components.length > 0) {
			let c = this.components.pop();
			if (fourPaths(c, this.groupA, this.input.connections)) {
				this.groupA.push(c);
			} else {
				this.groupB.push(c);
			}
		}
		if (this.components.length === 0) {
			return { solution: `Product of group sizes: ${this.groupA.length * this.groupB.length}` };
		}
		this.setState({ solution: `Calculating groups... ${this.components.length} components remaining\nTime: ${timeFrom(this.start)}` });
	}
}