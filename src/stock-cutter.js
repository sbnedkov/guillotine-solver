import cuttingUtilsService from './cutting-utils';
import SolutionTree from './solution-tree';
import SolverCombined from './solvers/solver-combined';

export default class StockCutter {
    constructor (W, L, itemsw, itemsh, allowRotation, cutType, maxBranches) {
        this.W = W;
        this.L = L;
        this.cuttingUtils = cuttingUtilsService(cutType);
        this.solver = new SolverCombined(W, L, itemsw, itemsh, allowRotation, cutType);
        this.memory = {};
        this.maxBranches = maxBranches;
    }

    solve (demands, sub) { // Hack
        return this.solver.solve(demands);
    }

    remaining (demands, ps) {
        return demands.map((el, idx) => el - ps.pattern[idx]);
    }

    hash (remaining, pattern) {
        return remaining.reduce((acc, curr) => acc + curr, '') + pattern.pattern.reduce((acc, curr) => acc + curr, '');
    }
}
