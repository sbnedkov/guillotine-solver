require('source-map-support').install();

import assert from 'assert';

//import treegen from '../dist/tree-generator';
import {satisfies, canAccomodateMore, activityAloneWontExceed, activityInCombinationWontExceed} from '../dist/tree-generator';

describe('tree-generator', () => {
    var activities;
    var demands;
    var result;
    var idx;
    var activities2 = [[1], [1]];
    var demands2 = [2];
    var result2 = [0, 1];
    var idx2 = 1;

    before(() => {
        activities = [[1, 0], [0, 1], [3, 3]];
        demands = [1, 1];
        result = [1, 1, 0];
        idx = 1;

        activities2 = [[1], [1]];
        demands2 = [2];
        result2 = [0, 1];
        idx2 = 1;
    });

//    it('should solve simple case #2', () => {
//        var activities = [[1], [1]];
//        var demands = [2];
//        var patterns = [[1, 0], [2, 0], [1, 1], [0, 1], [0, 2]];
//
//        var results = treegen(activities, demands);
//        assert.deepEqual(results, patterns);
//    });

//    it('should solve simple case #3', () => {
//        var activities = [[1, 0], [0, 1], [3, 3]];
//        var demands = [1, 1];
//        var patterns = [[1, 0, 0], [1, 1, 0], [0, 1, 0]];
//
//        var results = treegen(activities, demands);
//        assert.deepEqual(results, patterns);
//    });

    it('satisfies() #1', () => {
        var res = satisfies(result, activities, demands, idx);
        assert.deepEqual(res, true);
    });

    it('canAccomodateMore() #1', () => {
        var res = canAccomodateMore(result, activities, demands, idx);
        assert.deepEqual(res, true);
    });

    it('canAccomodateMore() #2', () => {
        var res = canAccomodateMore(result2, activities2, demands2, idx2);
        assert.deepEqual(res, true);
    });

    it('activityAloneWontExceed() #1', () => {
        var res = activityAloneWontExceed(result, activities, demands, idx);
        assert.deepEqual(res, true);
    });

    it('activityAloneWontExceed() #2', () => {
        var res = activityAloneWontExceed(result2, activities2, demands2, idx2);
        assert.deepEqual(res, true);
    });

    it('activityInCombinationWontExceed() #1', () => {
        var res = activityInCombinationWontExceed(result, activities, demands, idx);
        assert.deepEqual(res, true);
    });

    it('activityInCombinationWontExceed() #2', () => {
        var res = activityInCombinationWontExceed(result2, activities2, demands2, idx2);
        assert.deepEqual(res, true);
    });
});
