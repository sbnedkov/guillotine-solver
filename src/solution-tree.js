export default class Tree {
    constructor (demands, pattern, depth) {
        this.demands = demands;
        this.pattern = pattern;
        this.children = [];
        this.depth = depth || 0;
    }

    add (demands, pattern) {
//        console.log('Add child at depth: ', this.depth);
        var newTree = new Tree(demands, pattern, this.depth + 1);
        this.children.push(newTree);
        return newTree;
    }

    addSubTree (subTree) {
        var newTree = this.add(subTree.demands, subTree.pattern);
        subTree.children.forEach(sub => {
            newTree.addSubTree(sub);
        });
    }

    allBranches () {
        var solution = this.pattern ? [this.pattern] : [];
        var solutions = [];

        if (this.children.length) {
            this.children.forEach(subTree => {
                var subBranches = subTree.allBranches();
                subBranches.forEach(subBranch => {
                    solutions.push(solution.concat(subBranch));
                });
            });
        } else {
            solutions.push(solution);
        }

        return solutions;
    }
}
