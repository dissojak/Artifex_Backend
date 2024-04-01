const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("../middleware/async");
const Order = require("../models/order");

// @desc    Get orders for a specific client
// @route   GET /api/order/client
// @access  Private

exports.getClientOrders = asyncHandler(async (req, res, next) => {
  const clientId = req.user._id;

  try {
    const orders = await Order.find({ clientId }).populate("artistId");

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this client" });
    }

    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (err) {
    return next(
      new HttpError("Failed to retrieve orders for this client", 500)
    );
  }
});

// @desc    Get orders for a specific artist
// @route   GET /api/order/artist
// @access  Private

exports.getArtistOrders = asyncHandler(async (req, res, next) => {
  const artistId = req.user._id;

  try {
    const orders = await Order.find({ artistId }).populate("clientId");

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this artist" });
    }

    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    return next(
      new HttpError("Failed to retrieve orders for this artist", 500)
    );
  }
});

// @desc    Get a specific order placed by a client
// @route   GET /api/order/clientOrder
// @access  Private

exports.getOrderOfClinet = asyncHandler(async (req, res, next) => {
  const artistId = req.user._id;
  const clientId = req.body.clientId;

  try {
    const order = await Order.findOne({ artistId, clientId }).populate(
      "clientId",
      "username",
      "profileImage"
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found for this client" });
    }

    res.status(200).json({ message: "Order retrieved successfully", order });
  } catch (error) {
    return next(new HttpError("Failed to retrieve order for this client", 500));
  }
});

// @desc    Get a specific order placed by a client
// @route   GET /api/order/clientOrder
// @access  Private
exports.getOrderSubmitedByArtist = asyncHandler(async (req, res, next) => {
  const clientId = req.user._id;
  const artistId = req.body.artistId;

  try {
    const order = await Order.findOne({ artistId, clientId }).populate(
      "artistId",
      "username",
      "profileImage"
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found for this client" });
    }

    res.status(200).json({ message: "Order retrieved successfully", order });
  } catch (error) {
    return next(new HttpError("Failed to retrieve order for this client", 500));
  }
});

exports.makeOrder;

exports.openOrder;

exports.acceptOrder;

exports.declineOrder;

exports.submitOrder;
