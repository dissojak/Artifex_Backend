const express = require("express");
const FC = require("../controller/FollowController");
const MW = require("../middleware/authMiddleware");
const { check } = require("express-validator");
const router = express.Router();

router.get("/isFollowing",MW.protect,FC.isFollowing);

module.exports = router;
