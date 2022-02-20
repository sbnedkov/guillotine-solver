import async from 'async';

import StockCutter from './stock-cutter';
import SolutionTree from './solution-tree';
import treesearch from './tree-searcher';
import cuttingUtilsService from './cutting-utils';

export default function solve (stocks, ws, hs, allowRotation, demands, cutType, callback) {
    const MAX_GENERATED_BRANCHES = 500;

    var cuttingUtils = cuttingUtilsService(cutType);

    var solvers = stocks.map(stock => {
        let W = stock.width;
        let L = stock.height;
        var itemsw = [], itemsh = [];
        ws.forEach((w, idx) => {
            itemsw[idx] = cuttingUtils.widthSide(w, hs[idx], allowRotation[idx], W, L);
            itemsh[idx] = cuttingUtils.heightSide(w, hs[idx], allowRotation[idx], W, L);
        });

        return new StockCutter(W, L, itemsw, itemsh, allowRotation, cutType, MAX_GENERATED_BRANCHES);
    });

    var allActivities = [];
    var allLosses = [];
    var hashMap = {};

    var stocksMap = stocks.reduce((acc, stock) => {
        if (stock.number) {
            acc[patternStockKey({W: stock.width, L: stock.height})] = stock;
        }
        return acc;
    }, {});

    solveAndYield(demands);

    function solveAndYield (demands) {
        var solutionTree = new SolutionTree(demands);

        async.forEach(filterSolvers(solvers), (solver, cb) => {
            var subTree = solutionTree.add(demands);
            drainDemands(subTree, solver, cb);
        }, (err) => {
            if (err) {
                return callback(err);
            }

            var availablePatterns = solutionTree.allBranches();

            treesearch(stocks.filter(stock => stock.number), availablePatterns, ws, hs, demands, cutType, (err, res) => {
                if (err) {
                    return callback(err);
                }

                var {groups, losses, remaining} = res;

//                groups.forEach(stocks => {
//                    var key = patternStockKey(stocks[0]);
//                    stocksMap[key].number--;
//                });

                allActivities = allActivities.concat(groups);
                allLosses = allLosses.concat(losses);
                demands = remaining;
                console.log('REMAINING:', demands);

                if (!isNull(demands)) {
                    return setImmediate(solveAndYield.bind(null, demands));
                }

                console.error('Best combination of patterns: ', allActivities.map(stocks => stocks.map(p => p.pattern)));

                callback(null, {
                    activities: allActivities,
                    losses: allLosses
                });
            });
        });
    }

    function isNull (arr) {
        return arr.every(el => el === 0);
    }

    function solutionForDemands (d, solver) {
        var hashStr = hash(d.concat([solver.W, solver.L]));
        var res = hashMap[hashStr];
        if (res) {
            return res;
        }

//        var tree = solver.solve(d);
        var patterns = solver.solve(d);
//        var patterns = tree.allBranches();

        res = {
            patterns,
            remaining: remaining(patterns)
        };

        hashMap[hashStr] = res;

        return res;

        function remaining (/*patterns*/ps) {
//            return patterns.map(ps => {
                var used = ps.reduce((acc, p) => p.pattern.map((el, idx) => acc[idx] + el), d.map(() => 0));
                return used.map((el, idx) => {
                    if (d[idx] < el) {
                        // XXX: Workaround for negative demands
                        return 0;
                    }
                    return d[idx] - el;
                });
//            });
        }
    }

    function drainDemands (solutionTree, solver, cb) {
        var {patterns, remaining} = solutionForDemands(solutionTree.demands, solver);

        async.forEachOf(patterns, (p, idx, callback) => {
            solutionTree.add(remaining[idx], p);
            callback();
        }, () => {
            cb();
        });
    }

    function filterSolvers (solvers) {
        var stocksMap = stocks.reduce((acc, stock) => {
            acc[patternStockKey({W: stock.width, L: stock.height})] = stock.number;
            return acc;
        }, {});
        return solvers.filter(solver => stocksMap[patternStockKey(solver)]);
    }

    function patternStockKey (pattern) {
        return [pattern.W, pattern.L].join(':');
    }
}

function hash (variation) {
    return variation.join(':');
}
