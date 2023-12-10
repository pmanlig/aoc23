// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S9 extends Solver {
	solve(input) {
		function extrapolate(vals) {
			let extra = [vals];
			let lev = 0;
			while (extra[lev].some(x => x !== 0)) {
				extra.push([]);
				for (let i = 1; i < extra[lev].length; i++) {
					extra[lev + 1].push(extra[lev][i] - extra[lev][i - 1]);
				}
				lev++;
			}
			extra[lev--].push(0);
			while (lev >= 0) {
				extra[lev].push(extra[lev + 1].pop() + extra[lev].pop());
				lev--;
			}
			return extra[0].pop();
		}

		function backpolate(vals) {
			let extra = [vals];
			let lev = 0;
			while (extra[lev].some(x => x !== 0)) {
				extra.push([]);
				for (let i = 1; i < extra[lev].length; i++) {
					extra[lev + 1].push(extra[lev][i] - extra[lev][i - 1]);
				}
				lev++;
			}
			let back = 0;
			while (--lev >= 0) {
				back = extra[lev][0] - back;
			}
			return back;
		}

		// input = "0 3 6 9 12 15\n1 3 6 10 15 21\n10 13 16 21 30 45";
		input = input.split('\n').map(l => l.split(' ').map(n => parseInt(n, 10)));

		// console.log(input);

		let sol1 = input.map(l => extrapolate(l)).reduce((a, b) => a + b);
		let sol2 = input.map(l => backpolate(l)).reduce((a, b) => a + b);
		return { solution: `Extrapolated values: ${sol1}\nBackwards extrapolated values: ${sol2}` };
	}
}