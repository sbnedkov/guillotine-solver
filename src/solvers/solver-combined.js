import CuttingPattern from '../cutting-pattern';
import cuttingUtilsService from '../cutting-utils';
import { createReverseMap } from '../utils';

export default class SolverCombined {
    constructor (W, L, itemsw, itemsh, allowRotation, cutType) {
        var itemdata = itemsw.map((el, idx) => {
            return {
                w: el,
                h: itemsh[idx],
                canRotate: allowRotation[idx],
                idx: idx
            };
        });

        this.cuttingUtils = cuttingUtilsService(cutType);

        this.sorted = itemdata.sort((a1, a2) => {
            return this.cuttingUtils.sortPredicate(a1, a2, W, L);
        });

        this.itemsw = this.sorted.map(el => el.w);
        this.itemsh = this.sorted.map(el => el.h);
        this.map = this.sorted.map(el => el.idx);
        this.reverseMap = createReverseMap(this.map);
        this.canRotate = this.sorted.map(el => el.canRotate);

        this.W = W;
        this.L = L;

        this.memory = {};
    }

    solve (demands) {
        this.demands = demands.map((_, idx) => demands[this.map[idx]]);

        // Hack to be like Optimik
        this.minHeight = this.cuttingUtils.minHeight(this.itemsh);
        this.minWidth = this.cuttingUtils.minWidth(this.itemsw);

        this.patternMemory = {};
        var hashStr = this.hash(this.demands);
        if (this.memory[hashStr]) {
            return this.memory[hashStr];
        }

        this.patterns = [];

        let hasNew = true;
        while (this.demands.some(d => d > 0) && hasNew) {
            hasNew = false;
            this.dfs(this.demands, pattern => {
                hasNew = true;
                this.patterns.push(pattern);
            });
        }

        if (this.demands.some(d => d > 0)) {
            throw new Error('Не може да се задоволи търсенето.');
        }

        this.memory[hashStr] = this.patterns;

        return this.memory[hashStr];
    }

    dfs (demands, cb) {
        var { p } = this.generatePattern(demands, 0);

        if (p.nonNull) {
            let pattern = this.generatePatternPhase2And3(demands, p);
            cb(pattern);

            let hasNew;
            do {
                hasNew = false;
                let { p } = this.generatePattern(demands, 0);

                if (p.nonNull) {
                    let pattern = this.generatePatternPhase2And3(demands, p);
                    cb(pattern);
                    hasNew = true;
                }
            } while (hasNew);
        }
    }

    generatePattern (remaining, from) {
        // Phase I
        const newA = remaining.map(() => 0);
        const newB = remaining.map(() => 0);
        let sum = 0;
        for (let idx = from; idx < this.sorted.length; idx++) {
            if (remaining[idx] === 0) {
                continue;
            }

            let w = this.itemsw[idx];
            let h = this.itemsh[idx];

            for (let i = 0; i < idx; i++) {
                sum += this.cuttingUtils.mainSideMultiplied(newA[i], newB[i], this.itemsw[i], this.itemsh[i]);
            }
            // console.log('idx = ', idx, 'sum = ', sum, a, b);
            let quotient = (this.cuttingUtils.primarySide(this.W, this.L) - sum) / this.cuttingUtils.primarySide(w, h);

            if (quotient < 0) {
                continue;
            }

            let { An, Bn } = this.cuttingUtils.phase1(quotient, remaining[idx]);
            if (An * Bn) {
                // console.log('An = ', An, 'Bn = ', Bn, 'remaining = ', remaining[idx]);
                newA[idx] += An;
                newB[idx] += Bn;

                this.subtractRemaining(remaining, idx, An * Bn);
            }
        }

        var pattern = new CuttingPattern(this.remap(newA), this.remap(newB), this.remap(this.itemsw), this.remap(this.itemsh), this.cuttingUtils, this.W, this.L);

        return { A: newA, B: newB, p: pattern };
    }

    remap (arr) {
        return arr.map((_, idx) => arr[this.reverseMap[idx]]);
    }

    generatePatternPhase2And3 (remaining, pattern) {
        // Phase II
        for (let i = 0; i < this.itemsw.length; i++) {
            if (remaining[i] === 0) {
                continue;
            }

            if (!this.canRotate[i]) {
                continue;
            }

            let w = this.itemsw[i];
            let h = this.itemsh[i];
            let pattw = pattern.getMaxX();
            let patth = pattern.getMaxY();

            let primarySideMax = this.cuttingUtils.primarySide(pattw, patth);
            if (primarySideMax === 0) { // Bail if we had another option to place this in its primary direction
                let primarySide = this.cuttingUtils.primarySide(w, h);
                if (primarySide <= this.cuttingUtils.primarySide(this.W, this.L)) {
                    continue;
                }
            }

            let { An, Bn } = this.cuttingUtils.phase2(w, h, pattw + this.minWidth, patth + this.minHeight, pattern, remaining[i], this.W, this.L);
            if (An * Bn) {
                pattern.addn(An, Bn, this.map[i], this.cuttingUtils.phase2X(pattw, pattern), this.cuttingUtils.phase2Y(patth, pattern), w, h, true);
                this.subtractRemaining(remaining, i, An * Bn);
            }
        }

        // Phase III
        pattern.locations[0] && pattern.locations[0].slice(0).forEach(loc => {
            if (loc) {
                let pattw = loc.x2 - loc.x1;
                let patth = loc.y2 - loc.y1;

                for (let i = 0; i < this.itemsw.length; i++) {
                    if (remaining[i] === 0) {
                        continue;
                    }

                    let w = this.itemsw[i];
                    let h = this.itemsh[i];

                    let { An, Bn } = this.cuttingUtils.phase3(w, h, pattw, patth, pattern, remaining[i]);
                    if (An * Bn) {
                        pattern.addn(An, Bn, this.map[i], this.cuttingUtils.phase3X(loc), this.cuttingUtils.phase3Y(loc), w, h);
                        this.subtractRemaining(remaining, i, An * Bn);
                        break;
                    }
                }
            }
        });

        return pattern;
    }

    subtractRemaining (remaining, idx, q) {
        remaining[idx] = Math.max(remaining[idx] - q, 0);
    }

    patternWorth (activity) {
        var waste = this.cuttingUtils.lossPercent(activity, this.W, this.L) * this.cuttingUtils.stripArea(activity, this.W, this.L);

        var usage = 1 - waste / (this.W * this.L);
        var area = activity.area() / (this.W * this.L);

        return usage * area;
    }

    reduce (constituents) {
        return constituents.reduce((acc, curr) => {
            return acc.map((el, idx) => el + curr[idx]);
        }, this.sorted.map(() => 0));
    }

    hash (arr) {
        return arr.join(':');
    }

    patternSignature (constituentsx, constituentsy) {
        return [constituentsx.map(c => c || c.join('-')), constituentsy.map(c => c || c.join('-'))].join(':');
    }
}
