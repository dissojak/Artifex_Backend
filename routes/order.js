const express = require("express");
const OC = require("../controller/OrderController");
const MW = require("../middleware/authMiddleware");
const { check } = require("express-validator");
const router = express.Router();

router.post(
  "/newOrder",
  [
    check("description")
      .isLength({ max: 50 })
      .withMessage("Description must be less than 50 characters"),
    check("serviceType")
      .isIn(["rapid", "normal"])
      .withMessage("Service type must be 'rapid' or 'normal'"),
  ],
  MW.protect,
    OC.makeOrder
);

module.exports = router;
