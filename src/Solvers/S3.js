// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S3 extends Solver {
	solve(input) {
		// input = "467..114..\n...*......\n..35..633.\n......#...\n617*......\n.....+.58.\n..592.....\n......755.\n...$.*....\n.664.598..";
		const digits = "0123456789";

		function isAdjacent(num, sym) {
			return sym.x >= num.x0 && sym.x <= num.x1 && sym.y >= num.y0 && sym.y <= num.y1;
		}

		function ratio(sym, nums) {

			if (sym.sym !== '*') { return 0; }
			nums = nums.filter(n => isAdjacent(n, sym));
			if (nums.length === 2) { return nums[0].num * nums[1].num; }
			return 0;
		}

		input = input.split('\n').map(l => l.split(''));

		let nums = [], syms = [];

		for (let y = 0; y < input.length; y++) {
			for (let x = 0; x < input[y].length; x++) {
				if (digits.indexOf(input[y][x]) !== -1) {
					let n = "";
					while (x < input[y].length && digits.indexOf(input[y][x]) !== -1) { n += input[y][x++]; }
					nums.push({ num: parseInt(n, 10), x0: x - n.length - 1, y0: y - 1, x1: x, y1: y + 1 });
				}

				if (x < input[y].length && input[y][x] !== '.') { syms.push({ sym: input[y][x], x: x, y: y }); }
			}
		}

		let partSum = nums.filter(n => syms.some(s => isAdjacent(n, s))).map(n => n.num).reduce((a, b) => a + b);
		let gearSum = syms.map(s => ratio(s, nums)).reduce((a, b) => a + b);

		return { solution: `Part number sum: ${partSum}\nSum of gear ratios: ${gearSum}` };
	}
}