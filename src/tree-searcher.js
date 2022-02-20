import async from 'async';

import cuttingUtilsService from './cutting-utils';
import {flatten} from './utils';
import SolverStrips from './solvers/solver-strips';
import StockPattern from './stock-pattern';

const BAD_STOCK_TRESHOLD = 0.6;
//const BAD_STOCK_TRESHOLD = 0.0; // Turn this off

export default function search (stocks, activitiesArr, itemsw, itemsh, demands, cutType, callback) {
    console.error('In tree searcher - got the following stocks:\n', stocks);
    var initialDemands = demands.slice(0);
    var cuttingUtils = cuttingUtilsService(cutType);

    var patterns = flatten(flatten(activitiesArr));

    var patternsAndCosts = patterns.map(pattern => {
        return {
            value: -cuttingUtils.lossPercent(pattern, pattern.W, pattern.L),
            pattern: pattern
        };
    });

    var sortedPatternsAndCosts = patternsAndCosts.sort((a1, a2) => a2.value - a1.value);
    var filteredPatternsAndCosts = sortedPatternsAndCosts;

    console.error('In tree searcher - got the following patterns (sorted):\n', filteredPatternsAndCosts.map(p => `${p.pattern.pattern}: ${p.value} for ${p.pattern.W}x${p.pattern.L}`));

    var byStock = filteredPatternsAndCosts.reduce((acc, pattern) => {
        var key = patternStockKey(pattern.pattern);
        acc[key] = acc[key] ? acc[key].concat(pattern) : [pattern];
        return acc;
    }, {});

    var stocksMap = stocks.reduce((acc, stock) => {
        if (stock.number) {
            acc[patternStockKey({W: stock.width, L: stock.height})] = stock;
        }
        return acc;
    }, {});

    async.waterfall([
        (cb) => setImmediate(() => {
            var results = {};
            Object.keys(byStock).forEach(key => {
                results[key] = {};
                var stockPatterns = byStock[key];

                // TODO:
                var allowRotation = false;

                var W = stockPatterns[0].pattern.W;
                var L = stockPatterns[0].pattern.L;
                var stockKey = patternStockKey(stockPatterns[0].pattern);

                if (stocksMap[stockKey] && stocksMap[stockKey].number) {
                    var stripsSolver = new SolverStrips(
                        W,
                        L,
                        stockPatterns.map(patt => cuttingUtils.widthSide(patt.pattern.getMaxX(), patt.pattern.getMaxY(), allowRotation, W, L)),
                        stockPatterns.map(patt => cuttingUtils.heightSide(patt.pattern.getMaxX(), patt.pattern.getMaxY(), allowRotation, W, L)),
                        stockPatterns.map(patt => patt.value),
                        stockPatterns.map(patt => patt.pattern.pattern),
                        allowRotation,
                        cutType
                    );

                    var solution = stripsSolver.indicesToPatterns(stripsSolver.solve(demands), stockPatterns);
                    console.log('Strips solver returned:', solution.map(stock => {
                        return `${stock.map(strip => strip.map(pattern => pattern.pattern.pattern.join('-')).join(',')).join(' ')} ${stock[0][0].pattern.W}x${stock[0][0].pattern.L}`;
                    }));

                    solution.forEach(stock => {
                        var stockPattern = new StockPattern(stock, W, L, demands);
                        var fingerprint = stockPattern.fingerprint();
                        results[key][fingerprint] = stockPattern;
                    });
                }
            });

            if (!Object.keys(results).length) {
                return cb(new Error('No solution #2'));
            }

            cb(null, results);
        }),
        (results, cb) => setImmediate(() => {
            // Group all stocks
            var allStocks = [];
            Object.values(results).forEach(value => {

                var stocksForStockSize = Object.values(value);

                stocksForStockSize.forEach(stock => {
                    var weight = calculateStockParameters(stock.strips, cuttingUtils);
//                    if (meets(demands, stock)) {
//                        weight.multiplier = 100; // XXX: revisit
//                    } else {
                        weight.multiplier = 1;
//                    }

                    allStocks.push({
                        stock,
                        weight
                    });
                });
            });

            // Sort stocks by weight
            allStocks.sort((s1, s2) => {
                // Descending order - big weight equals good stock
                return s2.weight.area * s2.weight.usage * s2.weight.multiplier - s1.weight.area * s1.weight.usage * s1.weight.multiplier;
            });

            // Preserve this dump
            console.log('All available stocks:', allStocks.map(stock => {
                return {
                    weight: stock.weight.area * stock.weight.usage * stock.weight.multiplier,
                    patterns: stock.stock.strips.map(strip => strip.map(pattern => pattern.pattern.pattern.join(',')).join(' '))
                };
            }));

            // Choose best stocks and update demand as we go
            var solution = [];
            var weights = [];
            while (!isNull(demands)) {
                var found = false;
                var weight;
                var i;
                for (i = 0; i < allStocks.length; i++) {
                    if (fits(demands, allStocks[i].stock)) {
                        found = allStocks[i].stock;
                        break;
                    }
                }

                if (!found) { // We bail out, return partial result and leave caller to decide what to do
                    break;
                } else {
                    weight = allStocks[i].weight;
                    if (solution.length && weight.usage * weight.area < BAD_STOCK_TRESHOLD) { // Don't use bad stocks if we already have picked some
                        break;
                    }

                    solution.push(found);
                    weights.push(weight);
                    subtractRemaining(demands, found.value());
                }
            }

            var allActivities = [];
            var allLosses = [];
            solution.forEach((activity, idx) => {
                var stockKey = patternStockKey(activity);
                if (stocksMap[stockKey].number) {

                    stocksMap[stockKey].number -= 1;

                    var stockActivities = [];
                    var maxOffset = 0;
                    activity.strips.forEach(strip => {
                        strip.forEach(pattern => {
                            stockActivities.push(offset(pattern.pattern, maxOffset, cuttingUtils));
                            maxOffset += cuttingUtils.stripShortSide(pattern.pattern);
                        });
                    });
                    allActivities.push(stockActivities);
                    allLosses.push(weights[idx]);
                }
            });

            cb(null, {
                groups: allActivities,
                losses: allLosses,
                remaining: allActivities.reduce((acc, patterns) => {
                    return patterns.reduce((innerAcc, pattern) => {
                        return innerAcc.map((v, i) => v - pattern.pattern[i]);
                    }, acc);
                }, initialDemands)
            });
        })
    ], (err, result) => {
        callback(err, result);
    });
}

function calculateStripParameters (patterns, cuttingUtils) {
    return patterns.reduce((acc, pattern) => {
        pattern = pattern.pattern;
        var area = cuttingUtils.patternArea(pattern);
        var stripArea = cuttingUtils.stripInStockArea(pattern, pattern.W, pattern.L);

        acc.area += area;
        acc.stripArea += stripArea;
        return acc;
    }, {
        area: 0,
        stripArea: 0
    });
}

function calculateStockParameters (strips, cuttingUtils) {
    var {area, stripArea} = strips.reduce((innerAcc, strip) => {
        var {area, stripArea} = calculateStripParameters(strip, cuttingUtils);

        innerAcc.area += area;
        innerAcc.stripArea += stripArea;

        return innerAcc;
    }, {
        area: 0,
        stripArea: 0
    });

    var W = strips[0][0].pattern.W;
    var L = strips[0][0].pattern.L;

    return {
        area: area / (W * L),
        usage: 1 - (stripArea - area) / (stripArea)
    };
}

function offset (activity, start, cuttingUtils) {
    var maxY = activity.getMaxY(), maxX = activity.getMaxX();
    var locations = activity.locations.map(loc => {
        return loc.map(l => {
            return l && {
                x1: l.x1 + cuttingUtils.stripHorizontalOffsetOrZero(start),
                x2: l.x2 + cuttingUtils.stripHorizontalOffsetOrZero(start),
                y1: l.y1 + cuttingUtils.stripVerticalOffsetOrZero(start),
                y2: l.y2 + cuttingUtils.stripVerticalOffsetOrZero(start)
            };
        });
    });

    return Object.assign({}, activity, {locations, maxY, maxX});
}

function patternStockKey (pattern) {
    return [pattern.W, pattern.L].join(':');
}

function isNull (arr) {
    return arr.every(el => el === 0);
}

function fits (demands, stock) {
    return demands.every((el, i) => el >= stock.value()[i]);
}

function meets (demands, stock) {
    return demands.every((el, i) => el === stock.value()[i]);
}

function subtractRemaining (remaining, weight) {
    for (var i = 0; i < remaining.length; i++) {
        remaining[i] -= weight[i];
    }
}
