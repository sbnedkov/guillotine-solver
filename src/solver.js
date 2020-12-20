import BnB from './solvers/solver-bnb';
import treesearch from './tree-searcher';
import {flatten} from './utils';

export default function solve (stocksw, stocksh, itemsw, itemsh, demands) {
    var solver = new BnB(stocksw, stocksh, itemsw, itemsh, demands);

    var res = solver.solve();
    var activities = res.patterns.map(patt => patt.remap(res.map));

    // XXX: review not mapping res.losses
    var solution = treesearch(activities.map(a => a.pattern), demands, res.losses);
    
    if (!solution) {
        return {activities: []};
    } 

    activities = activities.filter((_, idx) => solution[idx]);

    return {
        activities: activities.map((activity, idx) => offset(activity, idx, activities))
    };
}

export function offset (activity, idx, activities) {
    if (!idx) {
        return activity;
    }

    // TODO: start from 0 on new sheet
    var startY = Math.max.apply(null, flatten(activities[idx - 1].locations.map(loc => loc.map(l => l ? l.y2 : 0))));

    activity.locations.forEach(loc => {
        if (loc && loc.length) {
            loc.forEach(l => {
                if (l) {
                    l.y1 += startY;
                    l.y2 += startY;
                }
            });
        }
    });

    return activity;
}
