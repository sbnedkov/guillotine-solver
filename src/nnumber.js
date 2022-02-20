export default class NNumber {
    constructor (digits) {
        this.digits = digits;
        this.idx = digits.length - 1;
    }

    dec () {
        if (!~this.digits[this.idx].dec()) { // carry
            // Only in case we are not at first digit
            if (this.idx > 0) {
                // Find non-null to the left
                while (--this.idx >= 0 && !this.digits[this.idx].val());
                if (!~this.idx) {
                    return false;
                }
                // And descrease it
                this.digits[this.idx].dec();

                // All to the right are reset
                for (let i = this.idx + 1; i < this.digits.length; i++) {
                    this.digits[i].reset();
                }

                // New index is last one
                this.idx = this.digits.length - 1;
            } else {
                return false;
            }
        }

        return this.digits[0].value.some(d => d);
    }
}
