import './Solution.css';
import React from 'react';
import Input from './Input';
import AppHeader from './AppHeader';

export class Solution extends React.Component {
	constructor(props) {
		super(props);
		this.state = { input: null };
	}

	async loadInput(day) {
		if (day) {
			try {
				let res = await fetch(`${this.props.match.params.day}.txt`);
				if (res.ok) {
					let txt = await res.text();
					if (!txt.startsWith("<!DOCTYPE html>")) {
						this.setState({ input: txt.replace(/\r/gm, ''), day: this.props.match.params.day });
					}
				}
			} catch {
			}
		}
	}

	static getDerivedStateFromProps(props, state) {
		if (state.day !== props.match.params.day) {
			return { input: null, day: props.match.params.day }
		}
		return null;
	}

	componentDidMount() {
		this.loadInput(this.props.match.params.day);
	}

	componentDidUpdate(prev) {
		if (this.state.input === null) {
			this.loadInput(this.props.match.params.day);
		}
	}

	render() {
		let day = parseInt(this.props.match.params.day);
		let input = this.state.input;

		if (day < 1 || day > 25) return <div>
			<AppHeader />
			<h1>404 - No such day in Advent of Code!</h1>
		</div>

		let s = this.props.solvers[day - 1];
		return <div className="App">
			<AppHeader day={day} />
			<div className="solution">
				<div className="data">
					<Input value={input || ""} onChange={e => this.setState({ input: e.target.value })} />
					{s ? <s.a header={s.b.prototype.solve ? "Part 1:" : "Solution:"} input={input} /> : <div className="part1">part1</div>}
					{s && s.b.prototype.solve && <s.b header="Part 2:" input={input} />}
				</div>
			</div>
		</div>
	}
}