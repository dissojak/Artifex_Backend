const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const HttpError = require("./models/http-error");

const user = require("./routes/user");
const team = require("./routes/team");
const hackaton = require("./routes/hackaton");
const upload = require('./upload');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE"
  );
  // res.setHeader("Content-Type", "multipart/form-data");
  next();
});

app.use("/api/user", user);
app.use("/api/user", team);
app.use("/api/admin", team);
app.use("/api/hackaton", hackaton);
// app.use('/api/hackaton', upload);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route !", 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An error occurred" });
});

cloudinary.config({
  cloud_name: 'duvougrqx',
  api_key: '513133278582537',
  api_secret: '0UgeZPnsrmRfbWu-u8eZxo-W0uk',
});




// const CLOUDINARY_URL="CLOUDINARY_URL=cloudinary://513133278582537:0UgeZPnsrmRfbWu-u8eZxo-W0uk@duvougrqx";
// cloudinary.config(process.env.CLOUDINARY_URL);


mongoose
  .connect(
    "mongodb+srv://dissojak:stoondissojakb2a@stoon.r8tcyqv.mongodb.net/hackaton?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(8000);
  })
  .catch((err) => {
    console.log("MongoDB connection error:",err);
  });
