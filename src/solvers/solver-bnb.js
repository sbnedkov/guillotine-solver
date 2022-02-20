import CuttingPattern from '../cutting-pattern';
import cuttingUtilsService from '../cutting-utils';
import PatternDrainer from '../pattern-drainer';
import {unique} from '../utils';

export default class SolverBnB {
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
        this.canRotate = this.sorted.map(el => el.canRotate);

//        console.log(this.sorted);
//        console.log(this.map);

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

        this.dfs(this.demands, pattern => {
            this.patterns.push(pattern);
        });

        var uniquePatterns = unique(this.patterns, pattern => this.patternSignature(pattern.constituentsx, pattern.constituentsy));
        var drainedPatterns = [];

        uniquePatterns.forEach(pattern => {
            drainedPatterns.push(pattern);
            this.drainPattern(pattern, p => {
                var signature = this.patternSignature(p.constituentsx, p.constituentsy);
                if (!this.patternMemory[signature]) {
                    drainedPatterns.push(p);
                    this.patternMemory[signature] = true;
                }
            });
        });

        var mappedPatterns = drainedPatterns.map(activity => activity.remap(this.map));

        var fittingPatterns = this.filterNotFitting(mappedPatterns);

        this.memory[hashStr] = fittingPatterns;
//        console.log(fittingPatterns);

        return this.memory[hashStr];
    }

    dfs (demands, cb) {
//        process.stdout.write(demands + ' ');
        var m = this.itemsw.length;
        var a = this.sorted.map(() => 0);
        var b = this.sorted.map(() => 0);

        var {p} = this.generatePattern(a, b, demands.slice(0), 0);
        let fitPattern = this.makeFit(p, demands);
        let remaining = this.calculateRemaining(fitPattern.pattern, demands);

        let pattern = this.generatePatternPhase2And3(remaining, fitPattern);

        if (pattern.nonNull) {
            cb(pattern);

            let as = [a];
            let bs = [b];
            let r = 0;
            let j = 0;

            bnb:
            while (r < m) {
                while (as[j][r] > 0) {
                    let flag = this.cuttingUtils.getBranchFlag(as[j][r], bs[j][r]);
                    j = j + 1;

                    let a = this.itemsw.map(() => 0);
                    let b = this.itemsw.map(() => 0);

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

                    let {p, A, B} = this.generatePattern(a, b, demands.slice(0), r + 1);

                    as.push(A);
                    bs.push(B);

                    let fitPattern = this.makeFit(p, demands);
                    let remaining = this.calculateRemaining(fitPattern.pattern, demands);

                    let pattern = this.generatePatternPhase2And3(remaining, fitPattern);

                    if (pattern.nonNull) {
                        cb(pattern);
                    }
                }
                r = r + 1;
            }
        }
    }

    generatePattern (a, b, remaining, from) {
        // Phase I
        var initialMax;
        var max = initialMax = this.cuttingUtils.phase1InitialMax(a, b, this.itemsw, this.itemsh, this.W, this.L);
        for (let idx = from; idx < this.sorted.length; idx++) {
            if (this.demands[idx] === 0) {
                continue;
            }

            let w = this.itemsw[idx];
            let h = this.itemsh[idx];

            if (!this.cuttingUtils.phase1Fits(w, h, max, this.W, this.L)) {
                continue;
            }

            let sum = 0;
            for (let i = 0; i < idx; i++) {
                sum += this.cuttingUtils.mainSideMultiplied(a[i], b[i], this.itemsw[i], this.itemsh[i]);
            }
//            console.log('idx = ', idx, 'sum = ', sum, a, b);
            let quotient = (this.cuttingUtils.primarySide(this.W, this.L) - sum) / this.cuttingUtils.primarySide(w, h);

            let {An, Bn} = this.cuttingUtils.phase1(quotient, remaining[idx]);
//            console.log('An = ', An, 'Bn = ', Bn, 'remaining = ', remaining[idx]);
            a[idx] += An;
            b[idx] += Bn;

            if (max === initialMax && An * Bn > 0) {
                max = this.cuttingUtils.secondarySide(w, h);
            }

            this.subtractRemaining(remaining, idx, An * Bn);
        }

        var pattern = new CuttingPattern(a, b, this.itemsw, this.itemsh, this.cuttingUtils, this.W, this.L);

        return {A: a, B: b, p: pattern};
    }

    generatePatternPhase2And3 (remaining, pattern) {
        // Phase II
        for (let i = 0; i < this.itemsw.length; i++) {
            if (this.demands[i] === 0) {
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

            let {An, Bn} = this.cuttingUtils.phase2(w, h, pattw + this.minWidth, patth + this.minHeight, pattern, remaining[i], this.W, this.L);
            if (An * Bn) {
                pattern.addn(An, Bn, i, this.cuttingUtils.phase2X(pattw, pattern), this.cuttingUtils.phase2Y(patth, pattern), w, h, true);
                this.subtractRemaining(remaining, i, An * Bn);
            }
        }

        // Phase III
        pattern.locations[0] && pattern.locations[0].slice(0).forEach(loc => {
            if (loc) {
                let pattw = loc.x2 - loc.x1;
                let patth = loc.y2 - loc.y1;

                for (let i = 0; i < this.itemsw.length; i++) {
                    if (this.demands[i] === 0) {
                        continue;
                    }

                    let w = this.itemsw[i];
                    let h = this.itemsh[i];

                    let {An, Bn} = this.cuttingUtils.phase3(w, h, pattw, patth, pattern, remaining[i]);
                    if (An * Bn) {
                        pattern.addn(An, Bn, i, this.cuttingUtils.phase3X(loc), this.cuttingUtils.phase3Y(loc), w, h);
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

    makeFit (pattern, demands) {
        var afit = demands.map(() => 0);
        var bfit = afit.slice(0);

        var A = this.reduce(pattern.constituentsx);
        var B = this.reduce(pattern.constituentsy);
//        console.log('before:', A, B);

        afit.forEach((_, idx) => {
            var {a, b} = this.cuttingUtils.fitConstituents(A[idx], B[idx], demands[idx]);
            afit[idx] = a;
            bfit[idx] = b;
        });
//        console.log('after:', afit, bfit, 'for', demands);

        var pfit = new CuttingPattern(afit, bfit, this.itemsw, this.itemsh, this.cuttingUtils, this.W, this.L);

        return pfit;
    }

    reduce (constituents) {
        return constituents.reduce((acc, curr) => {
            return acc.map((el, idx) => el + curr[idx]);
        }, this.sorted.map(() => 0));
    }

    hash (arr) {
        return arr.join(':');
    }

    filterNotFitting (patterns) {
        return patterns.filter(pattern => pattern.fits());
    }

    calculateRemaining (pattern, demands) {
        return demands.map((el, idx) => el - pattern[idx]);
    }

    patternSignature (constituentsx, constituentsy) {
        return [constituentsx.map(c => c || c.join('-')), constituentsy.map(c => c || c.join('-'))].join(':');
    }

    drainPattern (pattern, cb) {
//        console.log(pattern);
        var drainer = new PatternDrainer(pattern, this.cuttingUtils);

        var mainConstituent;
        while ((mainConstituent = drainer.next())) {
            var complement = drainer.complement(mainConstituent);
            let p = this.cuttingUtils.newFromConstituents(mainConstituent, complement, this.itemsw, this.itemsh, this.W, this.L);

            if (p.nonNull) { // Safety net
                cb(p);
                break;
            }
        }
    }
}
