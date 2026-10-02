/**
 * Singly Linked List — used to model a live, in-memory ledger of an
 * account's transactions (most recent transaction at HEAD).
 * MongoDB remains the source of truth for persistence; this structure
 * is rebuilt from DB documents whenever the ledger needs to be walked,
 * searched, reversed, or paginated node-by-node instead of via array ops.
 */
class TransactionNode {
  constructor(transaction) {
    this.data = transaction; // { _id, type, amount, balanceAfter, note, createdAt }
    this.next = null;
  }
}

class TransactionLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // O(1) — insert newest transaction at the head
  addFirst(transaction) {
    const node = new TransactionNode(transaction);
    node.next = this.head;
    this.head = node;
    this.size += 1;
    return node.data;
  }

  // O(n) — linear walk, used when caller wants the whole ledger as an array
  toArray() {
    const out = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.data);
      cur = cur.next;
    }
    return out;
  }

  // O(n) — find first transaction matching a predicate (e.g. by id)
  find(predicate) {
    let cur = this.head;
    while (cur) {
      if (predicate(cur.data)) return cur.data;
      cur = cur.next;
    }
    return null;
  }

  // O(n) — delete a transaction node (used for reversal / undo requests)
  removeById(id) {
    let cur = this.head;
    let prev = null;
    while (cur) {
      if (String(cur.data._id) === String(id)) {
        if (prev) prev.next = cur.next;
        else this.head = cur.next;
        this.size -= 1;
        return cur.data;
      }
      prev = cur;
      cur = cur.next;
    }
    return null;
  }

  static fromArray(transactions) {
    // transactions expected newest-first
    const list = new TransactionLinkedList();
    for (let i = transactions.length - 1; i >= 0; i -= 1) {
      list.addFirst(transactions[i]);
    }
    return list;
  }
}

module.exports = { TransactionLinkedList, TransactionNode };
