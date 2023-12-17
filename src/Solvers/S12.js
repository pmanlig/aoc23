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

function combinations(pattern, numbers, x, n) {
	// console.log("combinations", pattern, numbers, x, n);
	let sum = 0;
	if (n >= numbers.length) {
		for (let i = x; i < pattern.length; i++) {
			if (pattern[i] === '#') { return 0; }
		}
		return 1;
	}
	if (n === numbers.length - 1 && x + numbers[n] === pattern.length) { return 1; }
	if ((x + numbers[n]) >= pattern.length) { return 0; }
	if (pattern[x + numbers[n]] === '?') {
		sum += combinations(pattern, numbers, x + numbers[n] + 1, n + 1);
	}
	if (pattern[x] === '?') {
		sum += combinations(pattern, numbers, x + 1, n);
	}
	return sum;
}

let cache = {}

// eslint-disable-next-line
function countArrangements2(unknowns, numbers, u, n) {
	// console.log("countArrangements", unknowns, numbers, u, n);
	if (u === unknowns.length) {
		return n === numbers.length ? 1 : 0;
	}
	let next = unknowns[u++];
	let x = 0, m = 0, sum = 0;
	while ((n + x) < numbers.length && (m + numbers[n + x]) <= next.length) { m += numbers[n + x++] + 1; } // Add length of next number + separator (.)
	for (; x >= 0; x--) {
		if (!cache[next]) { cache[next] = {} }
		let nums = numbers.slice(n, n + x);
		let key = nums.join(',');
		if (cache[next][key] === undefined) {
			cache[next][key] = combinations(next, numbers.slice(n, n + x), 0, 0);
		}
		let m = cache[next][key];
		if (m > 0) {
			sum += m * countArrangements2(unknowns, numbers, u, n + x);
		}
	}
	return sum;
}

function calcPositions(mask, numbers) {
	let p = {};
	numbers.forEach(n => {
		if (p[n] === undefined) {
			let pos = [];
			let max = mask.length - n + 1;
			for (let i = 0; i < max; i++) {
				let x = 0;
				while (x < n && mask[i + x] !== '.') { x++; }
				if (x === n && (i + n === max || mask[i + n] !== '#')) { pos.push(i); }
			}
			p[n] = pos;
		}
	});
	return p;
}

function countArrangementsByPositions(mask, positions, numbers, i, n) {
	let curr = numbers[i++];
	let pos = positions[curr];
	if (i === numbers.length) {
		return pos.filter(x => x > n).length;
	}
	let max = mask.length - (numbers.slice(i).reduce((a, b) => a + b) + numbers.length - i - 1);
	pos = pos.filter(x => x > n).filter(x => x < max)
		.map(x => countArrangementsByPositions(mask, positions, numbers, i, n + curr)).reduce((a, b) => a + b);
}

// eslint-disable-next-line
function count2(s) {
	let mask = s.unknowns.join('');
	let positions = calcPositions(mask, s.numbers);
	console.log("count2", mask, positions);
	return countArrangementsByPositions(mask, positions, s.numbers, 0, 0);
}

// eslint-disable-next-line
function count(s) {
	let unknowns = s.unknowns.join('').split('.').filter(s => s !== "");
	// console.log(s.unknowns.join(''), unknowns);
	return countArrangements2(unknowns, s.numbers, 0, 0, []);
	// return countArrangements(s.unknowns, s.numbers, 0, 0);
}

export class S12 extends Solver {
	setup(input) {
		// input = "???.### 1,1,3\n.??..??...?##. 1,1,3\n?#?#?#?#?#?#?#? 1,3,1,6\n????.#...#... 4,1,1\n????.######..#####. 1,6,5\n?###???????? 3,2,1";
		input = input.split('\n').map(l => parseSprings(l));

		this.sol1 = input.map(s => countArrangements(s.unknowns, s.numbers, 0, 0)).reduce((a, b) => a + b);
		this.sol2 = 0;
		this.remaining = input;
		this.calc = [124, 233, 460, 467, 489/*, 562, 967*/];
		// while (this.remaining.length > 35) { this.remaining.pop(); }
		this.setState({ solution: `Total # of arrangements: ${this.sol1}\nExtended # of arrangements: ${this.sol2}` });
	}

	solve() {
		// eslint-disable-next-line
		if (this.remaining.length === 0) {
			console.log("Terminated");
			return { solution: `Total # of arrangements: ${this.sol1}\nExtended # of arrangements: ${this.sol2}` };
		} else {
			// let s = this.remaining.pop();
			let x = this.calc.pop();
			let s = this.remaining[x];
			console.log(s);
			let n = count(unfold(s));
			console.log("Calc", x, n);
			this.sol2 += n;
			let next = this.remaining.length > 0 ? this.remaining[this.remaining.length - 1] : { unknowns: [""], numbers: [] }
			this.setState({
				solution:
					`Total # of arrangements: ${this.sol1}\n\
					Extended # of arrangements: ${this.sol2}\n\
					Remaining: ${x}\n\
					Last: ${s.unknowns.join('')} [${s.numbers.join(',')}]\n\
					Next: ${next.unknowns.join('')} [${next.numbers.join(',')}]`
			});
		}
	}
}