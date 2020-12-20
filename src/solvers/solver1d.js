import matrixInverse from 'matrix-inverse';

import Matrix from '../matrix';
import {adhoc, knapsack} from '../knapsack';
import {range, isZero, isZeroVector, multiplyVectors, roundValue, zeroVector, zip} from '../utils';

export default class Solver1D {
    constructor (stocks, costs, items, demands) {
        this.items = items;
        this.demands = demands;

        var m = this.items.length;
        var B = new Matrix(m + 1, m + 1).zero();

        var c = [1];
        this.slackVars = [];
        this.activitiesRecord = [];
        this.items.forEach((item, idx) => {
            var stockIdx = stocks.findIndex(stock => {
                return stock >= item;
            });
            if (!~stockIdx) {
                throw new Error(`No stock can satisfy item of length: ${item}`);
            }

            var activity = Math.floor(stocks[stockIdx] / item);
            c.push(-1 * costs[stockIdx]);

            B.set(idx + 1, idx + 1, activity);

            var P = zeroVector(m);
            P[idx] = -1;
            this.slackVars[idx] = [0].concat(P);

            var A = zeroVector(m);
            A[idx] = activity;
            this.recordActivity([-1 * costs[stockIdx]].concat(A));
        });
        B.setRow(0, c);

        this.BInv = new Matrix();
        this.BInv.setData(matrixInverse(B.arr));

        var NPrime = [0].concat(demands);
        this.N = this.BInv.multiply(NPrime);

//        console.log(NPrime, this.N, B, this.BInv);
//        throw new Error();

        // Sort in descending order, but record indices
        var stockZip = zip(stocks, costs);
        this.sorted = stockZip.map((el, idx) => {
            return {el, idx};
        }).sort((el1, el2) => el2.el[0] - el1.el[0]);

        this.stocks = this.sorted.map(el => el.el[0]);
        this.costs = this.sorted.map(el => el.el[1]);
    }

    solve () {
        var m = this.items.length;

        let G = new Matrix(m + 1, m + 3);
        const cond = true; // fake variable to silence the linter
        while (cond) {
            let P, Y;
            let stockIdx = this.shouldUseSlack(this.BInv);
            P = this.slackVars[stockIdx];
            if (stockIdx !== -2 && !this.wasUsed(P)) {
//                console.log('Slack ' + stockIdx);
                Y = this.BInv.multiply(P.slice(1));
            } else {
                for (let i = 0; i < this.stocks.length; i++) {
                    let stock = this.stocks[i];
                    let cost = this.costs[i];
                    let constraints = this.BInv.arr[0].slice(1);

                    P = adhoc(
                        stock,
                        this.items,
                        constraints);

                    P = [-1 * this.costs[i]].concat(P);
                    Y = this.BInv.multiply(P);

                    if (this.suitable(P.slice(1), stock, cost, this.items, constraints) && !this.wasUsed(P)) {
                        stockIdx = i;
//                        console.log('Activities after adhoc', P);
                        break;
                    }
                }

                if (!(stockIdx >= 0)) {
                    let constraints = this.BInv.arr[0].slice(1);

                    let Ps = knapsack(
                        this.stocks,
                        this.items,
                        this.demands,
                        constraints,
                        this.costs);

                    for (let i = 0; i < Ps.length; i++) {
                        P = Ps[i];
                        P = [-1 * this.costs[i]].concat(P);
                        Y = this.BInv.multiply(P);

                        if (!isZeroVector(P.slice(1)) && !this.wasUsed(P)) {
                            stockIdx = i;
//                            console.log('Activities after knapsack', P);
                            break;
                        }
                    }
                }
            }
//            console.log(P, Y);

            if (stockIdx >= 0){
                let min = 1e24, k = 0;
                range(1, m + 1).forEach(idx => {
                    var x = this.N[idx];
                    var y = Y[idx];

                    if (x >= 0 && y > 0 && x / y < min) {
                        min = x / y;
                        k = idx;
                    }
                });

                if (isZero(min)) {
                    throw new Error('Degeneracy - TODO');
                }

                G.setMatrix(0, 0, this.BInv);
                G.setColumn(m + 1, this.N);
                G.setColumn(m + 2, Y);
//                console.log(G);
//                throw new Error();
                range(0, m + 1).forEach(row => {
                    if (row === k) {
                        G.multiplyRow(row, 1 / Y[k]);
                    } else {
                        G.eliminate(k, row, m + 2);
                    }
                });
//                console.log('G after elimination:', round(G));

                this.BInv = G.submatrix(0, 0, m + 1, m + 1);
                this.N = G.splitColumn(m + 1);

                var withoutCost = P.slice(1);
                this.slackVars[k - 1] = withoutCost;
                this.recordActivity(P);

//                console.log(`#${k - 1} activity is for #${this.sorted[stockIdx].idx} stock`);
            } else {
//                console.log(round(G));
//                console.log(`Final cost: ${G.get(0, m + 1)}`);
//                console.log(this.N);

                break;
            }
        }

        var result = new Matrix(m, m);
        result.setData(matrixInverse(this.BInv.arr));
//        console.log('Result:', result.arr);

        var counts = this.N.slice(1);
        var activities = range(1, m + 1).map(idx => {
            var A = result.splitColumn(idx);
            return {
                activities: A.slice(1),
                stockIdx: this.stockIndex(A[0])
            };
        });

        return {
            counts: counts,
            cost: roundValue(G.get(0, m + 1)),
            activities
        };
    }

    shouldUseSlack (BInv) {
        return BInv.arr[0].findIndex((el, idx) => el < 0 && idx > 0) - 1;
    }

    suitable (activities, stock, cost, items, constraints) {
        return stock >= multiplyVectors(items, activities) && multiplyVectors(constraints, activities) > cost;
    }

    remap (arr) {
        return arr.map((ign, idx) => arr[this.map[idx]]);
    }

    recordActivity (activity) {
        this.activitiesRecord.push(activity);
    }

    wasUsed (activity) {
        return this.activitiesRecord.find(a => {
            var diff = a.map((x, idx) => {
                return x - activity[idx];
            });
            return isZeroVector(diff);
        });
    }

    stockIndex (activityStock) {
        return this.sorted[this.costs.findIndex(stock => isZero(stock + activityStock))].idx;
    }
}
