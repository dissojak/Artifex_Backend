const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Artwork = require("../models/artwork");
const { getCategoryNameById } = require("../controller/CategoryController");

/**
 * @desc    Add new artwork
 * @route   POST /api/artwork/addArtwork
 * @params  title,description,price,imageArtwork,id_category
 * @access  Private
 */
exports.addArtwork = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid data", 400));
  }

  const artistId = req.user._id;
  const { title, description, price, imageArtwork, id_category } = req.body;

  try {
    // Create new artwork instance
    const newArtwork = new Artwork({
      title,
      description,
      price,
      imageArtwork,
      id_category,
      id_artist: artistId,
    });

    // Save artwork to database
    const artwork = await newArtwork.save();

    res.json({
      msg: "Artwork added successfully",
      artwork,
    });
  } catch (error) {
    next(new HttpError(error.message || "Failed to add artwork", 500));
  }
});

/**
 * @desc    Get artworks from database
 * @route   GET /api/artwork/getArtworks
 * @access  Private
 */
exports.getArtworks = asyncHandler(async (req, res, next) => {
  try {
    const artworks = await Artwork.find({type:'public',exclusive:false})
      .populate({
        path: "id_category", // Populate the 'id_category' field
        select: "name", // Select the 'name'
        // select: 'name -_id' // Select only the 'name' field and exclude the '_id' field
      })
      .populate({
        path: "id_artist",
        select: "username , profileImage",
      });

    if (!artworks || artworks.length === 0) {
      return next(new HttpError("Artworks not found", 404));
    }

    res.json({
      msg: "Artworks retrieved successfully",
      artworks,
    });
  } catch (error) {
    next(new HttpError(error.message || "Failed to retrieve artwork", 500));
  }
});
