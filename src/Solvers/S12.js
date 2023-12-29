import Solver from './Solvers';

// eslint-disable-next-line
Array.prototype.sum = function () { return this.reduce((a, b) => a + b, 0); }

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

let cache = {};

// eslint-disable-next-line
function countArrangements2(unknowns, numbers, u, n) {
	// console.log("countArrangements", unknowns, numbers, u, n);
	if (u === unknowns.length) {
		return n === numbers.length ? 1 : 0;
	}
	let next = unknowns[u++];
	let x = n, m = 0, sum = 0;
	while (x < numbers.length && m <= next.length) { m += numbers[x++] + 1; } // Add length of next number + separator (.)
	for (; x >= n; x--) {
		if (!cache[next]) { cache[next] = {} }
		let c = cache[next];
		let nums = numbers.slice(n, x);
		let key = nums.join(',');
		if (c[key] === undefined) { c[key] = combinations(next, numbers.slice(n, x), 0, 0); }
		if (c[key] > 0) { sum += c[key] * countArrangements2(unknowns, numbers, u, x); }
	}
	return sum;
}

// eslint-disable-next-line
function countArrangements4(unknowns, numbers) {
	if (numbers.length === 0) { return 1; }
	let mask = unknowns.indexOf('?');
	if (mask === -1) { return 0; }
	let maskEnd = unknowns.lastIndexOf('?');
	unknowns = unknowns.substring(mask, maskEnd + 1);
	let dot = unknowns.indexOf('.');
	if (dot !== -1 && dot < numbers[0]) { return countArrangements4(unknowns.substring(dot)); }
	if (unknowns.length < numbers[0]) { return 0; }

	return countArrangements4(unknowns.substring(numbers[0] + 1), numbers.slice(1)) +
		countArrangements4(unknowns.substring(1), numbers);
}

function countArrangements6(mask, numbers) {
	// console.log(`Counting "${mask}", [${numbers.join(',')}]`);
	if (numbers.length === 0) { return 1; }
	if (!cache[mask.length]) { cache[mask.length] = {}; }
	let k = numbers.join(',');
	if (cache[mask.length][k]) { return cache[mask.length][k]; }
	let minLength = numbers.sum() + numbers.length - 1;
	let variability = mask.length - minLength;
	if (variability < 0) {
		cache[mask.length][k] = 0;
	} else if (variability === 0) {
		cache[mask.length][k] = 1;
	} else {
		let sum = 0;
		sum += countArrangements6(mask.substring(1), numbers);
		sum += countArrangements6(mask.substring(numbers[0] + 1), numbers.slice(1));
		cache[mask.length][k] = sum;
	}
	return cache[mask.length][k];
}

// eslint-disable-next-line
function countArrangements5(masks, numbers) {
	if (masks.length === 0) { return numbers.length === 0 ? 1 : 0; }
	let sum = 0;
	console.log(`Count5: [${masks[0]}], [${numbers.join(',')}]`);
	for (let i = 0; true; i++) {
		let x = countArrangements6(masks[0], numbers.slice(0, i));
		if (x === 0) { break; }
		sum += x;
		if (masks.length > 0)
			sum += countArrangements5(masks.slice(1), numbers.slice(i));
	}
	return sum;
}

function countArrangements3(unknowns, numbers) {
	// console.log(`Counting "${unknowns}", [${numbers.join(',')}]`);
	let x = unknowns.indexOf('#');
	if (numbers.length === 0) { return x === -1 ? 1 : 0; }
	if (x === -1) { return countArrangements2(unknowns.split('.').filter(s => s !== ""), numbers, 0, 0, []); }
	let sum = 0;
	for (let i = 0; i < numbers.length; i++) {
		for (let j = 1 - numbers[i]; j < 1; j++) {
			let start = x + j;
			if (start < 0) { continue; }
			if (start === 1 && unknowns[0] === '#') { continue; }
			let end = x + j + numbers[i]
			if (end > unknowns.length) { continue; }
			if (end < unknowns.length && unknowns[end] === '#') { continue; }
			if (unknowns.substring(start, end).indexOf('.') !== -1) { continue; }
			let before = unknowns.substring(0, start - 1);
			let after = unknowns.substring(end + 1);
			before = before === "" ? 1 : countArrangements3(before, numbers.slice(0, i));
			after = after === "" ? 1 : countArrangements3(after, numbers.slice(i + 1));
			sum += before * after;
		}
	}
	return sum;
}

// eslint-disable-next-line
function count2(s) {
	return countArrangements3(s.unknowns.join(''), s.numbers, 0, 0, []);
}

// eslint-disable-next-line
function count(s) {
	let unknowns = s.unknowns.join('').split('.').filter(s => s !== "");
	return countArrangements2(unknowns, s.numbers, 0, 0);
}

export class S12 extends Solver {
	setup(input) {
		let test = "???.### 1,1,3\n.??..??...?##. 1,1,3\n?#?#?#?#?#?#?#? 1,3,1,6\n????.#...#... 4,1,1\n????.######..#####. 1,6,5\n?###???????? 3,2,1";
		test = test.split('\n').map(l => parseSprings(l));
		console.log(21 === test.map(s => count(s)).sum() ? "Test passed" : "Test FAILED");
		console.log(525152 === test.map(s => count(unfold(s))).sum() ? "Test passed" : "Test FAILED");
		console.log(5 + 5 + 6 * 6 === countArrangements3("?????.#.?????", [1, 1, 1, 1, 1]) ? "Test passed" : "Test FAILED");

		input = input.split('\n').map(l => parseSprings(l));
		this.sol1 = input.map(s => countArrangements(s.unknowns, s.numbers, 0, 0)).sum();
		this.sol2 = 0;
		this.remaining = input;
		while (this.remaining.length > 983) { this.remaining.pop(); }
		this.calc = [124 /*124/*, 233, 460, 467/*, 489/*, 562, 967*/];
		// console.log("#489", unfold(this.remaining[489]).unknowns.join(''), this.remaining[489].numbers);
		// while (this.remaining.length > 35) { this.remaining.pop(); }
		this.setState({ solution: `Total # of arrangements: ${this.sol1}\nExtended # of arrangements: ${this.sol2}` });
	}

	solve() {
		// eslint-disable-next-line
		if (this.remaining.length === 0) {
			console.log("Terminated");
			return { solution: `Total # of arrangements: ${this.sol1}\nExtended # of arrangements: ${this.sol2}` };
		} else {
			let s = this.remaining.pop();
			/*
			if (this.calc.length === 0) {
				return {
					solution:
						`Total # of arrangements: ${this.sol1}\n\
						Extended # of arrangements: ${this.sol2}`
				}
			}
			let x = this.calc.pop();
			let s = this.remaining[x];
			*/
			// console.log(s);
			let u = unfold(s);
			// let n = count(u);
			// console.log("Calc", x, n);
			let n2 = count2(u);
			console.log("Calc2", this.remaining.length, n2);
			this.sol2 += n2;
			let next = this.remaining.length > 0 ? this.remaining[this.remaining.length - 1] : { unknowns: [""], numbers: [] }
			this.setState({
				solution:
					`Total # of arrangements: ${this.sol1}\n\
					Extended # of arrangements: ${this.sol2}\n\
					Remaining: ${this.remaining.length}\n\
					Last: ${s.unknowns.join('')} [${s.numbers.join(',')}]\n\
					Next: ${next.unknowns.join('')} [${next.numbers.join(',')}]`
			});
		}
	}
}