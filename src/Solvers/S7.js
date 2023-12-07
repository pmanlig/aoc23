// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S7 extends Solver {
	solve(input) {
		function rank(h) {
			let x = [];
			let c = h.slice(0, 5);
			while (c.length > 0) {
				// eslint-disable-next-line
				x.push(c.filter(y => y === c[0]).length);
				// eslint-disable-next-line
				c = c.filter(y => y !== c[0]);
			}
			x.sort((a, b) => b - a);

			if (x[0] === 5) { return 6; }
			if (x[0] === 4) { return 5; }
			if (x[0] === 3) { return x[1] === 2 ? 4 : 3; }
			if (x[0] === 2) { return x[1] === 2 ? 2 : 1; }
			return 0;
		}

		function compareHand(a, b) {
			const cards = "23456789TJQKA";
			if (a.rank !== b.rank) { return a.rank - b.rank; }
			for (let i = 0; i < 5; i++) {
				if (a.cards[i] !== b.cards[i]) { return cards.indexOf(a.cards[i]) - cards.indexOf(b.cards[i]); }
			}
			return 0;
		}

		function rankWithJoker(h) {
			let x = [];
			let c = h.slice(0, 5);
			let jokers = c.filter(y => y === 'J').length;
			if (jokers > 3) { return 6; }
			c = c.filter(y => y !== 'J');
			while (c.length > 0) {
				// eslint-disable-next-line
				x.push(c.filter(y => y === c[0]).length);
				// eslint-disable-next-line
				c = c.filter(y => y !== c[0]);
			}
			x.sort((a, b) => b - a);
			x[0] += jokers;

			if (x[0] === 5) { return 6; }
			if (x[0] === 4) { return 5; }
			if (x[0] === 3) { return x[1] === 2 ? 4 : 3; }
			if (x[0] === 2) { return x[1] === 2 ? 2 : 1; }
			return 0;
		}

		function compareJoker(a, b) {
			const cards = "J23456789TQKA";
			if (a.joker !== b.joker) { return a.joker - b.joker; }
			for (let i = 0; i < 5; i++) {
				if (a.cards[i] !== b.cards[i]) { return cards.indexOf(a.cards[i]) - cards.indexOf(b.cards[i]); }
			}
			return 0;
		}

		// input = "32T3K 765\nT55J5 684\nKK677 28\nKTJJT 220\nQQQJA 483"
		input = input.split('\n').map(h => h.match(/^(.)(.)(.)(.)(.)\s(\d+)/).slice(1)).map(h => ({
			cards: h.slice(0, 5).join(''),
			bid: parseInt(h[5], 10),
			rank: rank(h),
			joker: rankWithJoker(h)
		}));

		let sol1 = input.sort(compareHand).map((h, i) => h.bid * (i + 1)).reduce((a, b) => a + b);
		let sol2 = input.sort(compareJoker).map((h, i) => h.bid * (i + 1)).reduce((a, b) => a + b);

		return { solution: `Total winnings: ${sol1}\nWinnings with Jokers: ${sol2}` };
	}
}