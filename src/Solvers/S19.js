// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

// eslint-disable-next-line
Array.prototype.sum = function () { return this.reduce((a, b) => a + b) }
// eslint-disable-next-line
Array.prototype.mul = function () { return this.reduce((a, b) => a * b) }

function valid(cond, i) {
	if (cond[1] === '>') {
		return i > parseInt(cond.slice(2), 10);
	} else {
		return i < parseInt(cond.slice(2), 10);
	}
}

function varCombinations(conditions, max) {
	let count = 0;
	for (let i = 1; i <= max; i++) {
		if (conditions.every(c => valid(c, i))) { count++; }
	}
	return count;
}

function numCombinations(p, max) {
	try {
		return ['x', 'm', 'a', 's'].map(v => varCombinations(p.condition.filter(c => c !== null && c[0] === v), max)).mul();
	} catch (e) {
		console.log(p);
		throw e;
	}
}

class Rule {
	constructor(condition, destination) {
		this.condition = condition;
		if (null === condition) {
			this.eval = () => destination;
		} else {
			let op = condition.indexOf('>') > -1 ? '>' : '<';
			this.eval = op === '>' ? this.greater_than : this.less_than;
			condition = condition.split(op);
			this.attrib = condition[0];
			this.value = parseInt(condition[1], 10);
		}
		this.destination = destination;
	}

	greater_than(part) {
		return part[this.attrib] > this.value && this.destination;
	}

	less_than(part) {
		return part[this.attrib] < this.value && this.destination;
	}

	static fromInput(input) {
		return input.indexOf(':') === -1 ? new Rule(null, input) : new Rule(...input.split(':'));
	}
}

function negate(condition) {
	let x = condition.match(/([xmas])([<>])(\d+)/).slice(1);
	x[1] = x[1] === '>' ? '<' : '>';
	x[2] = parseInt(x[2], 10) + (x[1] === '>' ? -1 : 1);
	return x.join('')
}

class Workflow {
	constructor(id, rules) {
		this.id = id;
		this.rules = rules.split(',').map(r => Rule.fromInput(r));
	}

	eval(part) {
		for (let r = 0; r < this.rules.length; r++) {
			let res = this.rules[r].eval(part);
			if (res) { return res; }
		}
	}

	tree(precon) {
		let paths = [];
		for (let i = 0; i < this.rules.length; i++) {
			let r = this.rules[i];
			paths.push({
				condition: [...precon, r.condition],
				destination: r.destination
			});
			if (r.condition !== null) {
				precon = [...precon, negate(r.condition)];
			}
		}
		return paths;
	}
}

class Part {
	constructor(x, m, a, s) {
		this.x = x;
		this.m = m;
		this.a = a;
		this.s = s;
		this.rating = x + m + a + s;
	}
}

class Input {
	constructor(workflows, parts) {
		this.workflows = workflows;
		this.parts = parts;
	}

	eval(part) {
		let dest = "in";
		while (dest !== 'A' && dest !== 'R') {
			dest = this.workflows[dest].eval(part);
		}
		return dest;
	}

	calc() {
		return this.parts.filter(p => this.eval(p) === 'A').map(p => p.rating).sum();
	}

	combinations() {
		let paths = this.workflows.in.tree([]);
		let complete = [];
		while (paths.length > 0) {
			let p = paths.pop();
			switch (p.destination) {
				case 'R':
					continue;
				case 'A':
					complete.push(p);
					break;
				default:
					paths = paths.concat(this.workflows[p.destination].tree(p.condition));
					break;
			}
		}
		return complete.map(p => numCombinations(p, 4000)).sum();
	}
}

function parseRules(input) {
	let graph = {}
	input.forEach(w => {
		let x = new Workflow(...w.match(/^([a-z]+){([^}]+)}/).slice(1))
		graph[x.id] = x;
	})
	return graph;
}

function parsePart(input) {
	return new Part(...input.match(/^{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/).slice(1).map(n => parseInt(n, 10)));
}

function parse(input) {
	input = input.split("\n\n").map(p => p.split('\n'));

	return new Input(parseRules(input[0]), input[1].map(l => parsePart(l)));
}

export class S19 extends Solver {
	solve(input) {
		let test = "px{a<2006:qkq,m>2090:A,rfg}\npv{a>1716:R,A}\nlnx{m>1548:A,A}\nrfg{s<537:gd,x>2440:R,A}\nqs{s>3448:A,lnx}\nqkq{x<1416:A,crn}\ncrn{x>2662:A,R}\nin{s<1351:px,qqz}\nqqz{s>2770:qs,m<1801:hdj,R}\ngd{a>3333:R,R}\nhdj{m>838:A,pv}\n\n{x=787,m=2655,a=1222,s=2876}\n{x=1679,m=44,a=2067,s=496}\n{x=2036,m=264,a=79,s=2244}\n{x=2461,m=1339,a=466,s=291}\n{x=2127,m=1623,a=2188,s=1013}";
		test = parse(test);
		let test1 = test.calc();
		console.log(test1, test1 === 19114 ? "Test passed" : "Test FAILED");
		let test2 = test.combinations();
		console.log(test2, test2 === 167409079868000 ? "Test passed" : "Test FAILED");

		input = parse(input);

		let sol1 = input.calc();
		let sol2 = input.combinations();

		return { solution: `The sum of all accepted parts is ${sol1}\nThe total number of possible combinations is: ${sol2}` };
	}
}