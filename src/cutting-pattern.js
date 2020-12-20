import {createReverseMap} from './utils';

export default class CuttingPattern {
    constructor (a, b, itemsw, itemsh) {
        this.pattern = a.map((a, idx) => a * b[idx]);
        this.constituentsx = [a.slice(0)];
        this.constituentsy = [b.slice(0)];
        this.patternIsRotated = [false];

        this.locations = [this.cuttingLocation(a, b, itemsw, itemsh)];
    }

    add (A, B, k, a, itemsw, itemsh) {
        // Location
        let quot = a.reduce((acc, curr, idx) => acc + curr * itemsh[idx], 0);
        let sum = 0;
        for (let z = 0; z <= k; z++) {
            sum += A[z] * itemsw[z];
        }
        let x1 = quot + sum - A[k] * itemsw[k];
        let y1 = 0;
        let x2 = quot + sum;
        let y2 = B[k] * itemsh[k];

        this.locations.push([{x1, y1, x2, y2}]);

        this.constituentsx.push(A);
        this.constituentsy.push(B);

        for (let i = 0; i < this.pattern.length; i++) {
            this.pattern[i] += A[i] * B[i];
        }

        this.patternIsRotated.push(false);
    }

    addv (A, B, z, i, b, ks, itemsw, itemsh, W) {
        // Location
        let sum = 0;
        for (let zz = 0; zz <= z; zz++) {
            sum += A[zz] * itemsh[zz];
        }
        let x1 = sum - A[z] * itemsh[z];
        let y1 = W - ks[i];
        let x2 = sum;
        let y2 = W - ks[i] + b[i] * itemsw[z];

        this.locations.push([{x1, y1, x2, y2}]);

        this.constituentsx.push(A);
        this.constituentsy.push(B);

        for (let i = 0; i < this.pattern.length; i++) {
            this.pattern[i] += A[i] * B[i];
        }

        this.patternIsRotated.push(true);
    }

    cuttingLocation (a, b, itemsw, itemsh) {
        return a.map((el, idx) => {
            var x1, y1, x2, y2;

            if (el > 0) {
                let sum = 0;
                for (let i = 0; i <= idx; i++) {
                    sum += a[i] * itemsh[i];
                }

                x1 = sum - el * itemsh[idx];
                x2 = sum;
                y1 = 0;
                y2 = b[idx] * itemsw[idx];

                return {x1, y1, x2, y2};
            }

            return null;
        });
    }

    remap (map) {
        var reverseMap = createReverseMap(map);

        return {
            pattern: remap(this.pattern, reverseMap),
            constituentsx: this.constituentsx.map(cx => remap(cx, reverseMap)),
            constituentsy: this.constituentsy.map(cy => remap(cy, reverseMap)),
            locations: this.locations.map(location => remap(location, reverseMap)),
            patternIsRotated: this.patternIsRotated
        };

        function remap (arr, map) {
            return arr && arr.map((_, idx) => {
                return arr[map[idx]];
            });
        }
    }
}
