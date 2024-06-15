//step1
const mongoose = require("mongoose");
require("dotenv").config();

//step2
//define mongodb connextion url
const mongoURL = process.env.DB_URL_LOCAL;
// const mongoURL = process.env.DB_URL

//step3
//set-up MongoDB connection
mongoose.connect(mongoURL, {});

//step4
//get the default connection
//Mongoose maintains a deafult connnection object representing the MongoDB connection
const db = mongoose.connection;

//step5
//add event listeners
db.on("connected", () => {
  console.log("Connected to MongoDB server");
});

db.on("error", () => {
  console.log("MongoDB connection error");
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

//step6
//export the database connection
module.exports = db;
