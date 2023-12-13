// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

function compare(lines) {
	for (let l = 1; l < lines.length; l++) {
		let x = l - 1, y = l;
		while (lines[x] === lines[y]) {
			x--; y++;
			if (x === -1 || y === lines.length) { return l; }
		}
	}
	return -1;
}

function countDiff(lines) {
	for (let l = 1; l < lines.length; l++) {
		let diff = 0;
		for (let x = l - 1, y = l; x > -1 && y < lines.length; x--, y++) {
			for (let i = 0; i < lines[x].length; i++) {
				if (lines[x][i] !== lines[y][i]) { diff++; }
			}
		}
		if (diff === 1) { return l; }
	}
	return -1;
}

function findMirror(input, cmpFunc) {
	let cols = [];
	for (let c = 0; c < input[0].length; c++) {
		cols.push(input.map(l => l[c]).join(''));
	}
	let x = cmpFunc(cols);
	if (x > -1) { return x; }
	return 100 * cmpFunc(input.map(l => l.join('')));
}

export class S13 extends Solver {
	solve(input) {
		// input = "#.##..##.\n..#.##.#.\n##......#\n##......#\n..#.##.#.\n..##..##.\n#.#.##.#.\n\n#...##..#\n#....#..#\n..##..###\n#####.##.\n#####.##.\n..##..###\n#....#..#";
		input = input.split("\n\n").map(m => m.split('\n').map(l => l.split('')));

		let sol1 = input.map(m => findMirror(m, compare)).reduce((a, b) => a + b);
		let sol2 = input.map(m => findMirror(m, countDiff)).reduce((a, b) => a + b);

		return { solution: `Sum of mirror values: ${sol1}\nSum of repaired mirror values: ${sol2}` };
	}
}