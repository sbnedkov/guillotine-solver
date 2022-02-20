import cuttingUtilsService from '../cutting-utils';
import {createReverseMap} from '../utils';
import knapsack from '../knapsack';

export default class SolverStrips {
    constructor (W, L, itemsw, itemsh, itemsValue, itemsCosts, allowRotation, cutType) {
        this.cuttingUtils = cuttingUtilsService(cutType);

        var itemdata = itemsCosts.map((el, idx) => {
            return {
                w: itemsw[idx],
                h: itemsh[idx],
                v: itemsValue[idx],
                cs: el,
                canRotate: allowRotation[idx],
                idx: idx
            };
        });

        console.log('In strips solver got the following strips:\n', itemdata);
        this.originalPatterns = itemsCosts;

        this.sorted = itemdata.sort((a1, a2) => {
            return a2.v - a1.v;
//            return this.cuttingUtils.sortPredicate(a2, a1, W, L); // a2 and a1 are reversed here, this is right
        });

        this.map = this.sorted.map(el => el.idx);
        this.itemsw = this.sorted.map(el => el.w);
        this.itemsh = this.sorted.map(el => el.h);
        this.itemsv = this.sorted.map(el => el.v);
        this.itemscs = this.sorted.map(el => el.cs);

        this.W = W;
        this.L = L;

        this.memory = {};
    }

    solve (demands) {
        var hashStr = this.hash(demands);
        if (this.memory[hashStr]) {
            return this.memory[hashStr];
        }

        var patternMemory = {};
        this.demands = demands;
        this.indices = [];

        this.dfs(this.demands, (A, B) => {
            var index = A.map((v, idx) => v * B[idx]);
            var hashKey = this.toHash(index);
            if (!patternMemory[hashKey]) {
                patternMemory[hashKey] = true;
                this.indices.push(index);
            }
        });

        var mappedPatterns = this.remap(this.indices);

//        console.log('Strip solver returning indices:\n', mappedPatterns, '\nEnd indices');
        return mappedPatterns;
    }

    indicesToPatterns (indices, patterns) {
        // Short-circuit the BnB solver must have provided all the correct patterns, so we don't have a strips solving phase, just put in a knapsack
        const result = [];
        const remaining = patterns.slice(0);

        const constraint = this.cuttingUtils.secondarySide(this.W, this.L);
        while (remaining.length) {
            const otherSides = remaining.map(v => this.cuttingUtils.secondarySide(v.pattern.getMaxX(), v.pattern.getMaxY()));

            const idxs = knapsack(constraint, otherSides);
            result.push([idxs.map(idx => remaining[idx])]);
            idxs.reverse().forEach(idx => remaining.splice(idx, 1));
        }

        return result;
        /*
        return indices.map(indexArr => {
            return indexArr.map((count, idx) => { // This is a strip, isn't it?
                if (count) {
                    return {
                        count,
                        idx
                    };
                }
            }).filter(v => v).map(({count, idx}) => {
                var res = [];
                for (let i = 0; i < count; i++) {
                    res.push(patterns[idx]);
                }
                return res;
            });
        });
        */
    }

    remap (indices) {
        var reverseMap = createReverseMap(this.map);

        return indices.map(i => {
            return i.map((_, idx) => i[reverseMap[idx]]);
        });
    }

    dfs (demands, cb) {
        var m = this.itemsw.length;
        var a = this.sorted.map(() => 0);
        var b = this.sorted.map(() => 0);

        var {A, B} = this.generatePattern(a, b, demands.slice(0), 0);

        if (!(this.null(A) || this.null(B))) {
            cb(A, B);

            let as = [a];
            let bs = [b];
            let r = 0;
            let j = 0;

            bnb:
            while (r < m) {
                while (as[j][r] > 0) {
                    let flag = this.cuttingUtils.getBranchFlag(as[j][r], bs[j][r]);
                    j = j + 1;

                    let a = this.sorted.map(() => 0);
                    let b = this.sorted.map(() => 0);

                    for (let z = 0; z < r; z++) {
                        a[z] = as[j - 1][z];
                        b[z] = bs[j - 1][z];
                    }

                    let z = r;
                    if (flag) {
                        a[z] = as[j - 1][z] - 1;
                        b[z] = a[z] && bs[j - 1][z];
                    } else {
                        b[z] = bs[j - 1][z] - 1;
                        a[z] = b[z] && as[j - 1][z];
                    }

                    if (a[z] < 0 || b[z] < 0) {
                        break bnb;
                    }

                    let {A, B} = this.generatePattern(a, b, demands.slice(0), r + 1);

                    as.push(A);
                    bs.push(B);

                    if (!(this.null(A) || this.null(B))) {
                        cb(A, B);
                    }
                }
                r = r + 1;
            }
        }
    }

    generatePattern (a, b, remaining, from) {
        // Phase I
//        var max = this.cuttingUtils.phase1InitialMax(a, b, this.itemsw, this.itemsh, this.W, this.L);
//        console.log(max, '))))))))))))))))))))))))))))))');
        for (let idx = from; idx < this.sorted.length; idx++) {
            if (!this.demandForStrip(idx)) {
                continue;
            }

            let w = this.itemsw[idx];
            let h = this.itemsh[idx];
            if (w * h === 0) {
                continue; // We have probably a 0 demand for some item
            }

            // XXX: CAREFUL HERE, from simple tests not doing this check is OK, could it result in oversatisfied cutting plans?
//            if (!this.cuttingUtils.stripFits(w, h, max)) {
//                continue;
//            }

            let sum = 0;
            for (let i = 0; i < idx; i++) {
                let strip = this.cuttingUtils.secondarySideMultiplied(a[i], b[i], this.itemsw[i], this.itemsh[i]);
                sum += strip;
//                console.log('a[' + i + ']:', a[i], 'b[' + i + ']:', b[i], 'Sum:', sum, 'Strip dim:', strip);
            }
            let remainingDim = this.cuttingUtils.secondarySide(this.W, this.L) - sum;
            let secondarySide = this.cuttingUtils.secondarySide(w, h);
            let quotient = Math.floor(remainingDim / secondarySide);

//            console.log('Remaining dim:', remainingDim, 'Secondary side:', secondarySide, 'quotient', quotient);

            if (quotient <= 0) { // hack for the < part, for now
                continue;
            }

//            console.log('Idx:', idx, 'Patterns:', this.itemscs[idx], 'Times (for previous):', times, 'Remaining (before):', remaining);
            let times = this.fit(remaining, idx, quotient);

//            console.log(times, this.itemscs[idx]);
            let {An, Bn} = this.cuttingUtils.split(times);

//            console.log('An: ', An, 'Bn:', Bn, 'times:', times, 'idx:', idx, this.itemscs[idx]); // Do not remove me for now - I will reveal bugs in tests at least!
            if (An * Bn > 0) {
                a[idx] += An;
                b[idx] += Bn;

//                max = this.cuttingUtils.secondarySide(w, h);

                this.subtractRemaining(remaining, this.costFor(idx, An * Bn));
            }
        }

        return {A: a, B: b};
    }

    costFor (idx, times) {
        return this.itemscs[idx].map(el => times * el);
//        return this.itemscs[idx].reduce((acc, el) => acc.map(a => a + (el * times)), this.demands.map(() => 0));
    }

    fit (remaining, index, quotient) {
        remaining = remaining.slice(0);
//        var weight = this.costFor(index, quotient);
        var weight = this.costFor(index, 1);
        var times = -1;

//        console.log(weight, '-------------------');
        do {
//            console.log(remaining);
            times++;
            this.subtractRemaining(remaining, weight);
        } while (!this.negative(remaining) && times < quotient);

        return times;
    }

    subtractRemaining (remaining, weight) {
        for (var i = 0; i < remaining.length; i++) {
            remaining[i] -= weight[i];
        }
    }

    indicesToWeight (indices) {
        return indices.reduce((acc, count, idx) => {
            for (let i = 0; i < count; i++) {
//                console.log(indices, this.itemscs[idx], idx, this.itemscs);
                for (let j = 0; j < this.itemscs[idx].length; j++) {
                    acc[j] += this.itemscs[idx][j];
                }
            }
            return acc;
        }, this.itemscs[0].map(() => 0));
    }

    restoreOne (remaining, weight) {
        for (var i = 0; i < remaining.length; i++) {
            remaining[i] += weight[i];
        }
    }

    negative (arr) {
        return arr.some(el => el < 0);
    }

    null (arr) {
        return arr.every(el => el === 0);
    }

    hash (arr) {
        return arr.reduce((acc, curr) => acc + curr, '');
    }

    toHash (arr) {
        return arr.join(':');
    }

    demandForStrip (idx) {
        return this.itemscs[idx].reduce((acc, el, i) => acc || !!(el * this.demands[i]), false);
    }
}
