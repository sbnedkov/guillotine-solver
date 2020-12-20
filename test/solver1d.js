require('source-map-support').install();

import assert from 'assert';

import Solver1D from '../dist/solvers/solver1d';
import {roundCountsUp, calculateCost} from '../dist/utils';

describe('Solver1D', () => {
    describe('solve', () => {
        it('end to end test', () => {
            var items = [2, 3 , 4];
            var demands = [20, 10, 20];
            var solver = new Solver1D([5, 6, 9], [6, 7, 10], items, demands);
            var res = solver.solve();

            assert.equal(res.cost, 170);
            assert.deepEqual(res.counts, [10, 10, 0]);
            assert.deepEqual(res.activities.map(a => a.activities), [[1, 0, 1], [1, 1, 1], [0, 0, 2]]);
            assert.deepEqual(res.activities.map(a => a.stockIdx), [1, 2, 2]);
            checkDemands(items, demands, res);
        });

        it('end to end test #2', () => {
            var items = [9, 8, 7, 6];
            var demands = [511, 301, 263, 383];
            var solver = new Solver1D([20], [1], items, demands);
            var res = solver.solve();

            assert.equal(res.cost, 600.375);
            assert.deepEqual(res.activities.map(a => a.stockIdx), [0, 0, 0, 0]);
            assert.deepEqual(res.counts, [255.5, 87.625, 131.5, 125.75]);
            assert.deepEqual(res.activities.map(a => a.activities), [[2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 2, 1], [0, 1, 0, 2]]);
            checkDemands(items, demands, res);
        });

        it('end to end test #3', () => {
            var items = [6, 4, 3, 2];
            var demands = [1000, 500, 119, 203];
            var solver = new Solver1D([20, 19, 17], [13.5, 13, 11], items, demands);
            var res = solver.solve();

            assert.equal(res.cost, 5860.5);
            assert.deepEqual(res.activities.map(a => a.stockIdx), [2, 0, 2, 0]);
            assert.deepEqual(res.counts, [10, 126, 119, 203]);
            checkDemandsRounded(items, demands, res);

            var counts = roundCountsUp(res.counts);
            var cost = calculateCost([13.5, 13, 11], res.activities, counts);

            assert.deepEqual(res.counts, [10, 126, 119, 203]);
            assert.equal(cost, 5860.5);
            checkDemandsRounded(items, demands, {activities: res.activities, counts});
        });

        it('end to end test #4', () => {
            var items = [6, 4, 3, 2];
            var demands = [540, 850, 40, 85];
            var solver = new Solver1D([20, 19, 17], [13.5, 13, 11], items, demands);
            var res = solver.solve();

            assert.equal(res.cost, 4658.75);
            assert.deepEqual(res.activities.map(a => a.stockIdx), [0, 0, 2, 0]);
//            assert.deepEqual(res.counts, [122.5, 105, 40, 85]);
            assert.deepEqual(res.counts, [207.5, 60, 40, 44.999999999999986]);
//            assert.deepEqual(res.activities.map(a => a.activities), [[2, 2, 0, 0], [0, 5, 0, 0], [1, 2, 1, 0], [3, 0, 0, 1]]);
            assert.deepEqual(res.activities.map(a => a.activities), [[2, 2, 0, 0], [0, 5, 0, 0], [2, 0, 1, 1], [1, 3.0000000000000004, 0, 1]]);
            checkDemandsRounded(items, demands, res);
        });

        it('end to end test #5', () => {
            var items = [6, 4, 2];
            var demands = [1500, 200, 203];
            var solver = new Solver1D([20, 19, 17], [13.5, 13, 11], items, demands);
            var res = solver.solve();

            assert.equal(res.cost, 7068.167);
//            assert.deepEqual(res.activities.map(a => a.stockIdx), [1, 0, 2]);
            assert.deepEqual(res.activities.map(a => a.stockIdx), [1, 2, 0]);
            assert.deepEqual(res.activities.map(a => a.activities), [[3, 0, 0], [2, 1, 0], [3, 0, 1]]);
            assert.deepEqual(res.counts, [163.66666666666669, 200, 203]);
            checkDemands(items, demands, res);
        });

        it('end to end test #6', () => {
            var items = [6, 4, 3, 2];
            var demands = [200, 150, 100, 120];
            var solver = new Solver1D([20, 19, 17], [13.5, 13, 11], items, demands);
            var res = solver.solve();

//            assert.equal(res.cost, 1532);
            assert.equal(res.cost, 1579.5);
//            assert.deepEqual(res.activities.map(a => a.stockIdx), [0, 2, 2, 2]);
            assert.deepEqual(res.activities.map(a => a.stockIdx), [0, 0, 0, 0]);
//            assert.deepEqual(res.activities.map(a => a.activities), [[3, 0, 0, 1], [1, 2, 1, 0], [2, 0, 1, 1], [0, 1, 1, 5]]);
            assert.deepEqual(res.activities.map(a => a.activities), [[3, 0, 0, 1], [1, 3, 0, 1.0000000000000002], [0, 0, 6, 1], [0, 0, 0, 10]]);
//            assert.deepEqual(res.counts, [32, 67.99999, 18.00001, 14]);
            assert.deepEqual(res.counts, [49.99999999999999, 49.99999999999999, 16.666666666666664, 0.3333333333333339]);
            checkDemandsRounded(items, demands, res);
        });

        it('end to end test #7', () => {
            var items = [6, 4, 3, 2];
            var demands = [220, 115, 120, 40];
            var solver = new Solver1D([20, 19, 17], [13.5, 13, 11], items, demands);
            var res = solver.solve();

//            assert.equal(res.cost, 1475);
            assert.equal(res.cost, 1497.917);
//            assert.deepEqual(res.activities.map(a => a.stockIdx), [1, 2, 1, 2]);
            assert.deepEqual(res.activities.map(a => a.stockIdx), [1, 0, 1, 2]);
//            assert.deepEqual(res.activities.map(a => a.activities), [[3, 0, 0, 0], [1, 2, 1, 0], [2, 1, 1, 0], [2, 0, 1, 1]]);
            assert.deepEqual(res.activities.map(a => a.activities), [[3, 0, 0, 0], [2, 2, 0, 0], [0, 0, 6, 0], [2, 0, 1, 1]]);
//            assert.deepEqual(res.counts, [5.000004, 35, 45, 40]);
            assert.deepEqual(res.counts, [8.333333333333336, 57.5, 13.333333333333334, 40]);
            checkDemands(items, demands, res);
        });
    });

    describe('solutionToInt', () => {
        it('rounds correctly', () => {
            var items = [9, 8, 7, 6];
            var demands = [511, 301, 263, 383];
            var solver = new Solver1D([20], [1], items, demands);
            var res = solver.solve();

            var counts = roundCountsUp(res.counts);
            var cost = calculateCost([1], res.activities, counts);

            assert.deepEqual(counts, [256, 88, 132, 126]);
            assert.equal(cost, 602);
            checkDemandsOrExceed(items, demands, {activities: res.activities, counts});
        });
    });

    function checkDemands (items, demands, res) {
        var itemCounts = getItemCounts(items, demands, res);
        assert.deepEqual(itemCounts, demands);
    }

    function checkDemandsRounded (items, demands, res) {
        var itemCounts = getItemCounts(items, demands, res);
        itemCounts.forEach((itemCount, idx) => {
            assert.equal(Math.round(itemCount), demands[idx]);
        });
    }

    function checkDemandsOrExceed (items, demands, res) {
        var itemCounts = getItemCounts(items, demands, res);
        itemCounts.forEach((itemCount, idx) => {
            assert(itemCount >= demands[idx], `${itemCount} >= ${demands[idx]}`);
        });
    }

    function getItemCounts (items, demands, res) {
        var activitiesCount = res.activities.map((a, idx) => {
            return a.activities.map(aa => aa * res.counts[idx]);
        });

        var itemCounts = items.map(() => 0);
        activitiesCount.forEach(a => {
            a.forEach((a, idx) => {
                itemCounts[idx] += a;
            });
        });

        return itemCounts;
    }
});
