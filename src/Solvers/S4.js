// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S4 extends Solver {
	solve(input) {
		// input = "Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53\nCard 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19\nCard 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1\nCard 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83\nCard 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36\nCard 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11";

		function card(l) {
			l = /^Card\s+(\d+): (.*)/.exec(l).slice(1);
			let n = l[1].split(' | ');
			let w = n[0].split(' ').filter(x => x !== "").map(w => parseInt(w, 10));
			n = n[1].split(' ').filter(x => x !== "").map(x => parseInt(x, 10));
			return {
				id: parseInt(l[0], 10),
				wins: n.filter(x => w.some(y => x === y)).length,
				win: w,
				nums: n,
				count: 1
			}
		}

		input = input.split('\n').map(l => card(l));
		let sol1 = input.map(c => c.wins > 0 ? Math.pow(2, c.wins - 1) : 0).reduce((a, b) => a + b);

		for (let i = 0; i < input.length; i++) {
			if (input[i].wins > 0) {
				for (let j = 1; j <= input[i].wins; j++) {
					input[i+j].count += input[i].count;
				}
			}
		}
		let sol2 = input.map(c => c.count).reduce((a, b) => a + b);

		console.log(input[0]);
		return { solution: `Sum of card scores: ${sol1}\nNumber of cards: ${sol2}` };
	}
}