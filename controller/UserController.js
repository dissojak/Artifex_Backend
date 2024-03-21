const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const LikedArtworks = require("../models/likedArtworks");
const SavedArtworks = require("../models/savedArtworks");
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken.js').default;

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

// -----------------------------------------------------------------------------------------------------

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
exports.authUser = asyncHandler(async (req, res) => {
  const { email, pw } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(pw))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => {
  const { username, email, pw , userType } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  let userData = {
    username: username.toLowerCase(),
    email,
    pw,
    userType,
    banned: false,
  };

  // Add additional fields based on user type
  if (userType === 'artist') {
    userData = {
      ...userData,
      instagram: req.body.instagram,
      twitter: req.body.twitter,
      linkedin: req.body.linkedin,
      facebook: req.body.facebook,
      normalPrice: req.body.normalPrice,
      rapidPrice: req.body.rapidPrice,
      orderStatus: req.body.orderStatus,
    };
  }

  const user = await User.create(userData);

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      userType: user.userType,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
exports.logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.pw) {
      user.pw = req.body.pw;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});