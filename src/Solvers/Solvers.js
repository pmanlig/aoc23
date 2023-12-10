import React from 'react';
import { Bitmap } from '../util';

class BaseSolver extends React.Component {
	idleCallback = null;
	timeoutCallback = null;

	constructor(props) {
		super(props);
		this.state = { input: null, solution: null, error: null }
	}

	backgroundProcess = () => {
		if (this.solve && this.props.input) {
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

	updateInput() {
		if (this.state.input !== this.props.input) {
			if (this.newInputTimeout) { clearTimeout(this.newInputTimeout); }
			this.newInputTimeout = setTimeout(() => {
				this.setState({ input: this.props.input, solution: null, error: null });
				this.clearSolution();
				this.initializeSolution();
			}, 500);
		}
	}

	componentDidMount() {
		this.updateInput();
	}

	componentWillUnmount() {
		this.clearSolution();
	}

	componentDidUpdate() {
		this.updateInput();
	}

	initializeSolution() {
		if (this.setup && this.state.input) {
			this.setup(this.state.input);
		}
		this.runBackground(this.backgroundProcess);
	}

	clearSolution() {
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
		this.canvasRef = React.createRef();
	}

	getCanvas() {
		return this.canvasRef.current.getContext('2d');
	}

	render() {
		let { error, bmp, renderer } = this.state;
		try {
			return <div className="solver">
				{error ? <div>Error: {error.toString()}</div> : this.solution()}
				{this.canvas && <canvas id="canvas" ref={this.canvasRef} style={{ width: this.canvas.width, height: this.canvas.height }} />}
				{bmp && <Bitmap data={bmp} renderer={renderer} />}
			</div>
		} catch (e) {
			return <div className="solver">Error: {e.toString()}</div>;
		}
	}
}