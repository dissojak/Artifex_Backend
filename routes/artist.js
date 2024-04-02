const express = require("express");
const AC = require("../controller/ArtistController");
const MW = require("../middleware/authMiddleware");
const { check } = require("express-validator");
const router = express.Router();

router.put("/openOrder",MW.protect,AC.openOrder);

module.exports = router;
