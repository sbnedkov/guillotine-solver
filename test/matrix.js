require('source-map-support').install();

import assert from 'assert';

import Matrix from '../dist/matrix';

describe('Matrix', () => {
    describe('constructor()', () => {
        it('should not break on empty parameter list', (done) => {
            new Matrix();
            done();
        });

        it('should create the correct dimensions', () => {
            var m = new Matrix(4, 3);

            assert.equal(m.arr.length, 4);
            assert.equal(m.arr[0].length, 3);
        });
    });

    describe('zero()', () => {
        it('should null whole matrix in place', () => {
            var m = new Matrix(4, 3);
            m.zero();

            assert.equal(m.arr.length, 4);
            assert.equal(m.arr[0].length, 3);
            m.arr.forEach(row => {
                row.forEach(el => {
                    assert.equal(el, 0);
                });
            });
        });
    });

    describe('multiply()', () => {
        it('should multiply vector', () => {
            var m = new Matrix(4, 3);
            m.setRow(0, [1, 1, 1]);
            m.setRow(1, [2, 2, 2]);
            m.setRow(2, [3, 3, 3]);
            m.setRow(3, [4, 4, 4]);

            var vector = [1, 0, 1];
            var res = m.multiply(vector);

            assert.equal(res.length, 4);
            assert.equal(res[0], 2);
            assert.equal(res[1], 4);
            assert.equal(res[2], 6);
            assert.equal(res[3], 8);
        });
    });

    describe('setMatrix', () => {
        it('should set in beginning', () => {
            var m = new Matrix(4, 3);
            m.setRow(0, [1, 1, 1]);
            m.setRow(1, [2, 2, 2]);
            m.setRow(2, [3, 3, 3]);
            m.setRow(3, [4, 4, 4]);

            var mat = new Matrix(2, 2);
            mat.setRow(0, [5, 6]);
            mat.setRow(1, [7, 8]);

            m.setMatrix(0, 0, mat);

            assert.deepEqual(m.arr, [[5, 6, 1], [7, 8, 2], [3, 3, 3], [4, 4, 4]]);
        });

        it('should set in middle', () => {
            var m = new Matrix(4, 3);
            m.setRow(0, [1, 1, 1]);
            m.setRow(1, [2, 2, 2]);
            m.setRow(2, [3, 3, 3]);
            m.setRow(3, [4, 4, 4]);

            var mat = new Matrix(2, 2);
            mat.setRow(0, [5, 6]);
            mat.setRow(1, [7, 8]);

            m.setMatrix(1, 1, mat);

            assert.deepEqual(m.arr, [[1, 1, 1], [2, 5, 6], [3, 7, 8], [4, 4, 4]]);
        });
    });
});
