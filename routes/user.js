const express = require("express");
const UC = require("../controller/UserController");
const { check } = require("express-validator");
const router = express.Router();

router.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("username").not().isEmpty(),
    check("pw").isLength({ min: 3 }),
  ],
  UC.signupUser
);
router.post("/login", UC.loginUser);
router.patch(
  "/settings/password/:uid",
  [check("newPw").isLength({ min: 3 }),check("oldPw").isLength({ min:3})],
  UC.changePassword
);
router.patch(
  "/settings/username/:uid",
  [check("username").not().isEmpty()],
  UC.changeUsername
);
router.patch(
  "/settings/email/:uid",
  [check("email").normalizeEmail().isEmail()],
  UC.changeEmail
);
router.get("/getUsersByTeamId/:tid",UC.getUsersByTeamId);

router.get("/getTeamJoinedByUserId/:uid",UC.getTeamJoinedByUserId);

router.get("/getUserByUserId/:uid",UC.getUserById);

router.patch('/update-profile-image/:uid',UC.update_ProfileImage);

//superAdmin route
router.patch('/updateAllUsersToAdmin', UC.updateAllUsersToAdmin);

module.exports = router;
