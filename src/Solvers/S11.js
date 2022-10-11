//import React from 'react';
import Solver from './Solver';

const letters = "abcdefghijklmnopqrstuvwxyz";

export class S11a extends Solver {
	solve(input) {
		if (input === "") {
			this.setState({ solution: `No input yet` })
		} else {
			this.setState({ solution: `No solution yet` })
		}
	}
}

export class S11b extends Solver {
}