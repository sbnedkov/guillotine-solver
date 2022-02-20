import CuttingPattern from './cutting-pattern';

export default function (cutType) {
    return {
        patternArea,
        stripArea,
        stripInStockArea,
        activityLossPercent,
        lossPercent,
        getBranchFlag,
        sortPredicate,
        minHeight,
        minWidth,
        primarySide,
        secondarySide,
        widthSide,
        heightSide,
        mainSideMultiplied,
        secondarySideMultiplied,
        phase1,
        phase1InitialMax,
        phase1Fits,
        stripFits,
        phase2,
        phase2X,
        phase2Y,
        phase3,
        phase3X,
        phase3Y,
        stripShortSide,
        stripHorizontalOffsetOrZero,
        stripVerticalOffsetOrZero,
//        wStripDimensions,
//        hStripDimensions,
        cuttingLocation,
        residualWaste,
        fitConstituents,
        shortSideLength,
//        subtractFrom,
        mainConstituent,
//        mainConstinuentMinusOne,
        secondaryConstituent,
        newFromConstituents,
        split
    };

    function patternArea (pattern) {
        return pattern.locations.reduce((acc, loc) => {
            return acc + loc.reduce((acc, l) => {
                return acc + (l ? (l.x2 - l.x1) * (l.y2 - l.y1) : 0);
            }, 0);
        }, 0);
    }

    function stripArea (activity, W, L) {
        switch (cutType) {
            case 'h':
                return (W * (activity.maxY || activity.getMaxY()));
            case 'v':
                return (L * (activity.maxX || activity.getMaxX()));
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function stripInStockArea (activity, W, L) {
        switch (cutType) {
            case 'h':
                return (W * (activity.maxY || activity.getMaxY()));
            case 'v':
                return (L * (activity.maxX || activity.getMaxX()));
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function activityLossPercent (activity, W, L) {
        var totalArea = stripArea(activity, W, L);
        return (totalArea - patternArea(activity)) / totalArea;
    }

    function lossPercent (activity, W, L) {
        var totalArea = stripArea(activity, W, L);
        return (totalArea - activity.area()) / totalArea;
    }

    function getBranchFlag (A, B) {
        switch (cutType) {
            case 'h':
                return A >= B;
            case 'v':
                return B <= A;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function sortPredicate (a1, a2/*, W, L*/) {
        switch (cutType) {
            case 'h':
//                if (a1.w > W && a2.w > W) {
//                    return a2.h - a1.h;
//                }
//                if (a1.w > W) {
//                    return a2.w - a1.h;
//                }
//                if (a2.w > W) {
//                    return a2.h - a1.w;
//                }
                return a2.w - a1.w;
            case 'v':
//                if (a1.h > L && a2.h > L) {
//                    return a2.w - a1.w;
//                }
//                if (a1.h > L) {
//                    return a2.h - a1.w;
//                }
//                if (a2.h > L) {
//                    return a2.w - a1.h;
//                }
                return a2.h - a1.h;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function minHeight (itemsh) {
        switch (cutType) {
            case 'h':
                return Math.min(...itemsh);
            case 'v':
                return 0;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function minWidth (itemsw) {
        switch (cutType) {
            case 'h':
                return 0;
            case 'v':
                return Math.min(...itemsw);
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function primarySide (w, h) {
        switch (cutType) {
            case 'h':
                return w;
            case 'v':
                return h;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function secondarySide (w, h) {
        switch (cutType) {
            case 'h':
                return h;
            case 'v':
                return w;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function widthSide (w, h, allowRotation, W, L) {
        var widthSide;
        switch (cutType) {
            case 'h':
                return !allowRotation ? w : Math.max(w, h);
            case 'v':
                widthSide = !allowRotation ? w : Math.min(w, h);
                if (Math.max(w, h) > L) {
                    return Math.max(w, h);
                }
                return widthSide;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function heightSide (w, h, allowRotation, W, L) {
        var heightSide;
        switch (cutType) {
            case 'h':
                return !allowRotation ? h : Math.min(w, h);
            case 'v':
                heightSide = !allowRotation ? h : Math.max(w, h);
                if (Math.max(w, h) > L) {
                    return Math.min(w, h);
                }
                return heightSide;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function mainSideMultiplied (A, B, w, h) {
        switch (cutType) {
            case 'h':
                return A * w;
            case 'v':
                return B * h;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function secondarySideMultiplied (A, B, w, h) {
        switch (cutType) {
            case 'h':
                return A * h;
            case 'v':
                return B * w;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function phase1 (quotient, remainingi) {
        var An = 0, Bn = 0;
        switch (cutType) {
            case 'h':
                An = Math.min(Math.floor(quotient), remainingi);
                Bn = An && 1;
                break;
            case 'v':
                Bn = Math.min(Math.floor(quotient), remainingi);
                An = Bn && 1;
                break;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }

        return {An, Bn};
    }

    function phase1InitialMax (a, b, itemsw, itemsh, W, L) {
        switch (cutType) {
            case 'h':
                return a.reduce((acc, _, idx) => Math.max(acc, b[idx] * itemsh[idx]), 0) || L;
            case 'v':
                return b.reduce((acc, _, idx) => Math.max(acc, a[idx] * itemsw[idx]), 0) || W;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function phase1Fits (w, h, max, W, L) {
        switch (cutType) {
            case 'h':
                return w <= W && h <= max;
            case 'v':
                return h <= L && w <= max;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function stripFits (w, h, max) {
        switch (cutType) {
            case 'h':
                return h <= max;
            case 'v':
                return w <= max;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function phase2 (w, h, pattw, patth, pattern, remainingi, W, L) {
        switch (cutType) {
            case 'h':
                if (pattern.getMaxY() === 0 && h <= W) { // We have unrestricted second phashe
                    let An = Math.min(Math.floor(W / h), remainingi);
                    let Bn = An && 1;

                    return {An, Bn};
                } else if ((h <= W - pattw) && (w <= patth)) {
                    let An = Math.min(Math.floor((W - pattw) / h), remainingi);
                    let Bn = An && 1;

                    return {An, Bn};
                }
                return {An: 0, Bn: 0};
            case 'v':
                if (pattern.getMaxX() === 0 && w <= L) { // We have unrestricted second phashe
                    let Bn = Math.min(Math.floor(L / w), remainingi);
                    let An = Bn && 1;

                    return {An, Bn};
                } else if ((w <= L - patth) && (h <= pattw)) {
                    let Bn = Math.min(Math.floor((L - patth) / w), remainingi);
                    let An = Bn && 1;

                    return {An, Bn};
                }
                return {An: 0, Bn: 0};
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function phase2X (pattw, pattern) {
        switch (cutType) {
            case 'h':
                return pattern.getMaxX();
            case 'v':
                return 0;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function phase2Y (patth, pattern) {
        switch (cutType) {
            case 'h':
                return 0;
            case 'v':
                return pattern.getMaxY();
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function phase3 (w, h, pattw, patth, pattern, remainingi) {
        switch (cutType) {
            case 'h':
                if (pattw >= w && pattern.getMaxY() >= patth + h) {
                    let An = Math.min(Math.floor(pattw / w), remainingi);
                    let Bn = An && 1;
                    return {An, Bn};
                }
                return {An: 0, Bn: 0};
            case 'v':
                if (patth >= h && pattern.getMaxX() >= pattw + w) {
                    let Bn = Math.min(Math.floor(patth / h), remainingi);
                    let An = Bn && 1;
                    return {An, Bn};
                }
                return {An: 0, Bn: 0};
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function phase3X (loc) {
        switch (cutType) {
            case 'h':
                return loc.x1;
            case 'v':
                return loc.x2;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function phase3Y (loc) {
        switch (cutType) {
            case 'h':
                return loc.y2;
            case 'v':
                return loc.y1;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function stripShortSide (pattern) {
        switch (cutType) {
            case 'h':
                return pattern.getMaxY();
            case 'v':
                return pattern.getMaxX();
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function stripHorizontalOffsetOrZero (offset) {
        switch (cutType) {
            case 'h':
                return 0;
            case 'v':
                return offset;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function stripVerticalOffsetOrZero (offset) {
        switch (cutType) {
            case 'h':
                return offset;
            case 'v':
                return 0;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

//    function wStripDimensions (itemsw, itemsh, counts, W, L) {
//        switch (cutType) {
//            case 'h':
//                return counts.reduce((acc, c, i) => Math.max(c * (itemsw[i] > W ? itemsh[i] : itemsw[i]), acc), 0);
//            case 'v':
//                return counts.reduce((acc, c, i) => Math.max((c ? 1 : 0) * (itemsw[i] > L ? itemsh[i] : itemsw[i]), acc), 0);
//            default:
//                throw Error(`Unknown cut type: ${cutType}`);
//        }
//    }
//
//    function hStripDimensions (itemsw, itemsh, counts, W, L) {
//        switch (cutType) {
//            case 'h':
//                return counts.reduce((acc, c, i) => Math.max((c ? 1 : 0) * (itemsh[i] > W ? itemsw[i] : itemsh[i]), acc), 0);
//            case 'v':
//                return counts.reduce((acc, c, i) => Math.max(c * (itemsh[i] > W ? itemsw[i] : itemsh[i]), acc), 0);
//            default:
//                throw Error(`Unknown cut type: ${cutType}`);
//        }
//    }

    function cuttingLocation (a, b, itemsw, itemsh) {
        return (cutType === 'h' ? a : cutType === 'v' ? b : void 0).map((el, idx) => {
            var x1, y1, x2, y2;

            if (el > 0) {
                let sum = 0;
                for (let i = 0; i <= idx; i++) {
                    switch (cutType) {
                        case 'h':
                            sum += a[i] * itemsw[i];
                            break;
                        case 'v':
                            sum += b[i] * itemsh[i];
                            break;
                        default:
                            throw Error(`Unknown cut type: ${cutType}`);
                    }
                }

                switch (cutType) {
                    case 'h':
                        x1 = sum - el * itemsw[idx];
                        x2 = sum;
                        y1 = 0;
                        y2 = b[idx] * itemsh[idx];
                        break;
                    case 'v':
                        x1 = 0;
                        x2 = a[idx] * itemsw[idx];
                        y1 = sum - el * itemsh[idx];
                        y2 = sum;
                        break;
                    default:
                        throw Error(`Unknown cut type: ${cutType}`);
                }

                return {x1, y1, x2, y2};
            }

            return null;
        });
    }

    function residualWaste (activities, W, L) {
        switch (cutType) {
            case 'h':
                var maxY = activities.reduce((acc, activity) => acc + activity.getMaxY(), 0);
                return {residualWasteWidth: W, residualWasteHeight: L - maxY};
            case 'v':
                var maxX = activities.reduce((acc, activity) => acc + activity.getMaxX(), 0);
                return {residualWasteWidth: W - maxX, residualWasteHeight: L};
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function fitConstituents (a, b, d) {
        if (a * b === 0) {
            return {a: 0, b: 0};
        }

        switch (cutType) {
            case 'h':
                b = Math.min(b, Math.max(1, Math.floor(d / a)));
                a = b && Math.min(a, Math.floor(d / b));
                break;
            case 'v':
                a = Math.min(a, Math.max(1, Math.floor(d / b)));
                b = a && Math.min(b, Math.floor(d / a));
                break;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }

        return {a, b};
    }

    function shortSideLength (pattern) {
        switch (cutType) {
            case 'h':
                return pattern.getMaxY();
            case 'v':
                return pattern.getMaxX();
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

//    function subtractFrom (copyX, copyY, patternIdx, itemIdx, itemsw, itemsh, W, L) {
//        switch (cutType) {
//            case 'h':
//                if (copyX[itemIdx] === 0) {
//                    copyY[itemIdx]--; // Both are zeroed
//                }
//                break;
//            case 'v':
//                if (copyY[itemIdx] === 0) {
//                    copyX[itemIdx]--; // Both are zeroed
//                }
//                break;
//            default:
//                throw Error(`Unknown cut type: ${cutType}`);
//        }
//
//        return new CuttingPattern(copyX, copyY, itemsw, itemsh, this, W, L);
//    }

    function mainConstituent (copyX, copyY) {
        switch (cutType) {
            case 'h':
                return copyX;
            case 'v':
                return copyY;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

//    function mainConstinuentMinusOne (copyX, copyY, idx) {
//        switch (cutType) {
//            case 'h':
//                copyX[idx]--;
//                return copyX;
//            case 'v':
//                copyY[idx]--;
//                return copyY;
//            default:
//                throw Error(`Unknown cut type: ${cutType}`);
//        }
//    }

    function secondaryConstituent (copyX, copyY) {
        switch (cutType) {
            case 'h':
                return copyY;
            case 'v':
                return copyX;
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function newFromConstituents (mainConstituent, complement, itemsw, itemsh, W, L) {
        switch (cutType) {
            case 'h':
                return new CuttingPattern(mainConstituent, complement, itemsw, itemsh, this, W, L);
            case 'v':
                return new CuttingPattern(complement, mainConstituent, itemsw, itemsh, this, W, L);
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }

    function split (times) {
        switch (cutType) {
            case 'h':
                return {An: times, Bn: 1};
            case 'v':
                return {An: 1, Bn: times};
            default:
                throw Error(`Unknown cut type: ${cutType}`);
        }
    }
}
