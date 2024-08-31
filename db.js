const mongoose = require("mongoose");
require("dotenv").config();
// const mongoURL = process.env.DB_URL_LOCAL;
const mongoURL = process.env.DB_URL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to MongoDB...");
});

db.on("disconnected", () => {
  console.log("Disconnected...");
});

db.on("error", (err) => {
  console.log("Error: ", err);
});

module.exports = db;
