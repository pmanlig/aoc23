import './Solvers.css';
import React from 'react';

class BaseSolver extends React.Component {
	idleCallback = null;
	timeoutCallback = null;

	constructor(props) {
		super(props);
		this.state = { solution: null, error: null }
	}

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

	componentDidMount() {
		if (this.setup) { this.setup(this.props.input); }
		this.runBackground(this.backgroundProcess);
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

	solution = () => {
		if (this.state.solution) { return this.state.solution.toString().split('\n').map((t, i) => <p key={i}>{t}</p>); }
		if (!this.props.input) { return <p>Inget indata!</p> }
		return null;
	}

	render() {
		try {
			return <div className="solver">
				{this.state.error ? <div>Error: {this.state.error.toString()}</div> : this.solution()}
			</div>
		} catch (e) {
			return <div className="solver">Error: {e.toString()}</div>;
		}
	}
}

export default class GraphSolver extends BaseSolver {
	constructor(props) {
		super(props);
		this.canvas = React.createRef();
		if (this.state === undefined) { this.state = {}; }
		this.state.width = 1000;
		this.state.height = 500;
	}

	getCanvas() {
		return this.canvas.current.getContext('2d');
	}

	render() {
		let { width, height, error } = this.state;
		try {
			return <div className="solver">
				{error ? <div>Error: {error.toString()}</div> : this.solution()}
				<canvas id="canvas" ref={this.canvas} width={width} height={height} />
			</div>
		} catch (e) {
			return <div className="solver">Error: {e.toString()}</div>;
		}
	}
}