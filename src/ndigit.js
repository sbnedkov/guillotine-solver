export default class NDigit {
    constructor (arr, idx) {
        this.initial = arr[idx];
        this.value = arr;
        this.idx = idx;
    }

    dec () {
        return --this.value[this.idx];
    }

    reset () {
        this.value[this.idx] = this.initial;
    }

    val () {
        return this.value[this.idx];
    }
}
