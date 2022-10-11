import './App.css';
import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25 } from './Solvers';

let config = require('../package.json');
let solvers = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25];

//#region Private components

function AppHeader({ day }) {
	return <header className="App-header">
		{day && day > 1 && <input className="prev" type="button" value="< Previous" onClick={e => { e.stopPropagation(); window.location.href = `${process.env.PUBLIC_URL}/#/${day - 1}`; }} />}
		{day && day < 25 && <input className="next" type="button" value="Next >" onClick={e => { e.stopPropagation(); window.location.href = `${process.env.PUBLIC_URL}/#/${day + 1}`; }} />}
		<div onClick={() => { window.location.href = `${process.env.PUBLIC_URL}/` }}><h1>{`Advent of Code ${config.year}` + (day ? `- Day ${day}` : "")}</h1></div>
	</header>
}

function Input(props) {
	return <div className="input">
		<p>Input:</p>
		<textarea placeholder="<Inget indata>" value={props.value || ""} onChange={props.onChange} />
		<p>Number of lines: {props.value ? props.value.split('\n').length : 0}</p>
	</div>
}

class Solution extends React.Component {
	constructor(props) {
		super(props);
		this.state = { input: null };
		this.loadInput(props.day);
	}

	loadInput(day) {
		if (day) {
			fetch(`${day}.txt`)
				.then(res => res.text())
				.then(txt => {
					if (!txt.startsWith("<!DOCTYPE html>")) {
						this.setState({ input: txt.replace(/\r/gm, '') });
					}
				})
				.catch();
		}
	}

	render() {
		let { input } = this.state;
		const Solver = this.props.solver;
		return <div className="App-solution">
			<Input value={input} onChange={e => this.setState({ input: e.target.value })} />
			<Solver input={input} />
		</div>
	}
}

function AppGrid() {
	return <div className="App">
		<AppHeader />
		<div className="App-grid">
			{Array.apply(null, { length: 25 }).map((e, i) =>
				<div key={i} onClick={e => window.location.href = `${process.env.PUBLIC_URL}/#/${i + 1}`}>{i + 1}</div>
			)}
		</div>
	</div>
}

function AppDay({ day, solver }) {
	if (day < 1 || day > 25) { return <AppGrid />; }
	return <div>
		<AppHeader day={day} />
		<Solution day={day} solver={solver} />
	</div>
}

//#endregion

export default function App() {
	return (
		<Router basename={`${process.env.PUBLIC_URL}`}>
			<Switch>
				<Route exact path="/:day" render={p => <AppDay day={parseInt(p.match.params.day, 10)} solver={solvers[p.match.params.day - 1]} />} />
				<Route exact path="/" component={AppGrid} />
				<Route path="/" render={p => <h2>404 - this puzzle does not exist!</h2>} />
			</Switch>
		</Router>
	);
}
