import Array2D from './array2d';

export default function knapsack (D, d) {
    var c = new Array2D(d.length + 1, D + 1);

    for (let j = 0; j <= D; j++) {
        c.set(0, j, {
            idx: [],
            val: 0
        });
    }

    for (let i = 1; i <= d.length; i++) {
        for (let j = 0; j <= D; j++) {
            if (d[i - 1] <= j) {
                let notUse = c.get(i - 1, j).val;
                let use = c.get(i - 1, j - d[i - 1]).val + d[i - 1];

                if (use > notUse) {
                    c.set(i, j, {
                        idx: c.get(i - 1, j - d[i - 1]).idx.concat([i - 1]),
                        val: use
                    });
                } else {
                    c.set(i, j, {
                        idx: c.get(i - 1, j).idx,
                        val: notUse
                    });
                }
            } else {
                c.set(i, j, {
                    idx: c.get(i - 1, j).idx,
                    val: c.get(i - 1, j).val
                });
            }
        }
    }

//    console.log(c.get(d.length, D).idx, D, d);
    return c.get(d.length, D).idx;
}
