export function range (start, end) {
    return Array.apply(null, new Array(end - start)).map((ign, idx) => idx + start);
}

export function round (matrix) {
    return matrix.arr.map(arr => {
        return arr.map(el => Math.round(el * 1000) / 1000);
    });
}

export function isZero (x) {
    return !Math.floor(Math.abs(x * 1e6));
}

export function multiplyVectors (v1, v2) {
    return v1.reduce((acc, el, idx) => {
        return acc + el * v2[idx];
    }, 0);
}

export function swap (arr, i1, i2) {
    var tmp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = tmp;
}

export function zip (arr1, arr2) {
    return arr1.map((el, idx) => [el, arr2[idx]]);
}

export function roundCountsUp (counts) {
    return counts.map(c => Math.ceil(c));
}

export function reduceActivities (activities, counts) {
    var activitiesCount = activities.map((a, idx) => {
        return a.activities.map(a => a * counts[idx]);
    });

    return activitiesCount;
}

export function calculateCost (stocks, activities, counts) {
    return activities.reduce((acc, a, idx) => {
        return acc + counts[idx] * stocks[a.stockIdx];
    }, 0);
}

export function isZeroVector (arr) {
    return arr.reduce((acc, x) => {
        return acc && isZero(x);
    }, true);
}

export function roundValue (val) {
    return Math.round(val * 1000) / 1000;
}

export function zeroVector (m) {
    return Array.apply(null, new Array(m)).map(() => 0);
}

export function createReverseMap (map) {
    var reverseMap = [];
    map.forEach((mappedIdx, idx) => {
        reverseMap[mappedIdx] = idx;
    });

    return reverseMap;
}

export function flatten (arrOfArr) {
    return arrOfArr.reduce((acc, arr) => {
        return acc.concat(arr);
    }, []);
}
