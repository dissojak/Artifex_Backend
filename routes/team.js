const express = require("express");
const TC = require("../controller/TeamController");
const { check } = require("express-validator");
const router = express.Router();

router.post(
  "/createTeam",
  [
    check("name").not().isEmpty(),
    check("description").isLength({ min: 200, max: 600 }),
    check("creator").not().isEmpty(),
  ],
  TC.createTeam
);
router.post(
  "/addMemberToTeam/:tid",
  [check("email").normalizeEmail().isEmail()],
  TC.addMember
);
router.delete(
  "/kickUserFromTeam/:tid/:uid",
  [check("id_captain").not().isEmpty(),],
  TC.deleteMember
);
router.delete("/memberDeleteTeam/:tid", TC.deleteTeam);

router.get("/getTeams", TC.getTeams);

router.patch(
  "/team/settings/:tid",
  [
    check("name").not().isEmpty(),
    check("description").isLength({ min: 200, max: 600 }),
  ],
  TC.editTeam
);

router.delete('/BanTeam/:tid',TC.banTeam);

module.exports = router;
