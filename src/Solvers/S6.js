// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S6 extends Solver {
	solve(input) {
		function distance(x, time) {
			return x * (time - x);
		}

		function ways2win(race) {
			let x = Math.floor(race.distance / race.time);
			let w = 0;
			while (x < race.time) {
				if (distance(x, race.time) > race.distance) { w++; }
				x++;
			}
			return w;
		}

		// input = "Time:      7  15   30\nDistance:  9  40  200";
		let data = input.match(/(\d+)/g).map(n => parseInt(n, 10));
		let races = [];
		for (let i = 0; i < (data.length / 2); i++) {
			races.push({
				time: data[i],
				distance: data[i + (data.length / 2)]
			});
		}

		data = input.replace(/\s/g, '').match(/(\d+)/g).map(n => parseInt(n, 10));

		let sol1 = races.map(r => ways2win(r)).reduce((a, b) => a * b);
		let sol2 = ways2win({ time: data[0], distance: data[1] });
		return { solution: `Ways to win product: ${sol1}\nWays to win big race: ${sol2}` };
	}
}