require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const loanRoutes = require("./routes/loanRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const supportRoutes = require("./routes/supportRoutes");
const bankerRoutes = require("./routes/bankerRoutes");
const kycRoutes = require("./routes/kycRoutes");
const cardRoutes = require("./routes/cardRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(passport.initialize());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "smartbank-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/banker", bankerRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.get("/", (req, res) => res.json({ message: "SmartBank backend is running" }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SmartBank backend running on port ${PORT}`));
