// import React from 'react';
import { Renderer } from '../util';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

const colors = ["#000000", "#FFFF7F"]

export class S11 extends Solver {
	solve(input) {
		function findDoubleRows(input) {
			let d = [];
			for (let r = 0; r < input.length; r++) {
				if (input[r].every(c => c === 0)) {
					d.push(r);
				}
			}
			return d;
		}

		function findDoubleColumns(input) {
			let d = [];
			for (let c = 0; c < input[0].length; c++) {
				if (input.map(l => l[c]).every(x => x === 0)) {
					d.push(c);
				}
			}
			return d;
		}

		function findGalaxies(input) {
			let g = [];
			for (let r = 0; r < input.length; r++) {
				for (let c = 0; c < input[r].length; c++) {
					if (input[r][c] === 1) {
						g.push({ x: c, y: r });
					}
				}
			}
			return g;
		}

		function calculateDistances(galaxies, doubleRows, doubleColumns, factor) {
			const countDoubles = (v, from, to) => v > Math.min(from, to) && v < Math.max(from, to);
			let sum = 0;
			for (let i = 0; i < galaxies.length; i++) {
				for (let j = i + 1; j < galaxies.length; j++) {
					let a = galaxies[i], b = galaxies[j];
					sum +=
						Math.abs(a.x - b.x) +
						Math.abs(a.y - b.y) +
						doubleRows.filter(r => countDoubles(r, a.y, b.y)).length * factor +
						doubleColumns.filter(c => countDoubles(c, a.x, b.x)).length * factor;
				}
			}
			return sum;
		}

		// input = "...#......\n.......#..\n#.........\n..........\n......#...\n.#........\n.........#\n..........\n.......#..\n#...#.....";
		input = input.split('\n').map(l => l.split('').map(c => c === '.' ? 0 : 1));
		let rend = new Renderer(val => colors[val], input[0].length, input.length, 3);
		let doubleRows = findDoubleRows(input);
		let doubleColumns = findDoubleColumns(input);
		let galaxies = findGalaxies(input);

		// console.log(galaxies, doubleRows, doubleColumns);

		let sol1 = calculateDistances(galaxies, doubleRows, doubleColumns, 1);
		let sol2 = calculateDistances(galaxies, doubleRows, doubleColumns, 999999);

		return { solution: `Sum of distances: ${sol1}\nCorrected sum of distances: ${sol2}`, bmp: input, renderer: rend };
	}
}