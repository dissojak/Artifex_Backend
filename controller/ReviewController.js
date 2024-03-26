const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Review = require("../models/review");
const Artwork = require("../models/artwork");
const Analytics = require("../models/analytics");
const ReportReview = require("../models/reportReview");

// Add your controller methods here

// ---------- esmaany lenna raw manich 3eref ken les function edhom khaw nest7a9ouhom wela le
// awka chnbda nraka7 wkhaw baaed nzidou nthabtou w nraw na9ess nkhdmou bel controller bel controller,
//  nthabtou fyha lin nt2kdou mich ne9sa chy w kif tkhdem w testy bel POSTMAN ma tensech taamel
//  capturet lel mongoDB w postman w hothom f dousi bech baaed nkhdmou byhom f rapport -------

/**
 * @desc    Get reviews by artwork ID
 * @route   GET /api/review/:artworkId
 * @access  Private
 */
exports.getReviewsByArtworkId = asyncHandler(async (req, res, next) => {
  const artworkId = req.params.artworkId;

  let reviews;
  try {
    reviews = await Review.find({ artworkId });
  } catch (err) {
    return next(new HttpError('Fetching reviews failed, please try again later.', 500));
  }

  if (!reviews || reviews.length === 0) {
    return next(new HttpError('Could not find reviews for the provided artwork ID.', 404));
  }

  res.status(200).json({ reviews: reviews.map(review => review.toObject({ getters: true })) });
});

/**
 * @desc     Add a comment to a review
 * @method   Post
 * @route    POST /api/review/addComment
 * @augments artworkId,comment
 * @access   Private
 */
exports.addComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Inputs, check your data", 422));
  }

  const { artworkId, comment } = req.body;
  const clientId=req.user._id;

  let review;
  let analytics;

  try {
    review = await Review.findOne({ clientId, artworkId });

    if (!review) {
      review = new Review({
        clientId,
        artworkId,
        comment
      });
    } else {
      review.comment = comment;
    }

    // Increment the number of comments in the analytics +1
    analytics = await Analytics.findOneAndUpdate({}, { $inc: { numberOfComments: 1 } }, { new: true, upsert: true });

    // Save the review and analytics changes within a session
    const session = await mongoose.startSession();
    session.startTransaction();
    await review.save({ session });
    await analytics.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Failed to add comment", 500));
  }
};

// Update a review
exports.updateComment = async (req, res, next) => {
  // Implement your logic here
  // when you ... , update the analytics
};

// Delete a comment from a review
exports.deleteComment = async (req, res, next) => {
  // Implement your logic here
  //   update the analytics
};

// Add rating to a review
exports.addRating = async (req, res, next) => {
  // Implement your logic here
  //   update the analytics
};

// Update rating in a review
exports.updateRating = async (req, res, next) => {
  // Implement your logic here
  // when you update rating, update the analytics
};

// Delete a review
exports.deleteReview = async (req, res, next) => {
  // Implement your logic here
  // when you delete review , update the analytics
};

// Update view count in a review
exports.updateView = async (req, res, next) => {
  // Implement your logic here
  //   update the analytics
};

// Report a review
exports.reportReview = async (req, res, next) => {
  // Implement your logic here
};

// Get reported reviews
exports.getReportedReviews = async (req, res, next) => {
  // Implement your logic here
};
