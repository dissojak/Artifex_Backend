const express = require("express");
const UC = require("../controller/UserController");
const { check } = require("express-validator");
const router = express.Router();

router.post(
  "/signupUser",
  [
    check("username").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("pw").isLength({ min: 3 }),
  ],
  UC.signupUser
);

module.exports = router;
