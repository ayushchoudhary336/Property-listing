const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust", {
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is down
    });
    console.log("Connected to DB");
    await initdb(); // Run initdb after connection
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
}

async function initdb() {
  try {
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("Data was initialized");
  } catch (err) {
    console.error("Error initializing data:", err);
    process.exit(1);
  }
}

main();
