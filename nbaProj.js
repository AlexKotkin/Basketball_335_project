const express = require("express");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const mongoose = require("mongoose");

const app = express();
const port = process.argv[2];

app.set("views", __dirname);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
      dbName: "CMSC335DB",
    });
    console.log("Connected to MongoDB via Mongoose");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();


app.get("/", (req, res) => {
  res.render("index");
});

// Show page where user builds lineup


//Save Lineup

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  process.stdout.write("Stop to shutdown the server: ");
});

process.stdin.setEncoding("utf8");

process.stdin.on("readable", () => {
  let dataInput;
  while ((dataInput = process.stdin.read()) !== null) {
    const command = dataInput.trim().toLowerCase();
    if (command === "stop") {
      process.stdout.write("Shutting Down Server\n");
      process.exit(0);
    } else {
      console.log(`Invalid Command: ${command}`);
      process.stdout.write("Stop to shutdown the server: ");
    }
  }
});
