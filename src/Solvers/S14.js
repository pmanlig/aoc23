// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

function weigh(balls, input) {
	return balls.map(b => input.length - b.y).reduce((a, b) => a + b);
}

function tiltNorth(balls, input) {
	for (let x = 0; x < input[0].length; x++) {
		let b = balls.filter(b => b.x === x);
		b.sort((a, b) => a.y - b.y);
		let ball = 0;
		let newY = 0;
		for (let y = 0; y < input.length; y++) {
			if (input[y][x] === '#') {
				newY = y + 1;
			} else if (ball < b.length && b[ball].y === y) {
				b[ball++].y = newY++;
			}
		}
	}
	return balls;
}

function tiltSouth(balls, input) {
	for (let x = 0; x < input[0].length; x++) {
		let b = balls.filter(b => b.x === x);
		b.sort((a, b) => b.y - a.y);
		let ball = 0;
		let newY = input.length - 1;
		for (let y = newY; y >= 0; y--) {
			if (input[y][x] === '#') {
				newY = y - 1;
			} else if (ball < b.length && b[ball].y === y) {
				b[ball++].y = newY--;
			}
		}
	}
	return balls;
}

function tiltWest(balls, input) {
	for (let y = 0; y < input.length; y++) {
		let b = balls.filter(b => b.y === y);
		b.sort((a, b) => a.x - b.x);
		let ball = 0;
		let newX = 0;
		for (let x = 0; x < input[y].length; x++) {
			if (input[y][x] === '#') {
				newX = x + 1;
			} else if (ball < b.length && b[ball].x === x) {
				b[ball++].x = newX++;
			}
		}
	}
	return balls;
}

function tiltEast(balls, input) {
	for (let y = 0; y < input.length; y++) {
		let b = balls.filter(b => b.y === y);
		b.sort((a, b) => b.x - a.x);
		let ball = 0;
		let newX = input[y].length - 1;
		for (let x = newX; x >= 0; x--) {
			if (input[y][x] === '#') {
				newX = x - 1;
			} else if (ball < b.length && b[ball].x === x) {
				b[ball++].x = newX--;
			}
		}
	}
	return balls;
}

function balls(input) {
	let balls = [];
	for (let r = 0; r < input.length; r++) {
		for (let c = 0; c < input[r].length; c++) {
			if (input[r][c] === 'O') {
				balls.push({ x: c, y: r });
			}
		}
	}
	return balls;
}

function spin(balls, input) {
	tiltNorth(balls, input);
	tiltWest(balls, input);
	tiltSouth(balls, input);
	tiltEast(balls, input);
}

function hash(balls, input) {
	return balls.map(b => b.y * input.length + b.x).reduce((a, b) => a + b);
}

export class S14 extends Solver {
	solve(input) {
		// input = "O....#....\nO.OO#....#\n.....##...\nOO.#O....O\n.O.....O#.\nO.#..O.#.#\n..O..#O..O\n.......O..\n#....###..\n#OO..#....";
		input = input.split('\n').map(l => l.split(''));

		let b = balls(input);
		tiltNorth(b, input);
		let sol1 = weigh(b, input);

		b = balls(input);
		let i = 1000000000;
		let hist = [];
		while (i-- > 0) {
			spin(b, input);
			hist.push(hash(b, input));
			let h0 = hist[hist.length - 1];
			for (let h = hist.length - 2; h >= hist.length / 2; h--) {
				if (hist[h] === h0) {
					let period = hist.length - h - 1;
					if (hist[h - period]) {
						i = i % period;
						break;
					}
				}
			}
		}
		let sol2 = weigh(b, input);

		return { solution: `Total load when tilting: ${sol1}\nLoad after many spins: ${sol2}` };
	}
}