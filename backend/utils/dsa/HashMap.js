/**
 * Thin wrapper around JS Map used explicitly as a HashMap for O(1)
 * average-case account-number -> account lookups when scanning a batch
 * of accounts in memory (e.g. building the "Top Customers" leaderboard).
 */
class AccountHashMap {
  constructor() {
    this.map = new Map();
  }

  set(accountNumber, accountData) {
    this.map.set(accountNumber, accountData);
  }

  get(accountNumber) {
    return this.map.get(accountNumber) || null;
  }

  has(accountNumber) {
    return this.map.has(accountNumber);
  }

  values() {
    return Array.from(this.map.values());
  }
}

module.exports = { AccountHashMap };
