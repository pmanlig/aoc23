export class SearchState {
	constructor(initial, haltCondition, sortCondition) {
		this.pot = initial;
		this.haltCondition = haltCondition;
		this.sortCondition = sortCondition;
		this.queue = [];
	}

	findAsync(max) {
		while (max-- > 0 && !this.haltCondition(this.pot)) {
			this.queue = this.queue.concat(this.pot.generate());
			this.queue.sort(this.sortCondition);
			this.pot = this.queue.pop();
		}
		if (this.haltCondition(this.pot)) { return this.pot; }
	}

	static find(initial, haltCondition, sortCondition) {
		let pot = initial;
		let queue = [];
		while (!haltCondition(pot)) {
			queue = queue.concat(pot.generate());
			queue.sort(sortCondition);
			pot = queue.pop();
		}
		return pot;
	}
}