import './Solvers.css';
import React from 'react';

class BaseSolver extends React.Component {
	idleCallback = null;
	timeoutCallback = null;

	backgroundProcess = () => {
		if (this.solve) {
			let result = this.solve(this.props.input);
			if (result) {
				this.setState(result);
			} else {
				this.runBackground(this.backgroundProcess);
			}
		}
	}

	runBackground(callback) {
		if ('requestIdleCallback' in window) {
			this.idleCallback = requestIdleCallback(callback);
		} else {
			this.timeoutCallback = setTimeout(callback, 1);
		}
	}

	componentWillUnmount() {
		if (null !== this.idleCallback) {
			cancelIdleCallback(this.idleCallback);
			this.idleCallback = null;
		}
		if (null !== this.timeoutCallback) {
			clearTimeout(this.timeoutCallback);
			this.timeoutCallback = null;
		}
	}
}

export default class DefaultSolver extends BaseSolver {
	constructor(props) {
		super(props);
		this.state = { solution: null, error: null }
	}

	componentDidMount() {
		if (this.setup) { this.setup(this.props.input); }
		this.runBackground(this.backgroundProcess);
	}

	solution = () => {
		if (this.state.solution) { return this.state.solution.toString().split('\n').map((t, i) => <p key={i}>{t}</p>); }
		if (!this.props.input) { return <p>Inget indata!</p> }
		return <p>Ingen lösning än!</p>
	}

	render() {
		try {
			return <div className="solver">
				{this.state.error ? <div>Error: {this.state.error.toString()}</div> : this.solution()}
			</div>
		} catch (e) {
			return <div>Error: {e.toString()}</div>;
		}
	}
}

export class AdvancedSolver extends React.Component {
	state = {};
	show = true;
	runControls = false;
	running = false;

	async asyncSolve(input) {
		try {
			this.solve(input);
		} catch (e) {
			console.log(e);
			this.setState({ error: e });
		}
	}

	componentDidMount() {
		if (this.props.input !== null) {
			this.run(false);
		}
	}

	componentDidUpdate(prev) {
		if (this.props.input !== prev.input && this.props.input !== null) {
			this.run(false);
		}
	}

	componentWillUnmount() {
		if (null !== this.idleCallback) {
			cancelIdleCallback(this.idleCallback);
			this.idleCallback = null;
		}
		if (null !== this.timeoutCallback) {
			clearTimeout(this.timeoutCallback);
			this.timeoutCallback = null;
		}
	}

	run(auto) {
		try {
			if (this.runControls) {
				this.running = auto;
				if (!this.running)
					return;
			}
			if (this.props.input === null)
				return;

			this.setState({ error: null });
			this.asyncSolve(this.props.input);
		} catch (e) {
			console.log(e);
			this.setState({ error: e });
		}
	}

	render() {
		try {
			return <div className="solver">
				<div className="control">
					{this.props.header}
					{this.runControls && <input type="button" value="Solve" onClick={e => this.run(true)} />}
				</div>
				<div className="result">
					{this.customRender ? this.customRender() :
						(this.state.error ? <div>Error: {this.state.error.toString()}</div> :
							<this.solution />)}
				</div>
			</div>;
		} catch (e) {
			return <div>Error: {e.toString()}</div>;
		}
	}
}
