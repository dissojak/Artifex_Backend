const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Order = require("../models/order");
const User = require("../models/user");
const OrderNotification = require("../models/orderNotification");
const mongoose = require("mongoose");

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

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
    });
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

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    return next(
      new HttpError("Failed to retrieve orders for this artist", 500)
    );
  }
});

const generateOrderId = async () => {
  let orderId;
  do {
    orderId = Math.floor(10000 + Math.random() * 90000).toString();
  } while (await Order.exists({ orderId }));

  return orderId;
};

// @desc    make a new order by client to an artist
// @route   POST /api/order/newOrder
// @access  Private
exports.makeOrder = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Inputs, check your data", 422));
  }
  const { artistId, description, serviceType } = req.body;
  const clientId = req.user._id;

  const orderId = await generateOrderId();
  const date = new Date();

  const order = new Order({
    orderId,
    date,
    serviceType,
    clientId,
    artistId,
    description,
  });

  const notification = new OrderNotification({
    recipientId: artistId,
    senderId: clientId,
    action: "create",
    orderId: order._id,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await order.save({ session });
    await notification.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (e) {
    return next(
      new HttpError("Couldn't add the new order and save notification", 500)
    );
  }

  const client = await User.findById(clientId);
  if (!client) {
    return next(new HttpError("Couldn't find this client", 422));
  }
  const orderNotificationDetails = {
    orderId,
    username: client.username,
    profileImage: client.profileImage,
    serviceType,
    date,
  };
  console.log(orderNotificationDetails);

  // try {
  //   io.to(artistId).emit("newOrder", { orderNotificationDetails });
  //   console.log("Real-time notification sent to artist");
  // } catch (err) {
  //   return next(new HttpError("Couldn't send the real-time notification", 500));
  // }

  io.to(artistId).emit("newOrder", { orderNotificationDetails });
  console.log("Real-time notification sent to artist");

  res.status(201).json({
    message: "Order created successfully",
    order,
  });
});

exports.acceptOrder;

exports.declineOrder;

exports.submitOrder;
