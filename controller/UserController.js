const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const LikedArtworks = require("../models/likedArtworks");
const SavedArtworks = require("../models/savedArtworks");

exports.signupAdmin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { email, username, pw} = req.body;
  const createdAdmin = new User({
    email,
    username: username.toLowerCase(),
    pw,
    userType:"admin",
    banned: false,
  });
  try {
    await createdAdmin.save();
    console.log("Admin saved successfully");
  } catch (e) {
    return next(new HttpError("Creating Admin failed ! ", 500));
  }
  res.status(201).json({
    message: "Admin has been added successfully !",
    admin: createdAdmin.toObject({ getters: true }),
  });
};

exports.signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { email, username, pw, userType, phone_number, instagram, twitter, linkedin, facebook } = req.body;
  const createdClient = new User({
    email,
    username: username.toLowerCase(),
    pw,
    userType,
    banned: false,
    phone_number: phone_number ,
    instagram: instagram ,
    twitter: twitter ,
    linkedin: linkedin ,
    facebook: facebook ,
    panier: [], // Initialize empty panier array for client
  });
  try {
    await createdClient.save();
    console.log("Client saved successfully");
  } catch (e) {
    return next(new HttpError("Creating Client failed ! ", 500));
  }
  let message;
  if (userType === 'client') {
    message = "Client has been added successfully !";
  } else if (userType === 'artist') {
    message = "Artist has been added successfully !";
  }
  res.status(201).json({
    message,
    client: createdClient.toObject({ getters: true }),
  });
};