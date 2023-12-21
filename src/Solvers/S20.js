// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

const low = 0;
const high = 1;

class Signal {
	constructor(type, from, destination) {
		this.type = type;
		this.from = from;
		this.destination = destination;
	}
}

class Module {
	constructor(id, destinations) {
		this.id = id;
		this.destinations = destinations;
	}

	signal(sig) { return this.send(sig.type); }
	send(type) { return this.destinations.map(d => new Signal(type, this.id, d)); }
	state() { return ""; }
}

class Broadcaster extends Module {
	constructor(destinations) {
		super("broadcaster", destinations);
	}
}

class FlipFlop extends Module {
	on = false;

	signal(sig) {
		if (sig.type === high) { return []; }

		this.on = !this.on;
		return this.send(this.on ? high : low);
	}

	state() { return this.on ? "1" : "0"; }
}

class Conjunction extends Module {
	inputs = [];

	signal(sig) {
		this.inputs = this.inputs.filter(i => i.from !== sig.from).concat([sig]);
		return this.inputs.every(i => i.type === high) ?
			this.send(low) :
			this.send(high);
	}

	state() {
		return this.inputs.sort((a, b) => a.from - b.from).map(s => s.type).join('');
	}
}

class Machine {
	high = 0;
	low = 0;
	_debug = false;
	rx = 0;

	constructor(modules) {
		this.modules = {}
		modules.forEach(m => { this.modules[m.id] = m; });

		// Initialize Conjunction modules
		modules.forEach(m => {
			m.destinations.forEach(d => {
				if (this.modules[d] !== undefined && this.modules[d].inputs !== undefined) {
					this.modules[d].inputs.push(new Signal(low, m.id, d));
				}
			});
		});
		// console.log(modules.filter(m => m.inputs !== undefined).map(m => m.inputs.map(s => ({ source: s.from, type: s.type }))));
	}

	push(num) {
		while (num-- > 0) {
			let signals = [new Signal(low, "button", "broadcaster")];
			while (signals.length > 0) {
				let sig = signals[0];
				if (this._debug) { console.log(`${sig.from} -${sig.type === high ? "high" : "low"}-> ${sig.destination}`); }
				if (sig.type === high) { this.high++; }
				else { this.low++; }
				signals = signals.slice(1);
				try {
					if (this.modules[sig.destination] !== undefined) {
						signals = signals.concat(this.modules[sig.destination].signal(sig));
					}
				} catch (e) {
					console.log("Error");
					console.log("Signal", sig);
					console.log("Modules", this.modules);
					throw e;
				}
			}
		}

		console.log("High", this.high);
		console.log("Low", this.low);
		return this.high * this.low;
	}

	findRx(num) {
		while (num-- > 0) {
			this.rx++;
			let signals = [new Signal(low, "button", "broadcaster")];
			while (signals.length > 0) {
				let sig = signals[0];
				if (this._debug) { console.log(`${sig.from} -${sig.type === high ? "high" : "low"}-> ${sig.destination}`); }
				signals = signals.slice(1);
				try {
					if (this.modules[sig.destination] !== undefined) {
						let n = this.modules[sig.destination].signal(sig);
						if (n.some(s => s.destination === "rx" && s.type === low)) { return this.rx; }
						signals = signals.concat(n);
					}
				} catch (e) {
					console.log("Error");
					console.log("Signal", sig);
					console.log("Modules", this.modules);
					throw e;
				}
			}
		}
		return this.rx > 1000 ? -1 : null;
	}

	static moduleFromInput(input) {
		input = input.match(/^([%&]?)([a-z]+) -> (.*)/).slice(1);
		input[2] = input[2].split(", ");
		switch (input[0]) {
			case "":
				return new Broadcaster(input[2]);
			case "%":
				return new FlipFlop(input[1], input[2])
			case "&":
				return new Conjunction(input[1], input[2])
			default:
				return new Module(input[1], []);
		}
	}

	static fromInput(input) {
		input = input.split('\n');

		return new Machine(input.map(l => Machine.moduleFromInput(l)));
	}
}

function time(ms) {
	return `${Math.floor(ms / 1000 / 60)}m${Math.floor(ms / 1000) % 60}s`
}

export class S20 extends Solver {
	update() {
		this.setState({
			solution: `Signals: ${this.sol1}\n\
			Button pushes until low signal is sent to rx: Calculating...\n\
			Elapsed: ${time(Date.now() - this.start)}`
		});
	}

	setup(input) {
		console.log(Machine.fromInput("broadcaster -> a, b, c\n%a -> b\n%b -> c\n%c -> inv\n&inv -> a").push(1000) === 32000000 ? "Test passed" : "Test FAILED");
		console.log(Machine.fromInput("broadcaster -> a\n%a -> inv, con\n&inv -> b\n%b -> con\n&con -> output").push(1000) === 11687500 ? "Test passed" : "Test FAILED");

		this.sol1 = Machine.fromInput(input).push(1000);
		this.sol2 = Machine.fromInput(input);
		this.start = Date.now();
		this.update();
	}

	solve() {
		let sol2 = this.sol2.findRx(1000);
		if (null !== sol2) {
			return { solution: `Signals: ${this.sol1}\nButton pushes until low signal is sent to rx: ${sol2}` }
		}

		this.update();
	}
}