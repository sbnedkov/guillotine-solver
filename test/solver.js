require('source-map-support').install();

import assert from 'assert';

import {default as solve, offset} from '../dist/solver';

describe('solve', () => {
    it('solves example', () => {
        var demands = [1, 1, 4, 5, 3];
        var itemsw = [2200, 1000, 1400, 1600, 1000];
        var itemsh = [600, 800, 600, 800, 600];
        var results = solve([1400], [3000], itemsh, itemsw, demands); // TODO: substitute width for length, height for width

        assert.notEqual(results, null);
    });

    it('offsets correctly', () => {
        var activity1 = {
            locations: [[{
                y1: 100,
                y2: 105
            }, {
                y1: 105,
                y2: 110
            }]]
        };

        var activity2 = {
            locations: [[{
                y1: 0,
                y2: 5
            }, {
                y1: 5,
                y2: 10
            }]]
        };

        var activity3 = {
            locations: [[{
                y1: 0,
                y2: 5
            }, {
                y1: 5,
                y2: 10
            }]]
        };

        var activities = [activity1, activity2];


        offset(activity1, 0, activities);
        offset(activity2, 1, activities);
        offset(activity3, 2, activities);

        assert.equal(110, activity2.locations[0][0].y1);
        assert.equal(115, activity2.locations[0][0].y2);
        assert.equal(115, activity2.locations[0][1].y1);
        assert.equal(120, activity2.locations[0][1].y2);

        assert.equal(120, activity3.locations[0][0].y1);
        assert.equal(125, activity3.locations[0][0].y2);
        assert.equal(125, activity3.locations[0][1].y1);
        assert.equal(130, activity3.locations[0][1].y2);
    });
});
