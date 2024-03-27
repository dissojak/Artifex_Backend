const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const RC = require("../controller/ReviewController");
const MW = require("../middleware/authMiddleware");

// Get reviews by artwork ID
router.get("/:artworkId", MW.protect, RC.getReviewsByArtworkId);

// Add or update a comment in a review
router.patch(
  "/addComment",
  [check("comment").isLength({ min: 2, max: 50 })],
  MW.protect,
  RC.addComment
);

// Update view count in a review
router.patch("/updateView", MW.protect, RC.updateView);

// Delete a comment from a review by the Client
router.delete("/deleteComment", MW.protect, RC.deleteComment);

// Add or update rating in a review
router.patch("/addRating", RC.addRating);

// Delete a review
router.delete("/deleteReview/:reviewId", RC.deleteReview);

// Report a review
router.post("/report/:reviewId", RC.reportReview);

// Get reported reviews
router.get("/reported", RC.getReportedReviews);

module.exports = router;
