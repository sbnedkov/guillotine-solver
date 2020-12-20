import CuttingPattern from '../cutting-pattern';

export default class SolverBnB {
    constructor (stocksw, stocksh, itemsw, itemsh, demands) {
        var itemdata = itemsw.map((el, idx) => {
            return {
                w: el,
                h: itemsh[idx],
                d: demands[idx],
                idx: idx
            };
        });
        this.sorted = itemdata.sort((a1, a2) => {
            return a2.h - a1.h;
        });

        this.itemsw = this.sorted.map(el => el.w);
        this.itemsh = this.sorted.map(el => el.h);
        this.demands = this.sorted.map(el => el.d);
        this.map = this.sorted.map(el => el.idx);

        // TODO: multiple stock sizes
        this.W = stocksw[0];
        this.L = stocksh[0];
    }

    solve () {
        var m = this.itemsw.length;
        var as = [];
        var bs = [];
        var patterns = [];
        var losses = [];

        var j = 0;
        var r = 0;

        var a = this.itemsw.map(() => 0);
        var b = this.itemsw.map(() => 0);
        as.push(a);
        bs.push(b);

        var As = [];
        var Bs = [];

        this.sorted.forEach((_, idx) => {
            var sum = 0;
            for (let i = 0; i < idx; i++) {
                sum += a[i] * this.itemsh[i];
            }
            var quotient = (this.L - sum) / this.itemsh[idx];

            a[idx] = Math.min(Math.floor(quotient), this.demands[idx]); // (1)
            b[idx] = Math.min(a[idx] > 0 ? Math.floor(this.W / this.itemsw[idx]) : 0, Math.floor(this.demands[idx] / a[idx])); // (2)
        });

        var pattern = new CuttingPattern(a, b, this.itemsw, this.itemsh);
        patterns.push(pattern);

        var {Cu, Cv} = this.cuttingLoss(As, Bs, as, bs, pattern, j);
        losses.push(Cu + Cv);

        r = m - 1;

//        console.log(pattern);

        mainloop:
        while (r >= 0) {
            while (as[j][r] > 0) {
//                console.log('>>>>>>>>>>>>>...', r, as[j], bs[j]);
                let flag = as[j][r] >= bs[j][r];
                j = j + 1;

                let a = this.itemsw.map(() => 0);
                let b = this.itemsw.map(() => 0);

                as.push(a);
                bs.push(b);

                for (let z = 0; z < r; z++) {
                    a[z] = as[j - 1][z];
                    b[z] = bs[j - 1][z];
                }
//                console.log(a, b);

                let z = r;
                if (flag) {
                    a[z] = as[j - 1][z] - 1;
                    b[z] = a[z] > 0 ? Math.floor(this.W / this.itemsw[z]) : 0;
                } else {
                    a[z] = as[j - 1][z];
                    b[z] = bs[j - 1][z] - 1;
                }
//                console.log(a, b);

                for (let z = r + 1; z < m; z++) {
                    var sum = 0;
                    for (let i = 0; i < z + 1; i++) {
                        sum += a[i] * this.itemsh[i];
                    }
                    var quotient = (this.L - sum) / this.itemsh[z];

                    a[z] = Math.min(Math.floor(quotient), this.demands[z]); // (1)
                    b[z] = Math.min(a[z] > 0 ? Math.floor(this.W / this.itemsw[z]) : 0, Math.floor(this.demands[z] / a[z])); // (2)
//                    console.log('???', z, sum, quotient, a[z], b[z]);
                }

                let pattern = new CuttingPattern(a, b, this.itemsw, this.itemsh);
                patterns.push(pattern);

                let {Cu, Cv} = this.cuttingLoss(As, Bs, as, bs, pattern, j);
                losses.push(Cu + Cv);
//                console.log(a, b);


//                console.log(pattern);

                r = m - 1;
                continue mainloop;
            }
            r = r - 1;
        }

        return {patterns, losses, map: this.map};
    }

    cuttingLoss (As, Bs, as, bs, pattern, j) {
        var m = this.itemsw.length;

        var A = this.itemsw.map(() => 0);
        var B = this.itemsw.map(() => 0);
        As.push(A);
        Bs.push(B);

//        console.log(pattern);

        // Cut loss along side length

        var remh = this.L - as[j].reduce((acc, curr, idx) => acc + curr * this.itemsh[idx], 0);

        var Cu = remh * this.W, Cv = 0;
        for (let i = 0; i < m; i++) {
            if (remh >= this.itemsw[i] && this.W >= this.itemsh[i]) { // If rotated fits
                A[i] = Math.min(Math.floor(remh / this.itemsw[i]), this.demands[i]);

                if (A[i] > 0) {
                    B[i] = Math.min(Math.floor(this.W / this.itemsh[i]), Math.floor(this.demands[i] / A[i]));

                    Cu = (remh - A[i] * this.itemsw[i]) * B[i] * this.itemsh[i];
                    Cv = remh * (this.W - B[i] * this.itemsh[i]);

                    pattern.add(A, B, i, as[j], this.itemsw, this.itemsh);

                    break;
                }
            }
        }
//        console.log(Cu, Cv);

        A = this.itemsw.map(() => 0);
        B = this.itemsw.map(() => 0);

        // Cut loss along side width

        var ks = bs[j].map((b, idx) => b > 0 ? this.W - b * this.itemsw[idx] : 0);

        var cv = as[j].reduce((acc, curr, idx) => {
            return acc + curr * this.itemsh[idx] * ks[idx];
        }, 0);
        var i = as[j].findIndex(a => a);
        if (~i) {
            var lz = as[j][i] * this.itemsh[i];
            for (let z = 0; z < m; z++) {
                if (z === i) {
                    continue;
                }

                if (lz >= this.itemsh[z] && ks[i] >= this.itemsw[z]) {
                    A[z] = Math.min(Math.floor(lz / this.itemsh[z]), this.demands[z]);
                    if (A[z] > 0) {
                        B[z] = Math.min(Math.floor(ks[i] / this.itemsw[z]), Math.floor(this.demands[z] / A[z]));

                        Cu += (lz - A[z] * this.itemsh[z]) * B[z] * this.itemsw[z];
                        Cv = lz * (ks[i] - B[z] * this.itemsh[z]);
        //                console.log(lz, ks[z], B[z], this.itemsh[z], Cv);
                        if (Cv < 0) {
                            cv = 0;
                            Cv = 0;
                        }

                        pattern.addv(A, B, z, i, bs[j], ks, this.itemsw, this.itemsh, this.W);

                        break;
                    }
                }
            }
        }
        if (!Cv) {
            Cv = cv;
        }

//        console.log(as[j], bs[j], pattern);
//        console.log(Cu, Cv);
        return {Cu, Cv};
    }
}
