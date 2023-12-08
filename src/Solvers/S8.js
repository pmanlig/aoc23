// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S8 extends Solver {
	solve(input) {
		function countSteps(directions, map) {
			const start = "AAA";
			const end = "ZZZ";

			let current = start, steps = 0;
			while (current !== end) {
				current = directions[steps % directions.length] === "R" ? map[current].right : map[current].left;
				steps++;
			}

			return steps;
		}

		function countGhostSteps(directions, map) {
			function isEnd(c) { return c[2] === "Z"; }

			function findLoop(start) {
				let current = start, steps = 0;
				while (!isEnd(current)) {
					current = directions[steps % directions.length] === "R" ? map[current].right : map[current].left;
					steps++;
				}
				return steps;
			}

			let loop = Object.keys(map).filter(k => k[2] === "A").map(c => findLoop(c));
			let steps = loop[0], increment = loop[0], current = 1;
			while (current < loop.length) {
				while (steps % loop[current] !== 0) { steps += increment; }
				current++;
				increment = steps;
			}

			return steps;
		}

		// input = "RL\n\nAAA = (BBB, CCC)\nBBB = (DDD, EEE)\nCCC = (ZZZ, GGG)\nDDD = (DDD, DDD)\nEEE = (EEE, EEE)\nGGG = (GGG, GGG)\nZZZ = (ZZZ, ZZZ)"
		// input = "LLR\n\nAAA = (BBB, BBB)\nBBB = (AAA, ZZZ)\nZZZ = (ZZZ, ZZZ)";
		let directions = input.match(/^([RL]+)/)[0].split('');
		let map = {}
		input.split('\n').slice(2).map(l => l.match(/^([A-Z]+) = \(([A-Z]+), ([A-Z]+)\)/).slice(1)).forEach(m => {
			// console.log("parsing", m);
			map[m[0]] = {
				left: m[1],
				right: m[2]
			}
		});
		// console.log(directions, map);

		let sol1 = countSteps(directions, map);
		let sol2 = countGhostSteps(directions, map);

		return { solution: `Steps: ${sol1}\nGhost steps: ${sol2}` };
	}
}