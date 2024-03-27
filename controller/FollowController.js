const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Follow = require("../models/follow");
const User = require("../models/user");

/**
 * @desc    Check if the Client Following the given Artist
 * @route   GET /api/follow/isFollowing
 * @access  Privateq
 */
exports.isFollowing = asyncHandler(async (req, res, next) => {
  const clientId = req.user._id;
  const artistId = req.body.artistId;
  try {
    const isFollowing = await Follow.findOne({ clientId, artistId });

    const followingStatus = !!isFollowing; // Convert to boolean
    res.status(200).json({
      msg: `clinet  '${clientId}' is following '${artistId}' ?`,
      isFollowing: followingStatus,
    });
  } catch (err) {
    throw new Error("Failed to check follow status");
  }
});
