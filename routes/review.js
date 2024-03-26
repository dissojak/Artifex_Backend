const express = require("express");
const router = express.Router();
const RC = require("../controller/ReviewController");
const MW = require("../middleware/authMiddleware");

// Get reviews by artwork ID
router.get("/:artworkId",MW.protect, RC.getReviewsByArtworkId);

// Add a comment to a review
router.post("/addComment",MW.protect, RC.addComment);

// Update a comment in a review
router.patch("/updateComment/:reviewId/:commentId", RC.updateComment);

// Delete a comment from a review
router.delete("/deleteComment/:reviewId/:commentId", RC.deleteComment);

// Add rating to a review
router.post("/addRating/:reviewId", RC.addRating);

// Update rating in a review
router.patch("/updateRating/:reviewId", RC.updateRating);

// Delete a review
router.delete("/deleteReview/:reviewId", RC.deleteReview);

// Update view count in a review
router.patch("/updateView/:reviewId", RC.updateView);

// Report a review
router.post("/report/:reviewId", RC.reportReview);

// Get reported reviews
router.get("/reported", RC.getReportedReviews);

module.exports = router;
