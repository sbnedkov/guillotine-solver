import NDigit from './ndigit';
import NNumber from './nnumber';

export default class PatternDrainer {
    constructor (pattern, cuttingUtils) {
        this.constituents = cuttingUtils.mainConstituent(pattern.constituentsx, pattern.constituentsy).map(constituent => constituent.slice(0));
        this.constituent = this.constituents.reduce((acc, cons) => acc.map((el, idx) => el + cons[idx]), this.constituents[0].map(() => 0));
        this.numbers = new NNumber(this.constituent.map((digit, idx) => new NDigit(this.constituent, idx)));
    }

    next () {
        var more = this.numbers.dec();
        if (!more) {
            return false;
        }
        return this.constituent.slice(0);
    }

    complement (constituent) {
        return constituent.map(v => v ? 1 : 0);
    }
}
