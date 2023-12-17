// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

function hash(input) {
	let h = 0;
	for (let i = 0; i < input.length; i++) {
		h += input.charCodeAt(i);
		h *= 17;
		h = h % 256;
	}
	return h;
}

function power(boxes) {
	return boxes.flatMap((x, i) => x.map((l, j) => (i + 1) * (j + 1) * l.focalLength)).reduce((a, b) => a + b);
}

function initialize(input) {
	let boxes = [];
	while (boxes.length < 256) { boxes.push([]); }
	input.forEach(i => {
		if (i.indexOf('=') > -1) {
			i = i.split('=');
			let x = hash(i[0]);
			let newBox = { label: i[0], focalLength: parseInt(i[1], 10) }
			if (boxes[x].some(b => b.label === i[0])) {
				boxes[x] = boxes[x].map(b => b.label === i[0] ? newBox : b);
			} else {
				boxes[x].push(newBox);
			}
		} else {
			i = i.split('-')[0];
			let x = hash(i);
			boxes[x] = boxes[x].filter(b => b.label !== i);
		}
	});
	return power(boxes);
}

export class S15 extends Solver {
	solve(input) {
		// input = "rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7";
		input = input.split(',');

		let sol1 = input.map(x => hash(x)).reduce((a, b) => a + b);
		let sol2 = initialize(input);

		return { solution: `Hash sum: ${sol1}\nFocusing power: ${sol2}` };
	}
}