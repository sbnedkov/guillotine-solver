import {createReverseMap} from './utils';

export default class CuttingPattern {
    constructor (a, b, itemsw, itemsh, cuttingUtils, W, L) {
        this.nonNull = false;
        this.pattern = a.map((_, idx) => {
            if (b[idx] === 0 || a[idx] === 0) {
                a[idx] = 0;
                b[idx] = 0;
            }

            var res = a[idx] * b[idx];
            if (res !== 0) {
                this.nonNull = true;
            }
            return res;
        });

        this.constituentsx = [a.slice(0)];
        this.constituentsy = [b.slice(0)];
        this.patternIsRotated = [false];

        var loc = cuttingUtils.cuttingLocation(a, b, itemsw, itemsh);
        this.locations = [loc];

        this.W = W;
        this.L = L;
    }

    addn (A, B, i, x, y, w, h, rotated) { // Here A and B could be swapped
        let x1 = x;
        let x2 = x1 + A * (rotated ? h : w);
        let y1 = y;
        let y2 = y1 + B * (rotated ? w : h);

        this.locations.push(this.pattern.map((_, idx) => idx === i ? {x1, y1, x2, y2} : null));

        this.constituentsx.push(this.pattern.map((_, idx) => idx === i ? A : 0));
        this.constituentsy.push(this.pattern.map((_, idx) => idx === i ? B : 0));

        this.pattern[i] += A * B;

        this.patternIsRotated.push(!!rotated);

        this.nonNull = true;
    }

    // For instance:
    // map: [4, 5, 3, 0, 1, 2], reverseMap: [3, 4, 5, 2, 0, 1]
    // original pattern: [0, 1, 2, 3, 4, 5], sorted pattern: [4, 5, 3, 0, 1, 2]
    // expected remapped: [0, 1, 2, 3, 4 , 5]
    remap (map) {
        var reverseMap = createReverseMap(map);

        this.pattern = remap(this.pattern, reverseMap);
        this.constituentsx = this.constituentsx.map(cx => remap(cx, reverseMap));
        this.constituentsy = this.constituentsy.map(cy => remap(cy, reverseMap));
        this.locations = this.locations.map(location => remap(location, reverseMap));
        this.patternIsRotated = remap(this.patternIsRotated, reverseMap);

        return this;

        function remap (arr, rmap) {
            return arr && arr.map((_, idx) => {
                return arr[rmap[idx]];
            });
        }
    }

    getMaxY () {
        var max = Math.max(...this.locations.map(arr => Math.max(...arr.map(loc => loc ? loc.y2 : 0))));
        return max < -1e15 ? 0 : max;
    }

    getMinY () {
        var min = Math.min(...this.locations.map(arr => Math.min(...arr.map(loc => loc ? loc.y1 : 1e20))));
        return min > 1e15 ? 0 : min;
    }

    getMaxX () {
        var max = Math.max(...this.locations.map(arr => Math.max(...arr.map(loc => loc ? loc.x2 : 0))));
        return max < -1e15 ? 0 : max;
    }

    getMinX () {
        var min = Math.min(...this.locations.map(arr => Math.min(...arr.map(loc => loc ? loc.x1 : 1e20))));
        return min > 1e15 ? 0 : min;
    }

    fits () {
        return this.getMaxX() <= this.W && this.getMaxY() <= this.L;
    }

    area () {
        return this.locations.reduce((acc, loc) => {
            return acc + loc.reduce((acc, l) => {
                return acc + (l ? (l.x2 - l.x1) * (l.y2 - l.y1) : 0);
            }, 0);
        }, 0);
    }
}
