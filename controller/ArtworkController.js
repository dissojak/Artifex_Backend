const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Artwork = require("../models/artwork");

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
  const { title, description, price, imageArtwork, id_category,exclusive } = req.body;

  try {
    // Create new artwork instance
    const newArtwork = new Artwork({
      title,
      description,
      price,
      imageArtwork,
      id_category,
      id_artist: artistId,
      exclusive:exclusive || false,
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
    const artworks = await Artwork.find({
      type: "public",
      exclusive: false,
      isDeletedByUser: false,
    })
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

/**
 * @desc    Get Exclusive Artworks from database
 * @route   GET /api/artwork/getExclusiveArtworks
 * @access  Private
 * @author  Admin
 */
exports.getExclusiveArtworks = asyncHandler(async (req, res, next) => {
  try {
    const artworks = await Artwork.find({ exclusive: true })
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

/**
 * @desc    Delete an artwork
 * @route   DELETE /api/artwork/deleteArtworkByAdmin/:artworkId
 * @params  artworkId
 * @access  Private
 * @author  Admin
 */
exports.deleteArtworkByAdmin = asyncHandler(async (req, res, next) => {
  const artworkId = req.params.artworkId;

  try {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return next(new HttpError("Artwork not found", 404));
    }

    await artwork.deleteOne();

    res.json({ msg: "Artwork deleted successfully" });
  } catch (error) {
    next(new HttpError(`${error.message},Failed to delete artwork`, 500));
  }
});

/**
 * @desc    Delete an artwork
 * @route   DELETE /api/artwork/deleteArtwork/:artworkId
 * @params  artworkId
 * @access  Private
 */
exports.deleteArtwork = asyncHandler(async (req, res, next) => {
  const artworkId = req.params.artworkId;

  try {
    let artwork = await Artwork.findById(artworkId);

    if (!artwork) {
      return next(new HttpError("Artwork not found", 404));
    }

    // Check if the user is authorized to delete the artwork
    if (String(artwork.id_artist) !== String(req.user._id)) {
      return next(
        new HttpError("You are not authorized to delete this artwork", 403)
      );
    }
    // Find the artwork by its ID and update the deletion status
    artwork = await Artwork.findByIdAndUpdate(
      artworkId,
      { isDeletedByOwner: true },
      { new: true }
    );

    res.status(200).json({
      msg: "Artwork deleted successfully",
      artwork,
    });
  } catch (error) {
    next(new HttpError(error.message || "Failed to delete artwork", 500));
  }
});
