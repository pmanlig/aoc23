// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S1 extends Solver {
	solve(input) {
		function digit(x, i) {
			const digits = '0123456789';
			return digits.indexOf(x[i]);
		}

		function alsoDigit(x, i) {
			let d = digit(x, i);
			if (-1 !== d) return d;
			const digits = [
				'zero',
				'one',
				'two',
				'three',
				'four',
				'five',
				'six',
				'seven',
				'eight',
				'nine'
			];
			for (let j = 1; j < digits.length; j++) {
				if (digits[j] === x.substring(i, i + digits[j].length)) {
					return j;
				}
			}
			return -1;
		}

		function first(x, f) {
			for (let i = 0; i < x.length; i++) {
				let val = f(x, i);
				if (-1 !== val) { return val; }
			}
		}

		function last(x, f) {
			for (let i = x.length; i-- > 0;) {
				let val = f(x, i);
				if (-1 !== val) { return val; }
			}
		}

		function calibration(x) {
			return 10 * first(x, digit) + last(x, digit);
		}

		function corrected(x) {
			return 10 * first(x, alsoDigit) + last(x, alsoDigit);
		}

		// let y = input.split('\n')[6];
		// console.log(y, corrected(y));

		let sol = input.split('\n').map(l => calibration(l)).reduce((a, b) => a + b);
		let sol2 = input.split('\n').map(l => corrected(l)).reduce((a, b) => a + b);
		return { solution: `Calibration: ${sol}\nCorrected: ${sol2}` };
	}
}