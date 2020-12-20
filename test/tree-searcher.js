require('source-map-support').install();

import assert from 'assert';

import treesearch from '../dist/tree-searcher';

describe('tree-generator', () => {
//    it('should solve a base case', () => {
//        var activities = [
//            [2, 0, 1, 0, 0],
//            [1, 1, 1, 0, 0],
//            [1, 0, 2, 0, 0],
//            [1, 0, 1, 2, 0],
//            [1, 0, 1, 0, 2],
//            [0, 1, 3, 0, 0],
//            [0, 1, 2, 0, 1],
//            [0, 1, 1, 1, 1],
//            [0, 1, 1, 0, 2],
//            [0, 1, 0, 1, 2],
//            [0, 0, 4, 0, 0],
//            [0, 0, 3, 1, 1],
//            [0, 0, 3, 0, 2],
//            [0, 0, 2, 2, 1],
//            [0, 0, 2, 1, 2],
//            [1, 0, 0, 3, 0],
//            [0, 0, 0, 3, 3],
//            [0, 0, 1, 2, 2],
//            [0, 0, 0, 1, 5],
//            [0, 0, 0, 0, 6]
//        ];
//        var demands = [1, 1, 4, 5, 3];
//        var costs = [72, 76, 120, 44, 84, 40, 64, 68, 88, 92, 84, 28, 48, 32, 52, 48, 0, 56, 40, 60];
//        var resultActivities = [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
//
//        var results = treesearch(activities, demands, costs);
//        assert.deepEqual(results, resultActivities);
//    });
    it('should solve a base case #2', () => {
        var activities = [
            [2, 0, 1],
            [0, 1, 5],
            [0, 0, 6]
        ];
        var demands = [2, 1, 4];
        var costs = [72, 76, 120];
        var resultActivities = [1, 1, 0];

        var results = treesearch(activities, demands, costs);
        assert.deepEqual(results, resultActivities);
    });
});
