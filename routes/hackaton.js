const express = require("express");
const HC = require("../controller/HackatonController");
const upload = require("../upload");
const { check } = require("express-validator");
const router = express.Router();

// router.post(
//     "/addHackaton",
//     upload.single('photo'),
//     [
//       check("title").not().isEmpty(),
//       check("organisateur").not().isEmpty(),
//       check("theme").not().isEmpty(),
//       check("email").isEmail(),
//       check("description").isLength({ min: 200 }),
//       check("StartingDate").isDate(),
//       check("EndingDate").isDate(),
//     ],
//     HC.addHackaton
//   );

  router.post(
    "/addHackaton",
    [
      check("title").not().isEmpty(),
      check("organisateur").not().isEmpty(),
      check("theme").not().isEmpty(),
      check("email").isEmail(),
      check("description").isLength({ min: 200 }),
      check("StartingDate").isDate(),
      check("EndingDate").isDate(),
    ],
    HC.addHackaton
  );
router.get("/getHackatons", HC.getHackatons);

router.get("/getHackatonById/:hid", HC.getHackatonById);

router.post("/inscritTeamToHackaton", HC.addParticipant);

router.delete("/removeTeamIscriptionFromHackaton", HC.removeParticipant);

router.patch("/editHackaton/:hid", HC.editHackaton);

router.delete("/deleteHackaton/:hid", HC.deleteHackaton);

module.exports = router;
