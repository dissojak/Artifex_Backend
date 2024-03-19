const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

exports.signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { email, username, pw, age, role, adminCode } = req.body;
  const createdUser = new User({
    email,
    username: username.toLowerCase(),
    pw,
    age: age || 18,
    role: role || "member",
    joined_team: "-1",
    banned: false,
    isAdmin: adminCode.toUpperCase() === "STOON" ? true : false,
  });
  try {
    await createdUser.save();
    console.log("User saved successfully");
  } catch (e) {
    return next(new HttpError(" Creating User failed ! ", 500));
  }
  res.status(201).json({
    message: "User has been added succsessfully !",
    user: createdUser.toObject({ getters: true }),
  });
};

exports.loginUser = async (req, res, next) => {
  const { email, pw } = req.body;
  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError(" Somthing Went Wrong ! ", 500));
  }
  if (!user) {
    return next(new HttpError("Invalid Account !", 401));
  }
  if (user.pw !== pw) {
    return next(new HttpError("Incorrect Password !", 401));
  }
  if (user.banned === true) {
    res.json({
      message: ` User ${user.username} is Banned ! `,
      ban: true,
      user: user.toObject({ getters: true }),
    });
  } else {
    res.json({
      message: ` welcome Mr/Ms ${user.username} `,
      ban: false,
      user: user.toObject({ getters: true }),
    });
  }
};

exports.changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { newPw, oldPw } = req.body;
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    return next(new HttpError(" Somthing Went Wrong ! ", 500));
  }
  if (user.pw !== oldPw) {
    return next(
      new HttpError(
        " the old password is not matching with provided one check the old password again ! ",
        500
      )
    );
  }
  user.pw = newPw;

  try {
    await user.save();
  } catch (e) {
    return next(new HttpError(" Updating place failed ! ", 500));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.changeUsername = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { username } = req.body;
  const userId = req.params.uid;
  let user;
  try {
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUser && existingUser._id.toString() !== userId) {
      return next(new HttpError("Username already exists", 422));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }

  try {
    user = await User.findById(userId);
  } catch (e) {
    return next(new HttpError(" Somthing Went Wrong ! ", 500));
  }
  user.username = username.toLowerCase();

  try {
    await user.save();
  } catch (e) {
    return next(new HttpError(" Updating place failed ! ", 500));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.changeEmail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { email } = req.body;
  const userId = req.params.uid;
  let user;
  
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Something went wrong while checking email availability", 500));
  }

  if (existingUser && existingUser.id !== userId) {
    return next(new HttpError("Email is already taken by another user", 422));
  }

  try {
    user = await User.findById(userId);
  } catch (e) {
    return next(new HttpError(" Somthing Went Wrong ! ", 500));
  }
  user.email = email;

  try {
    await user.save();
  } catch (e) {
    return next(new HttpError(" Updating place failed ! ", 500));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.getUsersByTeamId = async (req, res, next) => {
  const TeamId = req.params.tid;
  let USERS;
  try {
    USERS = await User.find({ joined_team: TeamId }, "username role");
  } catch (err) {
    return next(new HttpError(" Somthing Went Wrong HERE ! ", 500));
  }
  if (!USERS || USERS.length === 0) {
    next(new HttpError("couldn't find User for the provided Team id", 404));
  } else {
    res.json({
      USERS: USERS.map((user) => user.toObject({ getters: true })),
    });
  }
};

exports.getUserById = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError(" Something Went Wrong in getting user by ID! ", 500)
    );
  }
  if (user) {
    res.json({ user: user.toObject({ getters: true }) });
  } else {
    res.json({ message: "User not found" });
  }
};

exports.getTeamJoinedByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId, "joined_team");
  } catch (err) {
    return next(new HttpError(" Somthing Went Wrong HERE in get team! ", 500));
  }
  if (user) {
    res.json({ teamId: user.joined_team });
  } else {
    // return next(new HttpError("there is no user with this Id"));
    res.json({ teamid: -1 });
  }
};

(exports.update_ProfileImage = async (req, res) => {
  try {
    const userId = req.params.uid; // Assuming you have user authentication
    const { imageUrl } = req.body; // Assuming you send the image URL in the request body
    console.log(userId, "||", imageUrl);
    // Update the user's profileImage field in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true } // To get the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ error: "Failed to update profile image" });
  }
}),
  //admin function
  (exports.updateAllUsersToAdmin = async (req, res, next) => {
    try {
      await User.updateMany({}, { isAdmin: false });
      res.json("all users updated to admin.");
    } catch (error) {
      return next(new HttpError("Error updating users to admin", 500));
    }
  });
