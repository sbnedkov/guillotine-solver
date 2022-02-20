export default class BinaryTree {
    constructor (val) {
        this.root = new Node(val); 
    }

    add (val) {
        this.root.add(val);
    }

    has (val) {
        return this.root.has(val);
    }

    print () {
        this.root.print('');
    }
}

class Node {
    constructor (val) {
        this.val = val;
    }

    add (val) {
        var current = this;
        while (current) {
            if (current.val > val) {
                if (!current.left) {
                    current.left = new Node(val);
                    break;
                } else {
                    current = current.left;
                }
            } else {
                if (!current.right) {
                    current.right = new Node(val);
                    break;
                } else {
                    current = current.right;
                }
            }
        }
    }

    has (val) {
        var current = this;
        while (current) {
            if (current.val > val) {
                current = current.left;
            } else if (current.val < val) {
                current = current.right;
            } else if (current.val === val) {
                return true;
            } else {
                throw new Error(`Error in BinaryTree: ${val} ${current.val}`);
            }
        }
    }

    print (indent) {
        console.log(indent, this.val);
        this.left && (console.log('Left:') || this.left.print(indent + ' '));
        this.right && (console.log('Right:') || this.right.print(indent + ' '));
    }
}
