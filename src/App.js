import './App.css';
import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { AppGrid } from './AppGrid';
import { Solution } from './Solution';
import {
	S1a, S1b, S2a, S2b, S3a, S3b, S4a, S4b, S5a, S5b, S6a, S6b, S7a, S7b, S8a, S8b, S9a, S9b,
	S10a, S10b, S11a, S11b, S12a, S12b, S13a, S13b, S14a, S14b, S15a, S15b, S16a, S16b, S17a, S17b,
	S18a, S18b, S19a, S19b, S20a, S20b, S21a, S21b, S22a, S22b, S23a, S23b, S24a, S24b, S25a, S25b
} from './Solvers';

let solvers = [
	{ a: S1a, b: S1b },
	{ a: S2a, b: S2b },
	{ a: S3a, b: S3b },
	{ a: S4a, b: S4b },
	{ a: S5a, b: S5b },
	{ a: S6a, b: S6b },
	{ a: S7a, b: S7b },
	{ a: S8a, b: S8b },
	{ a: S9a, b: S9b },
	{ a: S10a, b: S10b },
	{ a: S11a, b: S11b },
	{ a: S12a, b: S12b },
	{ a: S13a, b: S13b },
	{ a: S14a, b: S14b },
	{ a: S15a, b: S15b },
	{ a: S16a, b: S16b },
	{ a: S17a, b: S17b },
	{ a: S18a, b: S18b },
	{ a: S19a, b: S19b },
	{ a: S20a, b: S20b },
	{ a: S21a, b: S21b },
	{ a: S22a, b: S22b },
	{ a: S23a, b: S23b },
	{ a: S24a, b: S24b },
	{ a: S25a, b: S25b }
];

export default function App() {
	return (
		<Router basename={`${process.env.PUBLIC_URL}`}>
			<Switch>
				<Route exact path="/:day" render={p => <Solution solvers={solvers} {...p} />} />
				<Route exact path="/" component={AppGrid} />
				<Route path="/" render={p => <h2>404 - this puzzle does not exist!</h2>} />
			</Switch>
		</Router>
	);
}
