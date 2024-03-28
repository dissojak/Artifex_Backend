const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const ReportArtwork = require("../models/reportArtwork");
const ReportReview = require("../models/reportReview");

/**
 * @desc     Get reported reviews
 * @method   get
 * @route    GET /api/report/reported
 * @access   Private
 */
exports.getReportedReviews = asyncHandler(async (req, res, next) => {
    try {
      const reports = await ReportReview.find();
      if (!reports || reports.length === 0) {
        return res.json({
          msg: "vide",
          reports: [],
        });
      }
      res.json({
        msg: "reports retrieved successfully",
        reports,
      });
    } catch (err) {
      return next(new HttpError(`Failed to get reports , ${err}`, 500));
    }
  });
  
  /**
   * @desc     Get reported reviews by class of report
   * @method   get
   * @route    GET /api/report/getReportByClass
   * @params   class
   * @access   Private
   */
  exports.getReportedReviewsByClass = asyncHandler(async (req, res, next) => {
  const reportClass=req.body.class;
  try {
    const reports = await ReportReview.find({reportClass});
    if (!reports || reports.length === 0) {
      return res.json({
        msg: "vide",
        reports: [],
      });
    }
    res.json({
      msg: `reports of class:'${reportClass}' retrieved successfully`,
      reports,
    });
  } catch (err) {
    return next(new HttpError(`Failed to get reports , ${err}`, 500));
  }
  });

