const express = require("express");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.argv[2];

app.set("views", __dirname);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const dbName = "CMSC335DB";
const collectionName = "campApplicants";
app.get("/", (req, res) => {
  res.render("index");
});



process.stdin.setEncoding("utf8");
