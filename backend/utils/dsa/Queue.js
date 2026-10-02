/**
 * FIFO Queue — powers the customer-support ticket line so tickets are
 * always resolved in the order they arrived (array-index based, O(1)
 * amortized enqueue, O(1) dequeue via head pointer to avoid O(n) shift).
 */
class Queue {
  constructor(items = []) {
    this.items = [...items];
    this.headIndex = 0;
  }

  enqueue(item) {
    this.items.push(item);
    return item;
  }

  dequeue() {
    if (this.headIndex >= this.items.length) return null;
    const item = this.items[this.headIndex];
    this.headIndex += 1;
    return item;
  }

  peek() {
    return this.items[this.headIndex] ?? null;
  }

  get length() {
    return this.items.length - this.headIndex;
  }

  toArray() {
    return this.items.slice(this.headIndex);
  }
}

module.exports = { Queue };
