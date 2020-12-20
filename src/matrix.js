import {range} from './utils';

export default class Matrix {
    constructor (n, m) {
        this.arr = Array.apply(null, new Array(n)).map(() => Array.apply(null, new Array(m)));
    }

    get (i, j) {
        return this.arr[i][j];
    }

    set (i, j, x) {
        return this.arr[i][j] = x;
    }

    setRow (i, row) {
        this.arr[i].splice(0, row.length, ...row);
        return this.arr[i];
    }

    setConstantRow (i, x) {
        return this.arr[i] = this.arr[i].map(() => x);
    }

    setColumn (j, col) {
        range(0, this.arr.length).forEach(row => {
            this.arr[row][j] = col[row];
        });
        return col;
    }

    setMatrix (i, j, m) {
        if (m.arr.length > this.arr.length || m.arr[0].length > this.arr[0].length) {
            throw new Error('Attempt to set matrix to a lower dimension destination.');
        }

        range(i, i + m.arr.length).forEach(row => {
            this.arr[row] = this.arr[row].slice(0, j).concat(m.arr[row - i]).concat(this.arr[row].slice(j + m.arr[0].length));
        });

        return this;
    }

    setData (arr) {
        return this.arr = arr;
    }

    eliminate (srcRow, dstRow, pivotCol) {
        var factor = this.arr[dstRow][pivotCol] / this.arr[srcRow][pivotCol];
//        if (!isZero(factor)) {
            range(0, this.arr[0].length).forEach(colIdx => {
                this.arr[dstRow][colIdx] -= factor * this.arr[srcRow][colIdx];
            });
//        }
    }

    multiplyRow (row, factor) {
        range(0, this.arr[0].length).forEach(colIdx => {
            this.arr[row][colIdx] *= factor;
        });

        return this.arr[row];
    }

    multiplyMatrix (factor) {
        range(0, this.arr.length).forEach(rowIdx => {
            range(0, this.arr[rowIdx].length).forEach(colIdx => {
                this.arr[rowIdx][colIdx] *= factor;
            });
        });

        return this;
    }

    submatrix (startRow, startCol, endRow, endCol) {
        var mat = new Matrix(endRow - startRow, endCol - startCol);
        range(startRow, endRow).forEach(row => {
            range(startCol, endCol).forEach(col => {
                mat.arr[row - startRow][col - startCol] = this.arr[row][col];
            });
        });

        return mat;
    }

    splitColumn (col) {
        return range(0, this.arr.length).map(row => {
            return this.arr[row][col];
        });
    }

    zero () {
        this.setAll(0);

        return this;
    }

    identity () {
        range(0, this.arr.length).forEach(rowIdx => {
            range(0, this.arr[rowIdx].length).forEach(colIdx => {
                if (rowIdx === colIdx) {
                    this.arr[rowIdx][colIdx] = 1;
                }
            });
        });

        return this;
    }

    setAll (x) {
        this.arr.forEach(row => {
            Array.prototype.splice.apply(row, [0, row.length].concat(Array.apply(null, new Array(row.length)).map(() => x)));
        });

        return this;
    }

    multiply (vector) {
        if (vector.length !== this.arr[0].length) {
            throw new Error(`Vector has dimension: ${vector.length}, but matrix has ${this.arr[0].length} columns.`);
        }

        return this.arr.reduce((acc, row) => {
            acc.push(row.reduce((acc, el, idx) => {
                return acc + el * vector[idx];
            }, 0));
            return acc;
        }, []);
    }

    print () {
        console.log(`Matrix ${this.arr.length}x${this.arr[0].length}`);
        this.arr.forEach(row => {
            row.forEach(el => {
                console.log(el);
            });
            console.log();
        });
    }
}
