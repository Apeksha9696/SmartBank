const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      "MongoDB connection error: MONGO_URI is not set. Add it to backend/.env (see .env.example)."
    );
    process.exit(1);
  }

  try {
    // serverSelectionTimeoutMS keeps a bad/unreachable URI (wrong host,
    // MongoDB not running, IP not whitelisted on Atlas, etc.) from hanging
    // silently for the default 30s — it now fails fast with a clear reason.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    console.error(
      "Check that: (1) MongoDB is actually running/reachable at the MONGO_URI in backend/.env, " +
        "(2) the URI's username/password/host are correct, and (3) if using Atlas, your current IP is whitelisted."
    );
    process.exit(1);
  }
};

module.exports = connectDB;
