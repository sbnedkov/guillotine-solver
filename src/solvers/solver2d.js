import matrixInverse from 'matrix-inverse';

import Matrix from '../matrix';
import Solver1D from './solver1d';
import {adhoc, knapsack} from '../knapsack';
import {range, isZero, isZeroVector, multiplyVectors, round, roundValue, zeroVector, zip} from '../utils';

export default class Solver2D {
    // TODO: make it work for arbitrary ordering of items widths - at the moment should work only for increasing sizes
    constructor (stocksw, stocksh, itemsw, itemsh, demands) {
        this.itemsw = itemsw;
        this.itemsh = itemsh;
        this.demands = demands;

        var zipped = zip(stocksw, stocksh);
        this.sortedByW = zipped.map((el, idx) => {
            return {el, idx};
        }).sort((el1, el2) => el2.el[0] - el1.el[0]);
        this.sortedByH = zipped.map((el, idx) => {
            return {el, idx};
        }).sort((el1, el2) => el2.el[1] - el1.el[1]);

        this.stocksw = this.sortedByW.map(el => el.el[0]);
        this.stocksh = this.sortedByW.map(el => el.el[1]);
        this.costs = this.sortedByW.map(el => el.el[0] * el.el[1]);

        var activities = new Solver1D(stocksw, stocksw, itemsw, demands).solve().activities.map(a => a.activities);/*knapsack(
            this.sortedByW.map(el => el.el[0]),
            itemsw,
            demands,
            range(0, itemsw.length).map((ign, i) => 1e12 * itemsw[i] * itemsh[i]),
            this.sortedByW.map(el => el.el[0] * el.el[1]));*/

        var stripActivities = knapsack(
            this.sortedByH.map(el => el.el[1]),
            itemsh,
            demands,
            range(0, itemsh.length).map((ign, i) => 1e12 * itemsw[i] * itemsh[i]),
            this.sortedByH.map(el => el.el[0] * el.el[1]));

        var m = itemsw.length;
        var M = stocksw.length;

        var A0 = new Matrix(m, M).zero();
        for (let j = 0; j < M; j++) {
            A0.setColumn(j, activities[j]);
        }

        var B = new Matrix(2 * m, 2 * m).zero();

        // XXX: What if we have more stocks than items
        var zeroMatrix = new Matrix(m, m - M).zero();

        var upperMatrices = range(1, m).map(s => {
            var upperMatrix = new Matrix(m, s).zero();
            upperMatrix.setConstantRow(s - 1, -1/* * this.costs[s - 1]*/); // XXX: is it -1 * cost or just -1?

            return upperMatrix;
        });

        console.log('Strip activities:', stripActivities);
        var lowerMatrices = range(1, m).map(s => {
            var lowerMatrix = new Matrix(m, s).zero();
            range(0, s - 1).forEach(i => {
                lowerMatrix.setColumn(i, stripActivities[i]);
            });

            return lowerMatrix;
        });

        var minusIdentity = new Matrix(m - M, m - M).zero().identity().multiplyMatrix(-1);

        B.setMatrix(0, 0, A0);
        var col = M;
        upperMatrices.forEach(mat => {
            B.setMatrix(0, col, mat);
            col += mat.arr[0].length;
        });
        B.setMatrix(0, col, zeroMatrix);

        col = M;
        lowerMatrices.forEach(mat => {
            B.setMatrix(m, col, mat);
            col += mat.arr[0].length;
        });
        B.setMatrix(col, col, minusIdentity);

        this.activitiesRecord = [];
//        this.items.forEach((item, idx) => {
//            var stockIdx = stocks.findIndex(stock => {
//                return stock >= item;
//            });
//            if (!~stockIdx) {
//                throw new Error(`No stock can satisfy item of length: ${item}`);
//            }
//
//            var activity = Math.floor(stocks[stockIdx] / item);
//            c.push(-1 * costs[stockIdx]);
//
//            B.set(idx + 1, idx + 1, activity);
//
//            var P = zeroVector(m);
//            P[idx] = -1;
//            this.slackVars[idx] = [0].concat(P);
//
//            var A = zeroVector(m);
//            A[idx] = activity;
//            this.recordActivity([-1 * costs[stockIdx]].concat(A));
//        });
//        B.setRow(0, c);

        console.log('B:', B.arr);

        this.BInv = new Matrix();
        this.BInv.setData(matrixInverse(B.arr));

        var NPrime = [0].concat(demands).concat(zeroVector(m - 1));
        this.N = this.BInv.multiply(NPrime);

        console.log('Matrix BInv:', this.BInv.arr);
    }

    solve () {
        var m = this.itemsh.length;

        let G = new Matrix(2 * m, 2 * m + 2);
        const cond = true; // fake variable to silence the linter
        while (cond) {
            let P, Y;
            let stockIdx = -2; // XXX = this.shouldUseSlack(this.BInv);
            // P = this.slackVars[stockIdx];
            if (stockIdx !== -2 && !this.wasUsed(P)) {
                Y = this.BInv.multiply(P.slice(1));
            } else {
                let constraints = this.BInv.arr[m].slice(m);

                for (let i = 0; i < this.stocksh.length; i++) {
                    let stock = this.stocksh[i];
                    let cost = this.costs[i];

                    P = adhoc(
                        stock,
                        this.itemsh,
                        constraints);

                    P = range(0, m).map(idx => idx === i ? -1 : 0).concat(P);
                    Y = this.BInv.multiply(P);

                    if (this.suitable(P.slice(m), stock, cost, this.itemsh, constraints) && !this.wasUsed(P)) {
                        stockIdx = i;
                        console.log('Activities after adhoc', P);
                        break;
                    }
                }

                if (!(stockIdx >= 0)) {
                    let Ps = knapsack(
                        this.stocksh,
                        this.itemsh,
                        this.demands,
                        constraints,
                        this.costs);

                    for (let i = 0; i < Ps.length; i++) {
                        P = Ps[i];
                        P = range(0, m).map(() => 0).concat(P);
                        Y = this.BInv.multiply(P);

                        if (!isZeroVector(P.slice(1)) && !this.wasUsed(P)) {
                            stockIdx = i;
                            console.log('Activities after knapsack', P);
                            break;
                        }
                    }
                }
            }
//            console.log(P, Y);

            if (stockIdx >= 0){
                let min = 1e24, k = 0;
                console.log(this.N, Y);
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
                G.setColumn(2 * m, this.N);
                G.setColumn(2 * m + 1, Y);
                console.log('G before:', G.arr);
                range(0, 2 * m).forEach(row => {
                    if (row === k) {
                        G.multiplyRow(row, 1 / Y[k]);
                    } else {
                        G.eliminate(k, row, 2 * m + 1);
                    }
                });

                console.log('G after elminitation:', G.arr);

                this.BInv = G.submatrix(0, 0, 2 * m, 2 * m);
                this.N = G.splitColumn(2 * m + 1);

//                var withoutCost = P.slice(1);
//                this.slackVars[k - 1] = withoutCost;
                this.recordActivity(P);

                console.log(`#${k - 1} activity is for #${this.sortedByH[stockIdx].idx} stock`);
            } else {
                console.log(round(G));
                console.log(`Final cost: ${G.get(0, m + 1)}`);
                console.log(this.N);

                break;
            }
        }

        var result = new Matrix(m, m);
        result.setData(matrixInverse(this.BInv.arr));
//        console.log('Result:', result.arr);

        var counts = this.N.slice(1);
        var activities = range(1, 2 * m).map(idx => {
            var A = result.splitColumn(idx);
            return {
                activities: A.slice(1),
                stockIdx: this.stockIndex(A[m] * this.stocksw[idx])
            };
        });

        return {
            counts,
            cost: roundValue(G.get(0, m + 1)),
            activities
        };
    }

    shouldUseSlack (BInv) {
        return BInv.arr[BInv.arr.length / 2].findIndex((el, idx) => el < 0 && idx > 0) - 1;
    }

    suitable (activities, stock, cost, items, constraints) {
        console.log('Suitable?', stock, items, activities, constraints, cost);
        return stock >= multiplyVectors(items, activities) && multiplyVectors(constraints, activities) > cost;
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
        return this.sortedByH[this.costs.findIndex(stock => isZero(stock + activityStock))].idx;
    }
}
