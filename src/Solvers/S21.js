// import React from 'react';
import { BitmapRenderer } from '../util';
import Solver from './Solvers';

const colors = {
	'.': "#CFCFCF",
	'#': "#1F1F1F"
}

function map(input) {
	return input.split('\n').map(l => l.split(''));
}

function findStart(map) {
	for (let r = 0; r < map.length; r++) {
		for (let c = 0; c < map[r].length; c++) {
			if (map[r][c] === 'S') {
				return { x: c, y: r }
			}
		}
	}
}

function normalize(c, length) {
	if (c < 0) { return c + length * Math.ceil(-c / length) }
	else { return c % length; }
}

function validPos(map, x, y) {
	return map[normalize(y, map.length)][normalize(x, map[0].length)] !== '#';
}

function addEdge(map, x, y, positions, edges) {
	if (validPos(map, x, y) &&
		!edges.some(e => e.x === x && e.y === y) &&
		!positions.some(p => p.x === x && p.y === y)) {
		edges.push({ x: x, y: y });
	}
}

function addPos(map, x, y, positions) {
	if (validPos(map, x, y)) {
		positions.push({ x: x, y: y });
	}
}

function newEdges(map, edges, positions) {
	let res = [];
	edges.forEach(e => {
		addPos(map, e.x + 1, e.y, res);
		addPos(map, e.x - 1, e.y, res);
		addPos(map, e.x, e.y + 1, res);
		addPos(map, e.x, e.y - 1, res);
	});
	edges = res;
	res = [];
	edges.forEach(e => {
		addEdge(map, e.x + 1, e.y, positions, res);
		addEdge(map, e.x - 1, e.y, positions, res);
		addEdge(map, e.x, e.y + 1, positions, res);
		addEdge(map, e.x, e.y - 1, positions, res);
	});
	return res;
}

function count(map, steps) {
	let start = findStart(map);
	let count = 0;
	let positions = [];
	if (steps % 2 === 0) {
		positions.push(start);
	} else {
		steps--;
		addPos(map, start.x + 1, start.y, positions);
		addPos(map, start.x - 1, start.y, positions);
		addPos(map, start.x, start.y + 1, positions);
		addPos(map, start.x, start.y - 1, positions);
	}
	count = positions.length;
	let edges = [...positions];
	while (steps > 1) {
		steps -= 2;
		let e = newEdges(map, edges, positions);
		count += e.length;
		positions = e.concat(edges);
		edges = e;
	}
	return count;
}

function assert(desc, x, expected) {
	console.log(desc, x === expected ? "Test passed" : `Test FAILED; expected ${expected} saw ${x}`);
}

export class S21 extends Solver {
	solve(input) {
		let test = "...........\n.....###.#.\n.###.##..#.\n..#.#...#..\n....#.#....\n.##..S####.\n.##..#...#.\n.......##..\n.##.#.####.\n.##..##.##.\n..........."
		test = map(test);
		assert("Test 6 steps", count(test, 6), 16);
		assert("Test 10 steps", count(test, 10), 50);
		assert("Test 50 steps", count(test, 50), 1594);
		assert("Test 100 steps", count(test, 100), 6536);
		assert("Test 500 steps", count(test, 500), 167004);
		assert("Test 1000 steps", count(test, 1000), 668697);
		assert("Test 5000 steps", count(test, 5000), 16733044);
		input = map(input);
		let sol1 = count(input, 64);
		let sol2 = 0; // countInfinite(input, 26501365);

		return { solution: `${sol1} plots can be reached in 64 steps\n${sol2} plots can be reached in 26501365 steps`, bmp: input, renderer: new BitmapRenderer(colors, input, 4) };
	}
}