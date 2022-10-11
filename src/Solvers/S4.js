// import React from 'react';
import Solver from './Solver';
import { md5 } from '../util/md5';

export class S4a extends Solver {
	solve(input) {
		if (input === "") {
			this.setState({ solution: `No input yet` })
		} else {
			this.setState({ solution: `No solution yet` })
		}
	}
}

export class S4b extends Solver {
}