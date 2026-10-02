/**
 * Binary Max-Heap based Priority Queue — used to process loan
 * applications in priority order (higher priorityScore = processed first)
 * instead of first-come-first-served.
 * insert: O(log n), extractMax: O(log n), peek: O(1)
 */
class PriorityQueue {
  constructor(compare) {
    // compare(a, b) > 0 means a has higher priority than b
    this.heap = [];
    this.compare = compare || ((a, b) => a.priority - b.priority);
  }

  get size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0] ?? null;
  }

  insert(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  extractMax() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }
    return top;
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.compare(this.heap[idx], this.heap[parent]) > 0) {
        [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
        idx = parent;
      } else break;
    }
  }

  _bubbleDown(idx) {
    const n = this.heap.length;
    while (true) {
      let largest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this.compare(this.heap[left], this.heap[largest]) > 0) largest = left;
      if (right < n && this.compare(this.heap[right], this.heap[largest]) > 0) largest = right;
      if (largest === idx) break;
      [this.heap[idx], this.heap[largest]] = [this.heap[largest], this.heap[idx]];
      idx = largest;
    }
  }

  toSortedArray() {
    // non-destructive: returns items best-priority-first
    const clone = new PriorityQueue(this.compare);
    clone.heap = [...this.heap];
    const out = [];
    let item;
    while ((item = clone.extractMax()) !== null) out.push(item);
    return out;
  }
}

module.exports = { PriorityQueue };
