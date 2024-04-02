const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Artist = require("../models/user");
const Plan = require("../models/plan");

/**
 * @desc    Logout user and clear cookie
 * @route   PUT /api/artist/openOrder
 * @access  Private
 */
exports.openOrder = asyncHandler(async (req, res, next) => {
  const { normalPrice, rapidPrice } = req.body;
  const artistId = req.user._id;

  try {
    const artist = await Artist.findOneAndUpdate(
      { _id: artistId },
      {
        orderStatus: true,
        normalPrice: normalPrice,
        rapidPrice: rapidPrice,
      },
      { new: true }
    );

    if (!artist) {
      return next(new HttpError("Artist not found", 404));
    }

    res.status(200).json({
      message: "Order statu updated successfully",
      artist,
    });
  } catch (error) {
    return next(
      new HttpError("Failed to update order statue for this artist", 500)
    );
  }
});

/**
 * @desc    update artist social media
 * @route   PATCH /api/artist/socialMedia
 * @params  instagram,facebook,twitter,linked,phone_number (optional)
 * @access  Private
 */
exports.socialMedia = asyncHandler(async (req, res, next) => {
  const artistId = req.user._id;

  let artist = await Artist.findById(artistId);
  if (!artist) {
    return next(new HttpError("Artist not found", 404));
  }

  artist.instagram = req.body.instagram || artist.instagram;
  artist.twitter = req.body.twitter || artist.twitter;
  artist.linkedin = req.body.linkedin || artist.linkedin;
  artist.facebook = req.body.facebook || artist.facebook;
  artist.phone_number = req.body.phone_number || artist.phone_number;

  await artist.save();

  res.status(200).json({
    message: "Social media information updated successfully",
    artist,
  });
});

