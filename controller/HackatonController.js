const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Hackaton = require("../models/hackaton");
const Team = require("../models/team");
const User = require("../models/user");

// exports.addHackaton = async (req, res, next) => {
//   console.log('this is' ,req.files);
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     console.log(errors);
//     return next(new HttpError("Invalid Inputs , check your data ", 422));
//   }

//   const { title, organisateur, theme, email, description, StartingDate, EndingDate } = req.body;

//   // Assuming that the uploaded file is available in req.files.photo
//   const { photo } = req.files;

//   cloudinary.uploader.upload(
//     photo.tempFilePath,
//     { folder: 'hackathon_images' },
//     async (error, result) => {
//       if (error) {
//         return next(new HttpError("Image upload failed", 500));
//       }

//       const newHackaton = new Hackaton({
//         title,
//         organisateur,
//         theme,
//         email,
//         description,
//         StartingDate,
//         EndingDate,
//         participants: [],
//         photoUrl: result.url, // Store the Cloudinary URL
//       });

//       try {
//         await newHackaton.save();
//       } catch (e) {
//         return next(new HttpError("Creating hackaton failed!", 500));
//       }

//       res.status(201).json({ hackaton: newHackaton });
//     }
//   );
// };

exports.addHackaton = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }

  const {
    title,
    organisateur,
    theme,
    email,
    description,
    StartingDate,
    EndingDate,
  } = req.body;

  const newHackaton = new Hackaton({
    title,
    organisateur,
    theme,
    email,
    description,
    StartingDate,
    EndingDate,
    participants: [],
  });

  try {
    await newHackaton.save();
  } catch (e) {
    return next(new HttpError("Creating hackaton failed!", 500));
  }

  res.status(201).json({ hackaton: newHackaton });
};

exports.getHackatonById = async (req, res, next) => {
  const hackatonId = req.params.hid;
  let hackaton;
  try {
    hackaton = await Hackaton.findById(hackatonId);
  } catch (e) {
    return next(new HttpError(" Somthing Went Wrong ! ", 500));
  }
  if (!hackaton) {
    return next(
      new HttpError("couldn't find hackaton for the provided id", 404)
    );
  }
  res.json({ hackaton: hackaton.toObject({ getters: true }) });
};

exports.getHackatons = async (req, res, next) => {
  const hackatons = await Hackaton.find({}, "-documents -description");
  // still need to use * members.length * to give the length of members
  res.status(200).json({
    hackatons: hackatons.map((hackaton) =>
      hackaton.toObject({ getters: true })
    ),
  });
};

exports.addParticipant = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { userId, hackatonId } = req.body;
  let hackaton;
  try {
    hackaton = await Hackaton.findById(hackatonId);
  } catch (e) {
    return next(new HttpError(" adding hackaton fail ! ", 500));
  }
  if (!hackaton) {
    return next(new HttpError(" we could not find this hackaton ! ", 404));
  }
  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    return next(new HttpError(" adding hackaton fail  ! ", 500));
  }
  if (!user) {
    return next(new HttpError(" we could not find this user ! ", 404));
  }
  const teamId = user.joined_team;
  let team;
  try {
    team = await Team.findById(teamId);
  } catch (e) {
    return next(
      new HttpError(
        " You Are not a member in any team Please create one ! ",
        500
      )
    );
  }
  if (!team) {
    return next(new HttpError(" we could not find this team ! ", 404));
  }

  if (hackaton.participants.includes(teamId)) {
    return next(
      new HttpError("Your team is already a participant in this hackaton!", 422)
    );
  }

  try {
    const SESSION = await mongoose.startSession();
    SESSION.startTransaction();
    team.joined_hackathon.push(hackaton);
    await team.save({ SESSION });
    hackaton.participants.push(team);
    //   = team._id.toString();
    await hackaton.save({ SESSION });
    await SESSION.commitTransaction();
  } catch (e) {
    console.error(e);
    return next(new HttpError(" adding the member to team failed !!! ", 500));
  }
  res.status(201).json("inscription in hackaton is DONE successfully ! ");
  // whatever !!
};

exports.removeParticipant = async (req, res, next) => {
  const { userId, hackatonId } = req.body;

  let hackaton;
  try {
    hackaton = await Hackaton.findById(hackatonId);
  } catch (e) {
    return next(new HttpError("Removing participant failed!", 500));
  }

  if (!hackaton) {
    return next(
      new HttpError("Couldn't find hackaton for the provided id", 404)
    );
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    return next(new HttpError("Removing participant failed!", 500));
  }

  if (!user) {
    return next(new HttpError("Couldn't find user for the provided id", 404));
  }

  const teamId = user.joined_team;
  let team;
  try {
    team = await Team.findById(teamId);
  } catch (e) {
    return next(new HttpError("Removing participant failed!", 500));
  }

  if (!team) {
    return next(new HttpError("Couldn't find team for the provided id", 404));
  }

  try {
    const SESSION = await mongoose.startSession();
    SESSION.startTransaction();

    team.joined_hackathon.pull(hackaton._id);
    await team.save({ SESSION });

    hackaton.participants.pull(team._id);
    await hackaton.save({ SESSION });

    await SESSION.commitTransaction();
  } catch (e) {
    console.error(e);
    return next(new HttpError("Removing participant failed!", 500));
  }

  res.status(200).json("Participant removed from hackaton successfully!");
};

exports.editHackaton = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs, check your data", 422));
  }

  const hackatonId = req.params.hid;
  const {
    title,
    organisateur,
    theme,
    email,
    description,
    StartingDate,
    EndingDate,
  } = req.body;

  let hackaton;
  try {
    hackaton = await Hackaton.findById(hackatonId);
  } catch (e) {
    return next(
      new HttpError("Something went wrong, could not update hackaton", 500)
    );
  }

  if (!hackaton) {
    return next(
      new HttpError("Could not find hackaton for the provided id", 404)
    );
  }

  hackaton.title = title;
  hackaton.organisateur = organisateur;
  hackaton.theme = theme;
  hackaton.email = email;
  hackaton.description = description;
  hackaton.StartingDate = StartingDate;
  hackaton.EndingDate = EndingDate;

  try {
    await hackaton.save();
  } catch (e) {
    return next(new HttpError("Updating hackaton failed", 500));
  }

  res
    .status(200)
    .json({
      msg: "Hackaton Updated correctly !",
      hackaton: hackaton.toObject({ getters: true }),
    });
};

exports.deleteHackaton = async (req, res, next) => {
  const hackatonId = req.params.hid;

  let hackaton;
  try {
    hackaton = await Hackaton.findById(hackatonId);
  } catch (e) {
    console.error("Error finding hackaton:", e);
    return next(
      new HttpError("Something went wrong, could not delete hackaton", 500)
    );
  }

  if (!hackaton) {
    return next(
      new HttpError("Could not find hackaton for the provided id", 404)
    );
  }

  let teams;
  try {
    teams = await Team.find({ joined_hackathon: hackatonId });
  } catch (e) {
    console.error("Error finding teams:", e);
    return next(
      new HttpError("Something went wrong, could not find teams", 500)
    );
  }

  try {
    const SESSION = await mongoose.startSession();
    SESSION.startTransaction();

    const teamUpdates = teams.map(async (team) => {
      team.joined_hackathon.pull(hackatonId);
      return team.save({ session: SESSION });
    });

    await Promise.all(teamUpdates);

    await hackaton.deleteOne({ session: SESSION });

    await SESSION.commitTransaction();

    res.status(200).json({ message: "Hackaton deleted successfully" });
  } catch (e) {
    console.error("Error deleting hackaton:", e);
    return next(new HttpError("Deleting hackaton failed", 500));
  }
};
