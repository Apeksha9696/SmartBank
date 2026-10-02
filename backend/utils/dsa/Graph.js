/**
 * Directed Graph (adjacency list) — accounts are vertices, money
 * transfers are edges. Used for:
 *  - BFS: shortest transfer path / relationship discovery between accounts
 *  - DFS: cycle detection for suspicious circular transfer patterns
 *         (A -> B -> C -> A), flagged as fraud-review candidates.
 */
class TransferGraph {
  constructor() {
    this.adjacency = new Map(); // accountNumber -> Set(accountNumber)
  }

  addAccount(accountNumber) {
    if (!this.adjacency.has(accountNumber)) this.adjacency.set(accountNumber, new Set());
  }

  addTransferEdge(fromAccount, toAccount) {
    this.addAccount(fromAccount);
    this.addAccount(toAccount);
    this.adjacency.get(fromAccount).add(toAccount);
  }

  // BFS — O(V + E)
  bfs(start) {
    const visited = new Set([start]);
    const order = [];
    const queue = [start];
    let i = 0;
    while (i < queue.length) {
      const node = queue[i];
      i += 1;
      order.push(node);
      for (const neighbor of this.adjacency.get(node) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return order;
  }

  // DFS-based cycle detection — flags suspicious circular transfer rings
  detectCycles() {
    const visited = new Set();
    const inStack = new Set();
    const cycles = [];

    const dfs = (node, path) => {
      visited.add(node);
      inStack.add(node);
      path.push(node);

      for (const neighbor of this.adjacency.get(node) || []) {
        if (inStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          cycles.push(path.slice(cycleStart).concat(neighbor));
        } else if (!visited.has(neighbor)) {
          dfs(neighbor, path);
        }
      }

      path.pop();
      inStack.delete(node);
    };

    for (const node of this.adjacency.keys()) {
      if (!visited.has(node)) dfs(node, []);
    }

    return cycles; // array of arrays, each a cyclic path e.g. [A, B, C, A]
  }
}

module.exports = { TransferGraph };
