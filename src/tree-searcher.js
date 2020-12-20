import treegen from './tree-generator';

export default function search (activities, demands, costs) {
    var combinations = treegen(activities, demands);

    var min = 1e20, minCombination;

    combinations.forEach(c => {
        if (meetsDemand(c, activities, demands)) {
            var cost = c.reduce((acc, count, activityIdx) => {
                return acc + costs[activityIdx] * count;
            }, 0);

//            console.log(cost, min, activities.map((a, idx) => c[idx] ? a.map(el => c[idx] * el) : null).filter(el => el));
            if (cost < min) {
                min = cost;
                minCombination = c;
            }
        }
    });

//    console.log(activities, costs);
    return minCombination;
}

function meetsDemand (combination, activities, demands) {
    var summed = combination.reduce((acc, count, activityIdx) => {
        return acc.map((el, idx) => {
            return el + count * activities[activityIdx][idx];
        });
    }, activities[0].map(() => 0));

    return summed.every((el, idx) => {
        // TODO: trim if exceeds
        return el >= demands[idx];
    });
}
