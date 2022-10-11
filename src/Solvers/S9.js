// import React from 'react';
import Solver from './Solver';

export class S9a extends Solver {
	solve(input) {
		if (input === "") {
			this.setState({ solution: `No input yet` })
		} else {
			this.setState({ solution: `No solution yet` })
		}
	}
}

export class S9b extends Solver {
}