const express = require("express");
const RPC = require("../controller/ReportController");
const MW = require("../middleware/authMiddleware");
const router = express.Router();

// Get reported reviews
router.get("/reported", MW.protect, RPC.getReportedReviews);

// Get reported reviews by class
router.get("/getReviewByClass", MW.protect, RPC.getReportedReviewsByClass);


module.exports = router;
