// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

function parseSprings(l) {
	l = l.split(' ');
	return {
		unknowns: l[0].split(''),
		numbers: l[1].split(',').map(n => parseInt(n, 10))
	}
}

function unfold(s) {
	return {
		unknowns: s.unknowns.concat(['?'], s.unknowns, ['?'], s.unknowns, ['?'], s.unknowns, ['?'], s.unknowns),
		numbers: s.numbers.concat(s.numbers, s.numbers, s.numbers, s.numbers)
	}
}

function matchAndCountArrangements(unknowns, numbers, u, n) {
	let x = numbers[n++];
	while (x > 0 && u < unknowns.length && unknowns[u++] !== '.') { x--; }
	if (x > 0) { return 0; } // Didn's match correct number of #s
	if (n === numbers.length) { // Last number, see of there are mote #s
		while (u < unknowns.length) { if (unknowns[u++] === '#') { return 0; } }
		return 1;
	}
	if (u === unknowns.length) { return 0; } // Reached end but DIDN'T match a number; hence there are unmatched numbers
	if (unknowns[u++] === '#') { return 0; } // Number must be followed by . or ?
	return countArrangements(unknowns, numbers, u, n); // Recurse; we matched one number and must now continue testing
}

// eslint-disable-next-line
function countArrangements(unknowns, numbers, u, n) {
	while (u < unknowns.length && unknowns[u] === '.') { u++; } // Strip leadning .s
	if (u === unknowns.length) { return 0; } // Reached end without matching a number; hence there are unmatched numbers
	if (unknowns[u] === '?') { // Fork; we can match the ? with either . or #
		return countArrangements(unknowns, numbers, u + 1, n) +
			matchAndCountArrangements(unknowns, numbers, u, n);
	}

	return matchAndCountArrangements(unknowns, numbers, u, n);
}

function combinations(unknowns, numbers, n, x) {
	return 1;
}

// eslint-disable-next-line
function countArrangements2(unknowns, numbers, u, n, f) {
	let next = unknowns[u++];
	let x = 0, m = 0, sum = 0;
	while (m < next.length && (n + x) < numbers.length) { m += numbers[n + x++] + 1; } // Add length of next number + separator (.)
	for (; x > 0; x--) {
		m = combinations(next, numbers, n, x);
		if (m > 0) {
			sum += m * countArrangements2(unknowns, numbers, u, n + x);
		}
	}
	return sum;
}

function count(s) {
	// let unknowns = unknowns.join('').split('.').filter(s => s !== "");
	// return countArrangements2(unknowns, s.numbers, 0, 0, []);
	return countArrangements(s.unknowns, s.numbers, 0, 0);
}

export class S12 extends Solver {
	setup(input) {
		// input = "???.### 1,1,3\n.??..??...?##. 1,1,3\n?#?#?#?#?#?#?#? 1,3,1,6\n????.#...#... 4,1,1\n????.######..#####. 1,6,5\n?###???????? 3,2,1";
		input = input.split('\n').map(l => parseSprings(l));

		this.sol1 = input.map(s => count(s)).reduce((a, b) => a + b);
		this.sol2 = 0;
		this.remaining = input;
		this.setState({ solution: `Total # of arrangements: ${this.sol1}\nExtended # of arrangements: ${this.sol2}` });
	}

	solve() {
		const calculated = [
			{ num: 863, combinations: 5337703878 },
			{ num: 873, combinations: 3696345296 },
			{ num: 915, combinations: 3112051430 }
		];

		if (this.remaining.length === 0) {
			console.log("Terminated");
			return { solution: `Total # of arrangements: ${this.sol1}\nExtended # of arrangements: ${this.sol2}` };
		} else {
			while (this.remaining.length > calculated[0].num) {
				this.remaining.pop();
				this.sol2 = calculated[0].combinations;
			}
			let s = this.remaining.pop();
			s = unfold(s);
			this.sol2 += count(s);
			this.setState({
				solution:
					`Total # of arrangements: ${this.sol1}\n\
				Extended # of arrangements: ${this.sol2}\n\
				Remaining: ${this.remaining.length}\n\
				Current: ${s.unknowns.join('')}`
			});
		}
	}
}