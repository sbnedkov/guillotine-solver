import Matrix from './matrix';
import {range, multiplyVectors} from './utils';

export function adhoc (L, l, constraints) {
//    console.log('Calling adhoc method with stock length, item lengths and constraints:', L, l, constraints);
    var quots = l.map((item, idx) => {
        return {
            value: constraints[idx] / item,
            idx: idx
        };
    });

    quots.sort((v1, v2) => v2.value - v1.value);

    var activities = [];
    quots.forEach((el, idx) => {
        var previousTerms = range(0, idx).map(i => l[quots[i].idx] * activities[i].activity);
        var terms = previousTerms.reduce((acc, el) => acc + el, 0);
        var activity = Math.floor((L - terms) / l[el.idx]);

        activities.push({activity, idx: el.idx});
    });

    return activities.sort((a1, a2) => a1.idx - a2.idx).map(a => a.activity);
}

export function knapsack (Ls, l, demands, constraints, costs) {
//    console.log('Running knapsack with stock lengths and item lengths:', Ls, l);
//    console.log('Running knapsack with demands:', demands);
//    console.log('Running knapsack with constraints and costs:', constraints, costs);
    var L = Ls[0]; // Take for granted that Ls are sorted in descending order
    var cost = costs[0];
    var n = l.length;
    var m = new Matrix(n + 1, L + 1);
    m.setAll([]);

    for (let w = 1; w <= L; w++) {
        for (let i = 1; i <= n; i++) {
            let wi = l[i - 1];
            let value = constraints[i - 1];
            let pi = demands[i - 1];
            let bi = Math.min(Math.floor(w / wi), pi);

            let vals = range(0, bi + 1).map(count => {
                return m.get(i - 1, w - wi * count).concat({
                    count: count,
                    value: value * count,
                    idx: i - 1
                });
            });

            let max = m.get(i - 1, w), maxValue = 0;
            vals.forEach(items => {
                var val = items.reduce((acc, item) => {
                    return acc + item.value;
                }, 0);

                if (val > maxValue) {
                    max = items;
                    maxValue = val;
                }
            });
            m.set(i, w, max);
        }
    }

    var P = complementVector(m.get(n, L), l.length);

//    console.log('Going to try solution from knapsack against cost and constraints:', P);
    if (multiplyVectors(P, constraints) <= cost) {
        P = l.map(() => 0);
    }
//    m.print();

    var result = [P];
    for (let i = 1; i < Ls.length; i++) {
        let Pi = complementVector(m.get(n, Ls[i]), l.length);
        let costi = costs[i];
        if (multiplyVectors(P, constraints) <= costi) {
            result.push(l.map(() => 0));
        } else {
            result.push(Pi);
        }
    }

    return result;
}

function complementVector (items, len) {
    var res = range(0, len).map(() => 0);
    items.forEach(item => {
        res[item.idx] = item.count;
    });
    return res;
}
