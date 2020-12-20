export default function generate (activities, demands) {
    var result = activities.map(() => 0);
    var results = [];

    dfs(activities, demands, result, results);

    return results;
}

function dfs (activities, demands, result, results) {
    activities.map(() => null).forEach((_, idx) => {
        result[idx]++;

        if (!marked(result, results)) {
//            console.log(result);
            results.push(result.slice(0));
            if (canAccomodateMore(result, activities, demands, idx)) {
                dfs(activities, demands, result, results);
            }
        }

        result[idx]--;
    });
}

export function satisfies (result, activities, demands, idx) {
//   var activitiesFit = activities.every((activity, i) => {
//       return activity.every((el, idx) => {
//           return el * result[i] <= demands[idx];
//       });
//   });
//
//   var summed = activities.reduce((acc, curr, i) => {
//       return acc.map((el, idx) => {
//           return el + curr[idx] * result[i];
//       });
//   }, activities[0].map(() => 0));
//
//   var fitsCount = summed.reduce((acc, el, idx) => {
//       return acc + Number(el <= demands[idx]);
//   }, 0);

//   return activitiesFit && fitsCount >= summed.length - 1;
    var activity = activities[idx];

    return activity.every((el, i) => el * result[idx] !== 0 && demands[i] > 0 || el * result[idx] === 0);
}

export function activityAloneWontExceed (result, activities, demands, idx) {
    var activity = activities[idx];
    return activity.every((el, i) => el * result[idx] <= demands[i]);
}

export function activityInCombinationWontExceed (result, activities, demands/*, idx*/) {
    var summed = activities.reduce((acc, curr, i) => {
        return acc.map((el, idx) => {
            return el + curr[idx] * result[i];
        });
    }, activities[0].map(() => 0));

   var fitsCount = summed.reduce((acc, el, i) => {
       return acc + Number(el <= demands[i]);
   }, 0);

   return fitsCount >= demands.length;
//    return summed.some((el, i) => el + activity[i] <= demands[i]);
}

export function canAccomodateMore (...args) {
    return activityAloneWontExceed(...args) && activityInCombinationWontExceed(...args);
}

function marked (result, results) {
    return !!results.find(r => {
        return r.every((el, idx) => {
            return el === result[idx];
        });
    });
}
