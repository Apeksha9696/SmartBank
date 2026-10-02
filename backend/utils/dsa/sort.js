/**
 * Merge Sort — O(n log n) stable sort used to sort a user's transaction
 * history by amount, date, or type on demand from the /transactions
 * endpoint (?sortBy=amount&order=desc).
 */
function mergeSort(arr, compareFn) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compareFn);
  const right = mergeSort(arr.slice(mid), compareFn);

  return merge(left, right, compareFn);
}

function merge(left, right, compareFn) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i += 1;
    } else {
      result.push(right[j]);
      j += 1;
    }
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}

module.exports = { mergeSort };
