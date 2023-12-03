// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S2 extends Solver {
	solve(input) {
		// input = "Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green\nGame 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue\nGame 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red\nGame 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red\nGame 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green";

		function parseGame(g) {
			let x = /^Game (\d*): (.*)/.exec(g).slice(1);
			return {
				id: parseInt(x[0], 10),
				cols: x[1].split('; ').flatMap(c => c.split(', '))
			}
		}

		function test(game) {
			for (let i = 0; i < game.cols.length; i++) {
				let x = /(\d+) ([a-z]+)/.exec(game.cols[i]).slice(1);
				let n = parseInt(x[0], 10);
				if (x[1] === "red" && n > 12) return false;
				if (x[1] === "green" && n > 13) return false;
				if (x[1] === "blue" && n > 14) return false;
			}
			return true;
		}

		function power(game) {
			let m = {}
			game.cols.forEach(c => {
				let x = /(\d+) ([a-z]+)/.exec(c).slice(1);
				let n = parseInt(x[0], 10);
				if (m[x[1]] === undefined || n > m[x[1]]) { m[x[1]] = n; }
			});
			return m.red * m.green * m.blue;
		}

		input = input.split('\n').map(l => parseGame(l));
		let sol1 = input.filter(g => test(g)).map(g => g.id).reduce((a, b) => a + b);
		let sol2 = input.map(g => power(g)).reduce((a, b) => a + b);

		return { solution: `Sum of IDs: ${sol1}\nSum of powers: ${sol2}` };
	}
}