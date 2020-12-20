require('source-map-support').install();

import assert from 'assert';

import {createReverseMap} from '../dist/utils';

describe('utils', () => {
    it('createReverseMap() #1', () => {
        var map = [1, 3, 2, 0];

        var reverse = createReverseMap(map);

        assert.deepEqual([3, 0, 2, 1], reverse);
    });

    it('createReverseMap() #2', () => {
        var map = [4, 5, 3, 0, 1, 2];

        var reverse = createReverseMap(map);

        assert.deepEqual([3, 4, 5, 2, 0, 1], reverse);
    });
});
