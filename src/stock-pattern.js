export default class StockPattern {
    constructor (strips, W, L, demands) {
        this.strips = strips;
        this.empty = demands.map(() => 0);
        this.W = W;
        this.L = L;
    }

    value () {
        if (!this.savedValue) {
            this.savedValue = this.reduceStrips();
        }

        return this.savedValue;
    }

    reduceStrips () {
        return this.strips.reduce((acc, strip) => {
            var reducedStrip = this.reducePatterns(strip);
            return acc.map((el, idx) => el + reducedStrip[idx]);
        }, this.empty.slice(0));
    }

    reducePatterns (patterns) {
        return patterns.reduce((acc, pattern) => {
            for (let i = 0; i < acc.length; i++) {
                acc[i] += pattern.pattern.pattern[i];
            }
            return acc;
        }, this.empty.slice(0));
    }

    fingerprint () {
        return this.strips.reduce(
            (acc, strip) =>
                acc.concat(strip.reduce(
                    (innerAcc, pattern) =>
                        innerAcc.concat(pattern.pattern.pattern.join('-')),
                    []).join(' ')),
        []).join('*');
    }
}
