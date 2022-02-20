export default class Array2D {
    constructor (d1, d2) {
        this.d1 = d1;
        this.d2 = d2;

        this.arr = [];

        for (let i = 0; i < d1; i++) {
            this.arr.push(Array(d2));
        }
    }

    get (i, j) {
        return j >= 0 ? this.arr[i][j] : this.arr[i];
    }

    set (i, j, x) {
        this.arr[i][j] = x;
    }
}
