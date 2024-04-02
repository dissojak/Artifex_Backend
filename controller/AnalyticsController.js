const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Analytics = require("../models/analytics");

exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const artistId = req.user._id;
  
  //   just for test
  // const artistId = req.params.artistId;

  const analytics = await Analytics.findOne({ artistId });
  if (!analytics) {
    return next(new HttpError("Analytics not found", 404));
  }

  res.status(200).json({
    message: "Analytics retrived successfully",
    analytics,
  });
});
