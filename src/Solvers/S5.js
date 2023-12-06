// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S5 extends Solver {
	solve(input) {
		function map(input, from, to) {
			return new RegExp(`${from}-to-${to} map:\n([0-9 \n]+)`).exec(input)[1]
				.split('\n')
				.filter(s => s !== "")
				.map(l => l.split(' ').map(n => parseInt(n, 10)))
				.map(m => ({ from: m[1], to: m[0], length: m[2] }))
				.sort((a, b) => a.from - b.from);
		}

		function applyMap(s, map) {
			for (let i = 0; i < map.length; i++) {
				if (s >= map[i].from && (s < map[i].from + map[i].length)) {
					return map[i].to + s - map[i].from;
				}
			}
			return s;
		}

		function applyMaps(s, maps) {
			for (let i = 0; i < maps.length; i++) {
				s = applyMap(s, maps[i]);
			}
			return s;
		}

		function ranges(seeds) {
			let r = [];
			for (let i = 0; i < seeds.length; i += 2) {
				r.push({ from: seeds[i], to: seeds[i] + seeds[i + 1], length: seeds[i + 1] });
			}
			return r;
		}

		function mapRange(from, to, map) {
			for (let i = 0; i < map.length; i++) {
				if (from >= map[i].from && from < map[i].from + map[i].length) {
					let l = Math.min(map[i].length + map[i].from - from, to - from);
					let t = map[i].to + from - map[i].from;
					return { from: t, to: t + l, length: l };
				}
			}
			for (let i = 0; i < map.length; i++) {
				if (map[i].from >= from && (map[i].from + map[i].length) < to) {
					return { from: from, to: map[i].from, length: map[i].from - from }
				}
			}
			return { from: from, to: to, length: to - from }
		}

		function applyMap2Ranges(ranges, map) {
			let res = [];
			for (let i = 0; i < ranges.length; i++) {
				let r = ranges[i];
				for (let x = r.from; x < r.to;) {
					let rng = mapRange(x, r.to, map);
					res.push(rng);
					x += rng.length;
				}
			}
			return res;
		}

		function applyMaps2Ranges(ranges, maps) {
			for (let i = 0; i < maps.length; i++) {
				ranges = applyMap2Ranges(ranges, maps[i]);
				// console.log(ranges.map(r => `[${r.from}-${r.to}]`).join(", "));
			}
			return ranges;
		}

		// input = "seeds: 79 14 55 13\n\nseed-to-soil map:\n50 98 2\n52 50 48\n\nsoil-to-fertilizer map:\n0 15 37\n37 52 2\n39 0 15\n\nfertilizer-to-water map:\n49 53 8\n0 11 42\n42 0 7\n57 7 4\n\nwater-to-light map:\n88 18 7\n18 25 70\n\nlight-to-temperature map:\n45 77 23\n81 45 19\n68 64 13\n\ntemperature-to-humidity map:\n0 69 1\n1 0 69\n\nhumidity-to-location map:\n60 56 37\n56 93 4";
		let seeds = /^seeds: ([0-9 ]+)\n/.exec(input)[1].split(' ').map(n => parseInt(n, 10));
		let maps = [];
		maps.push(map(input, "seed", "soil"));
		maps.push(map(input, "soil", "fertilizer"));
		maps.push(map(input, "fertilizer", "water"));
		maps.push(map(input, "water", "light"));
		maps.push(map(input, "light", "temperature"));
		maps.push(map(input, "temperature", "humidity"));
		maps.push(map(input, "humidity", "location"));

		let sol1 = Math.min(...(seeds.map(s => applyMaps(s, maps))));
		let sol2 = Math.min(...(applyMaps2Ranges(ranges(seeds), maps).map(r => r.from)));

		return { solution: `Minimum location # (singes): ${sol1}\nMinimum location # (ranges): ${sol2}` };
	}
}