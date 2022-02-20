export default class SolutionStack {
    constructor () {
        this.stack = [];
    }

    push (pattern) {
        this.stack.push(pattern);
    }

    pop () {
        return this.stack.pop();
    }

    exceeds (demands) {
        var used = this.used(demands);
        return demands.some((el, idx) => el < used[idx]);
    }

    meets (demands) {
        var used = this.used(demands);
        return demands.every((el, idx) => el === used[idx]);
    }

    clear () {
        return this.stack.splice(0, this.stack.length);
    }

    used () {
        return this.stack.length === 0 ? [] : this.stack.reduce((acc, curr) => acc.map((el, idx) => el + curr[idx]), this.stack[0].map(() => 0));
    }
}
