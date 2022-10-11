export class Computer {
	fill(num, positions) {
		if (num === undefined) return "";
		if (num < 0) return "-" + this.fill(-num, positions - 1);
		let res = num.toString();
		while (res.length < positions) res = "0" + res;
		return res;
	}

	dass(ip, positions) {
		let i = ip;
		let m = [];
		while (positions-- > 0) { m.push(this.fill(this.mem[i++], 5)); }
		return `${this.fill(ip, 4)}: {${m.join(", ")}}`;
	}

	nop = {
		p: [],
		debug: (ip) => { return `${this.dass(ip, 4)} NOP`; },
		op: (ip) => { return ip + 1; }
	}

	add = {
		p: [true, true, false],
		debug: (ip, a, b, c) => { return `${this.dass(ip, 4)} mem[${c}] = ${a}+${b} (${a + b})`; },
		op: (ip, a, b, c) => { this.mem[c] = a + b; return ip + 4; }
	}

	mul = {
		p: [true, true, false],
		debug: (ip, a, b, c) => { return `${this.dass(ip, 4)} mem[${c}] = ${a}*${b} (${a * b})`; },
		op: (ip, a, b, c) => { this.mem[c] = a * b; return ip + 4; }
	}

	input = {
		p: [false],
		debug: (ip, a) => { return `${this.dass(ip, 2)} input mem[${a}] (${this.stdin[0]})`; },
		op: (ip, a) => { this.mem[a] = this.stdin.shift(); return ip + 2; }
	}

	output = {
		p: [true],
		debug: (ip, a) => { return `${this.dass(ip, 2)} output ${a}`; },
		op: (ip, a) => { this.stdout.push(a); return ip + 2; }
	}

	jmt = {
		p: [true, true],
		debug: (ip, a, b) => { return `${this.dass(ip, 3)} jmt ${a}, ${b}`; },
		op: (ip, a, b) => { return a ? b : ip + 3; }
	}

	jmf = {
		p: [true, true],
		debug: (ip, a, b) => { return `${this.dass(ip, 3)} jmf ${a}, ${b}`; },
		op: (ip, a, b) => { return a ? ip + 3 : b; }
	}

	less = {
		p: [true, true, false],
		debug: (ip, a, b, c) => { return `${this.dass(ip, 4)} less ${a}, ${b}, ${c} (${a < b})`; },
		op: (ip, a, b, c) => { this.mem[c] = a < b ? 1 : 0; return ip + 4; }
	}

	eq = {
		p: [true, true, false],
		debug: (ip, a, b, c) => { return `${this.dass(ip, 4)} eq ${a}, ${b}, ${c} (${a === b})`; },
		op: (ip, a, b, c) => { this.mem[c] = a === b ? 1 : 0; return ip + 4; }
	}

	relative_base = 0;

	rbo = {
		p: [true],
		debug: (ip, a) => { return `${this.dass(ip, 2)} rbo ${a}`; },
		op: (ip, a) => { this.relative_base += a; return ip + 2; }
	}

	instr = [
		this.nop, // 0
		this.add, // 1
		this.mul, // 2
		this.input, // 3
		this.output, // 4
		this.jmt,  // 5
		this.jmf, // 6
		this.less, // 7
		this.eq, // 8
		this.rbo // 9
	];

	constructor() {
		this.mem = [];
		this.stdin = [];
		this.stdout = [];
		this.disass = [];
		this.ip = 0;
	}

	init(program, input, output) {
		this.mem = program.split(",").map(c => parseInt(c));
		if (input) this.stdin = input;
		if (output) this.stdout = output;
		this.ip = 0;
		return this;
	}

	copy() {
		let n = new Computer();
		n.mem = this.mem.slice();
		n.relative_base = this.relative_base;
		n.ip = this.ip;
		return n;
	}

	run() {
		while (this.mem[this.ip] !== 99) {
			let opcode = this.mem[this.ip];
			if (opcode % 100 === 3 && this.stdin.length === 0) return 1;
			let op = this.instr[opcode % 100];
			let a = this.mem[this.ip + 1];
			let b = this.mem[this.ip + 2];
			let c = this.mem[this.ip + 3];
			if (opcode % 1000 < 100 && op.p[0]) a = this.mem[a];
			if (opcode % 1000 > 199) { a += this.relative_base; if (op.p[0]) { a = this.mem[a]; } }
			if (opcode % 10000 < 1000 && op.p[1]) b = this.mem[b];
			if (opcode % 10000 > 1999) { b += this.relative_base; if (op.p[1]) { b = this.mem[b]; } }
			if (opcode % 100000 < 10000 && op.p[2]) c = this.mem[c];
			if (opcode % 100000 > 19999) { c += this.relative_base; if (op.p[2]) { c = this.mem[c]; } }
			if (this.debug) { console.log(op.debug(this.ip, a, b, c)); }
			this.ip = op.op(this.ip, a, b, c);
		}
		return 0;
	}
}
