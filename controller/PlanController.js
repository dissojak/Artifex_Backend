const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Plan = require("../models/plan");

exports.subscribe = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Inputs, check your data", 422));
  }

  const { planType } = req.body;
  const artistId = req.user._id;

  try {
    // Check if the artist has any active subscriptions
    const activeSubscriptions = await Plan.findOne({
      artistId,
      dateEnd: { $gt: new Date() }, // Check if the end date is in the future
    });

    if (activeSubscriptions) {
      return res
        .status(400)
        .json({ message: "Artist already has an active subscription" });
    }

    const dateStart = new Date();
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 30);

    const plan = new Plan({
      planType,
      dateStart,
      dateEnd,
      artistId,
    });

    await plan.save();

    res.status(201).json({ message: "Plan subscribed successfully", plan });
  } catch (error) {
    return next(new HttpError("Failed to subscribe to the plan", 500));
  }
});

exports.getPlans = asyncHandler(async (req, res, next) => {
  try {
    const plans = await Plan.find();

    if (!plans || plans.length === 0) {
      return res
        .status(404)
        .json({ message: "No plans found for this artist" });
    }

    res.status(200).json({
      message: "Plans retrieved successfully",
      plans,
    });
  } catch (error) {
    return next(new HttpError("Failed to retrieve plans for this artist", 500));
  }
});

exports.getHistorique = asyncHandler(async (req, res, next) => {
  const artistId = req.user._id;

  try {
    const plans = await Plan.find({ artistId });

    if (!plans || plans.length === 0) {
      return res
        .status(404)
        .json({ message: "No plans found for this artist" });
    }

    res.status(200).json({
      message: "historique of plans retrieved successfully",
      plans,
    });
  } catch (error) {
    return next(
      new HttpError("Failed to retrieve plans history for this artist", 500)
    );
  }
});

exports.getActivePlan = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Inputs, check your data", 422));
  }
  const artistId = req.user._id;

  let isSubscribed = true;

  // Check if the artist has any active subscriptions
  const activePlan = await Plan.findOne({
    artistId,
    dateEnd: { $gt: new Date() },
  });
  if (!activePlan) {
    isSubscribed = flase;
  }

  res.status(200).json({
    message: "historique of plans retrieved successfully",
    isSubscribed,
    activePlan,
  });
});
