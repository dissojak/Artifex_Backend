const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Team = require("../models/team");
const User = require("../models/user");

exports.createTeam = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { name, description, creator } = req.body;
  let user;
  try {
    user = await User.findById(creator);
  } catch (e) {
    return next(new HttpError(" Creating team failed ! ", 500));
  }

  if (user.joined_team !== "-1") {
    return next(new HttpError(" this user already have a team", 500));
  }

  if (!user) {
    return next(
      new HttpError(" we could not find user for provided id ! ", 404)
    );
  }

  const createdTeam = new Team({
    name,
    description,
    captain: creator,
    members: [creator],
    joined_hackathon: [],
  });

  try {
    const SESSION = await mongoose.startSession();
    SESSION.startTransaction();
    await createdTeam.save({ SESSION });
    user.role = "captain";
    user.joined_team = createdTeam._id.toString();
    await user.save({ SESSION });
    await SESSION.commitTransaction();
  } catch (e) {
    console.error(e);
    return next(new HttpError(" Creating team failed !!! ", 500));
  }
  res.status(201).json({ team: createdTeam });
};

exports.addMember = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { email } = req.body;
  const teamId = req.params.tid;
  let user;
  try {
    // const ANalytics = Analytrics with id of artist that we need
    user = await User.findOne({ email });
  } catch (e) {
    return next(new HttpError(" adding member failed ! ", 500));
  }
  if (user.joined_team !== "-1") {
    return next(new HttpError(" this user already has a team", 500));
  }

  if (!user) {
    return next(
      new HttpError(" we could not find user for provided id ! ", 404)
    );
  }
  let team;
  try {
    // get the new Review
    team = await Team.findById(teamId);
  } catch (e) {
    return next(new HttpError(" adding member ! ", 500));
  }
  if (!team) {
    return next(new HttpError(" we could not find this team ! ", 404));
  }

  try {
    const SESSION = await mongoose.startSession();
    SESSION.startTransaction();
    team.members.push(user);
    await team.save({ SESSION });
    user.joined_team = team._id.toString();
    await user.save({ SESSION });
    await SESSION.commitTransaction();
  } catch (e) {
    console.error(e);
    return next(new HttpError(" adding the member to team failed !!! ", 500));
  }
  res.status(201).json({ team: team.toObject({ getters: true }) });

  // try {
  //   const SESSION = await mongoose.startSession();
  //   SESSION.startTransaction();
  // Rating
  // Likes
  // Views
  //   create new review
  //   await review.save({ SESSION });
  //   analytics.ratings = analytics.ratings + Ratings;
  //   analytics.likes = analytics.likes + Likes;
  //   analytics.views = analytics.views + Views;
  //   await analytics.save({ SESSION });
  //   await SESSION.commitTransaction();
  // }
};

exports.deleteMember = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { id_captain } = req.body;
  const teamId = req.params.tid;
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    return next(new HttpError(" finding member failed ! ", 500));
  }
  if (!user) {
    return next(
      new HttpError(" we could not find user for provided id ! ", 404)
    );
  }

  let team;
  try {
    team = await Team.findById(teamId);
  } catch (e) {
    return next(new HttpError(" findding team ! ", 500));
  }
  if (!team) {
    return next(new HttpError(" we could not find this team ! ", 404));
  }

  if (team.captain != id_captain) {
    return next(
      new HttpError(
        " You Are Not Allowed to Kick Any Memeber. You need to Be the Captain ! ",
        422
      )
    );
  }

  try {
    const SESSION = await mongoose.startSession();
    SESSION.startTransaction();
    team.members.pull(user);
    await team.save({ SESSION });
    user.joined_team = "-1";
    await user.save({ SESSION });
    await SESSION.commitTransaction();
  } catch (e) {
    console.error(e);
    return next(
      new HttpError(" deleting the member from the team failed !!! ", 500)
    );
  }
  res.status(200).json({
    message: "Member deleted successfully",
    team: team.toObject({ getters: true }),
    user: user.toObject({ getters: true }),
  });
};
exports.deleteTeam = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const teamId = req.params.tid;
  let team;
  try {
    team = await Team.findById(teamId);
  } catch (e) {
    return next(new HttpError(" adding member ! ", 500));
  }
  if (!team) {
    return next(new HttpError(" we could not find this team ! ", 404));
  }

  try {
    const SESSION = await mongoose.startSession();
    SESSION.startTransaction();
    let captain;
    try {
      captain = await User.findById(team.members[0]);
    } catch (e) {
      return next(new HttpError(" adding member failed ! ", 500));
    }
    if (!captain) {
      return next(
        new HttpError(" we could not find user for provided id ! ", 404)
      );
    }
    captain.role = "member";
    await captain.save({ SESSION });
    team.members.forEach(async (userId) => {
      let user;
      try {
        user = await User.findById(userId);
      } catch (e) {
        return next(new HttpError(" adding member failed ! ", 500));
      }
      if (!user) {
        return next(
          new HttpError(" we could not find user for provided id ! ", 404)
        );
      }
      user.joined_team = "-1";
      await user.save({ SESSION });
    });
    await team.deleteOne({ SESSION });
    await SESSION.commitTransaction();
  } catch (e) {
    console.error(e);
    return next(
      new HttpError(" deleting the member from the team failed !!! ", 500)
    );
  }
  res.status(200).json({ message: "Team deleted successfully" });
};

exports.getTeams = async (req, res, next) => {
  const teams = await Team.find({}, "name members");
  // still need to use * members.length * to give the length of members
  res.status(200).json({
    teams: teams.map((team) => team.toObject({ getters: true })),
  });
};

exports.editTeam = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs , check your data ", 422));
  }
  const { name, description } = req.body;
  const teamId = req.params.tid;
  let team;
  try {
    team = await Team.findById(teamId);
  } catch (e) {
    return next(new HttpError(" updating team fail ! ", 500));
  }
  if (!team) {
    return next(new HttpError(" we could not find this team ! ", 404));
  }

  team.name = name;
  team.description = description;

  try {
    await team.save();
  } catch (e) {
    console.error(e);
    return next(new HttpError(" updating team info failed !!! ", 500));
  }
  res.status(201).json({ team: team.toObject({ getters: true }) });
};

exports.banTeam = async (req, res, next) => {
  const teamId = req.params.tid;

  let team;
  try {
    team = await Team.findById(teamId);
  } catch (e) {
    return next(new HttpError("Something went wrong, could not ban user", 500));
  }

  if (!team) {
    return next(new HttpError("Could not find user for the provided id", 404));
  }

  try {
    await User.updateMany({ joined_team: teamId }, { banned: true });
  } catch (e) {
    return next(new HttpError("Banning team failed", 500));
  }

  res.status(200).json({
    message: "Team and its members got banned successfully",
    banned: true,
  });
};
