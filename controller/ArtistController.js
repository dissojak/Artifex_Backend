const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Artist = require("../models/user");

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
