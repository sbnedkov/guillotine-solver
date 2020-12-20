import assert from 'assert';

import {adhoc, knapsack} from '../dist/knapsack';

describe('knapsack()', () => {
    /*
    it('should return the correct values #1', () => {
        var d = [2, 5];
        var v = [2, 5];
        var D = 7;
        var demands = [1, 2];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [1, 1]);
    });

    it('should return the correct values #2', () => {
        var d = [1, 5];
        var v = [1, 5];
        var D = 7;
        var demands = [2, 1];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [2, 1]);
    });

    it('should return the correct values #3', () => {
        var d = [2, 5];
        var v = [1, 2];
        var D = 7;
        var demands = [2, 1];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [1, 1]);
    });

    it('should return the correct values #4', () => {
        var d = [1, 2, 3, 4];
        var v = [1, 1, 1, 1];
        var D = 10;
        var demands = [2, 3, 3, 6];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [2, 3, 0, 0]);
    });

    it('should return the correct values #5', () => {
        var d = [1, 2, 4];
        var D = 10;
        var v = [1, 2, 3];
        var demands = [10, 10, 10];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [10, 0, 0]);
    });

    it('should return the correct values #6', () => {
        var d = [10, 20, 30, 40, 50];
        var D = 100;
        var v = [1, 200, 400, 100, 100];
        var demands = [10, 10, 10, 1, 1];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [1, 0, 3, 0, 0]);
    });

    it('should return the correct values #7', () => {
        var d = [10, 20];
        var D = 40;
        var v = [1, 200];
        var demands = [10, 10];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [0, 2]);
    });

    it('should return the correct values #8', () => {
        var d = [10, 20, 30];
        var D = 60;
        var v = [1, 1, 200];
        var demands = [10, 10, 10];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [0, 0, 2]);
    });

    it('should return the correct values #9', () => {
        var d = [10, 20, 30, 40];
        var D = 100;
        var v = [1, 1, 200, 300];
        var demands = [10, 10, 10, 10];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [0, 0, 2, 1]);
    });

    it('should return the correct values #10', () => {
        var d = [5, 20, 30, 40];
        var D = 105;
        var v = [1, 1, 200, 300];
        var demands = [10, 10, 10, 10];

        var result = knapsack(D, d, v, demands);

        assert.deepEqual(result, [1, 0, 2, 1]);
    });
    */

    it('should return the correct values #11', () => {
        var d = [2, 3, 4];
        var D = [9];
        var demands = [20, 10, 20];
        var constraints = [2, 10/3, 5];
        var costs = [0];

        var result = knapsack(D, d, demands, constraints, costs);

        assert.deepEqual(result, [[1, 1, 1]]);
    });

    it('should return the correct values #12', () => {
        var d = [2, 3, 4];
        var D = [9];
        var demands = [20, 10, 20];
        var constraints = [2, 3, 5];
        var costs = [10];

        var result = knapsack(D, d, demands, constraints, costs);

        assert.deepEqual(result, [[0, 0, 0]]);
    });
});

describe('adhoc()', () => {
    it('should return the correct values for adhoc procedure #1', () => {
        var d = [2, 3, 4];
        var D = 6;
        var constraints = [7/3, 10/3, 5];

        var result = adhoc(D, d, constraints);

        assert.deepEqual(result, [1, 0, 1]);
    });
});
