/**
 * Binary Search over a transaction list pre-sorted by createdAt (ms
 * timestamp). Used to jump straight to "first transaction on/after date X"
 * instead of scanning the whole ledger — O(log n) vs O(n).
 */
function binarySearchByTimestamp(sortedTransactions, targetTimestamp) {
  let lo = 0;
  let hi = sortedTransactions.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midTs = new Date(sortedTransactions[mid].createdAt).getTime();

    if (midTs === targetTimestamp) return mid;
    if (midTs < targetTimestamp) {
      lo = mid + 1;
    } else {
      result = mid; // candidate: first element >= target
      hi = mid - 1;
    }
  }
  return result;
}

module.exports = { binarySearchByTimestamp };
