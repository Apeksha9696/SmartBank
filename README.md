# SmartBank — DSA-Powered Banking Platform (MERN)

A full-stack banking web app (React + Node/Express + MongoDB + Tailwind) where
common banking features are implemented on top of real data structures &
algorithms, not just CRUD — so you can walk an interviewer through the DSA
behind every screen.

## What's inside

| Feature | Where it lives | DSA used |
|---|---|---|
| Login / Register | `backend/controllers/authController.js` | bcrypt hashing, JWT, stored in MongoDB `users` collection |
| Transaction ledger | `backend/utils/dsa/LinkedList.js` + `transactionController.js` | Singly linked list (ledger rebuilt from Mongo docs, newest-first) |
| Sort transactions by amount/date | `backend/utils/dsa/sort.js` | Merge sort, O(n log n) |
| Jump to transactions on/after a date | `backend/utils/dsa/search.js` | Binary search, O(log n) |
| Money transfer + fraud pattern check | `backend/utils/dsa/Graph.js` + `accountController.js` | Directed graph, DFS cycle detection (circular transfer rings) |
| Loan application queue | `backend/utils/dsa/PriorityQueue.js` + `loanController.js` | Binary max-heap, ranked by credit score & income-to-loan ratio |
| Customer support tickets | `backend/utils/dsa/Queue.js` + `supportController.js` | FIFO queue |
| Fast account lookups | `backend/utils/dsa/HashMap.js` | Hash map wrapper, O(1) avg lookup |
| Bank schemes (FD / RD / Savings / Loans) | `backend/models/Scheme.js` + `backend/seed/seedSchemes.js` | Seeded product catalogue, styled like real bank scheme pages |

## Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios, lucide-react icons
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Design:** a "passbook & ledger" visual identity — maroon/navy/gold palette, Fraunces + Inter + IBM Plex Mono type

## Project structure

```
smartbank/
├── backend/
│   ├── config/db.js
│   ├── controllers/          # request handlers — this is where DSA gets called
│   ├── middleware/           # auth (JWT) + error handling
│   ├── models/               # User, Account, Transaction, Loan, Scheme, SupportTicket
│   ├── routes/
│   ├── scripts/
│   │   └── resetPassword.js  # CLI tool to fix a user's password
│   ├── seed/seedSchemes.js   # seeds FD/RD/Savings/Loan products
│   ├── utils/dsa/            # LinkedList, Queue, PriorityQueue, Graph, HashMap, sort, search
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/       # Sidebar, Topbar, DashboardLayout, AuthShell, ProtectedRoute
    │   └── pages/            # Login, Register, Dashboard, Transfer, Transactions, Loans, Schemes, Support, admin/AdminLoanQueue
    └── package.json
```

## Running locally

### Prerequisites
- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Backend

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed               # seeds FD/RD/Savings/Loan schemes into MongoDB
npm run dev                # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

Open `http://localhost:5173`, register a new account, and you're in.

### Making yourself an admin

Register normally, then in MongoDB (e.g. via `mongosh` or Compass) flip your role:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

The sidebar will show an **Admin Desk** link, and `/admin/loans` will show the heap-ranked loan processing queue.

---

## API quick reference

| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | — | creates User + Account |
| POST | `/api/auth/login` | — | returns JWT |
| GET  | `/api/auth/me` | ✔ | current user |
| GET  | `/api/accounts/me` | ✔ | current account & balance |
| POST | `/api/accounts/deposit` | ✔ | `{ amount, note }` |
| POST | `/api/accounts/withdraw` | ✔ | `{ amount, note }` |
| POST | `/api/accounts/transfer` | ✔ | `{ toAccountNumber, amount, note }` — runs DFS fraud check |
| GET  | `/api/transactions?sortBy=amount\|date&order=asc\|desc&onOrAfter=ISO` | ✔ | merge-sort + binary search |
| POST | `/api/loans/apply` | ✔ | `{ loanType, amountRequested, tenureMonths, monthlyIncome, schemeCode? }` |
| GET  | `/api/loans/me` | ✔ | your loan applications |
| GET  | `/api/loans/queue` | admin | heap-ranked processing order |
| PATCH | `/api/loans/:id/status` | admin | `{ status, remarks }` |
| GET  | `/api/schemes?category=` | — | FD / RD / Savings / Loan products |
| POST | `/api/support` | ✔ | raise a ticket, returns FIFO queue position |
| GET  | `/api/support/queue` | admin | FIFO queue |
| PATCH | `/api/support/:id/resolve` | admin | dequeues the ticket |

## Talking about this in an interview

A useful framing: *"MongoDB is the source of truth for persistence, but on
top of it I implemented the actual data structure that fits each feature —
a linked list for the transaction ledger so I can walk it node by node, a
max-heap so loan applications are processed by priority instead of FIFO, a
directed graph with DFS so I can detect circular transfer rings, and a
plain FIFO queue for support tickets."* Each DSA file has a comment at the
top explaining exactly why that structure was chosen and its complexity.

## Notes & next steps

- Passwords are hashed with bcrypt; JWTs expire after 7 days by default.
- Balance updates use MongoDB sessions/transactions so deposits, withdrawals, and transfers are atomic.
- The loan interest-rate and priority-score formulas are simple, explainable heuristics for demo purposes — not real underwriting logic.
- Ideas to extend: email/SMS OTP on transfer, statement PDF export, card management, recurring standing instructions, dark mode.
