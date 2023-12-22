// import React from 'react';
import { Renderer, drawFilledRect } from '../util';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

const pixel_size = 3;

class BrickRenderer extends Renderer {
	constructor(bricks) {
		super(null, 800, 600, 1);
	}

	drawBrickX(ctx, brick) {
		let fromY = 600 - (brick.z2) * pixel_size;
		let toY = 600 - (brick.z1 - 1) * pixel_size;
		drawFilledRect(ctx, (10 + brick.x1) * pixel_size, fromY, (brick.x2 + 11) * pixel_size, toY, "#CFCF3F");
	}

	drawBrickY(ctx, brick) {
		let fromY = 600 - (brick.z2) * pixel_size;
		let toY = 600 - (brick.z1 - 1) * pixel_size;
		drawFilledRect(ctx, (30 + brick.y1) * pixel_size, fromY, (brick.y2 + 31) * pixel_size, toY, "#CFCF3F");
	}

	draw(ctx, bricks) {
		drawFilledRect(ctx, 10 * pixel_size, 600 - 180 * pixel_size, 20 * pixel_size, 600, "#AFAFAF");
		drawFilledRect(ctx, 30 * pixel_size, 600 - 180 * pixel_size, 40 * pixel_size, 600, "#AFAFAF");
		bricks.sort((a, b) => b.y1 - a.y1);
		bricks.forEach(b => this.drawBrickX(ctx, b));
		bricks.sort((a, b) => a.x1 - b.x1);
		bricks.forEach(b => this.drawBrickY(ctx, b));
	}
}

class Brick {
	constructor(x1, y1, z1, x2, y2, z2) {
		this.x1 = x1;
		this.y1 = y1;
		this.z1 = z1;
		this.x2 = x2;
		this.y2 = y2;
		this.z2 = z2;
		this.moving = z1 > 1;
		this.isSupportedBy = [];
	}

	normalize() {
		let t = Math.min(this.x1, this.x2);
		this.x2 = Math.max(this.x1, this.x2);
		this.x1 = t;
		t = Math.min(this.y1, this.y2);
		this.y2 = Math.max(this.y1, this.y2);
		this.y1 = t;
		t = Math.min(this.z1, this.z2);
		this.z2 = Math.max(this.z1, this.z2);
		this.z1 = t;
	}

	within(x, y) {
		return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
	}

	intersect(other) {
		for (let x = this.x1; x <= this.x2; x++) {
			for (let y = this.y1; y <= this.y2; y++) {
				if (other.within(x, y)) { return true; }
			}
		}
		return false;
	}

	compare(others) {
		let i = others.filter(b => b !== this && this.intersect(b)).sort((a, b) => a.z1 - b.z1);
		// if (this.label === "C") console.log("Brick C intersects", i.map(x => x.label).join(','));
		this.above = i.filter(b => b.z1 > this.z2);
		this.below = i.filter(b => b.z2 < this.z1);
	}

	tryDrop() {
		if (!this.moving || this.below.some(b => b.moving)) { return; }
		let drop = this.z1 - Math.max(0, ...this.below.map(b => b.z2)) - 1;
		this.z1 -= drop;
		this.z2 -= drop;
		this.moving = false;
		this.isSupportedBy = this.below.filter(b => b.z2 === this.z1 - 1);
	}

	canDisintegrate() {
		this.supports = this.above.filter(b => b.z1 === this.z2 + 1);
		return this.supports.every(b => b.isSupportedBy.length > 1);
	}

	dependence() {
		let falling = [this];
		let unsupported = [...this.supports];
		while (unsupported.length > 0) {
			let x = unsupported.pop();
			if (!falling.some(b => b === x) && x.isSupportedBy.every(s => falling.some(b => b === s))) {
				falling.push(x);
				unsupported = unsupported.concat(x.supports);
			}
		}
		return falling.length - 1;
	}
}

function parse(input) {
	return input.split('\n').map(l => new Brick(...l.match(/^(\d+),(\d+),(\d+)~(\d+),(\d+),(\d+)/).slice(1).map(n => parseInt(n, 10))))
}

function drop(input) {
	input.forEach(b => b.normalize());
	input.forEach(b => b.compare(input));
	while (input.some(b => b.moving)) {
		input.forEach(b => b.tryDrop());
	}
}

function disintegrate(input) {
	return input.filter(b => b.canDisintegrate()).length;
}

export class S22 extends Solver {
	solve(input) {
		let test = parse("1,0,1~1,2,1\n0,0,2~2,0,2\n0,2,3~2,2,3\n0,0,4~0,2,4\n2,0,5~2,2,5\n0,1,6~2,1,6\n1,1,8~1,1,9");
		test[0].label = "A";
		test[1].label = "B";
		test[2].label = "C";
		test[3].label = "D";
		test[4].label = "E";
		test[5].label = "F";
		test[6].label = "G";
		drop(test);
		let test1 = disintegrate(test);
		console.log(test1, test1 === 5 ? "Test passed" : "Test FAILED");
		let test2 = test.map(b => b.dependence()).sum();
		console.log(test2, test2 === 7 ? "Test passed" : "Test FAILED");

		input = parse(input);
		drop(input);

		let sol1 = disintegrate(input);
		let sol2 = input.map(b => b.dependence()).sum();
		return {
			solution: `${sol1} bricks can be safely disintegrated\n\
			${sol2} can fall if the right bricks are removed`, bmp: input, renderer: new BrickRenderer()
		};
	}
}