const express = require("express");
const MC = require("../controller/MuseumController");
const MW = require("../middleware/authMiddleware");
const { check } = require("express-validator");
const router = express.Router();

router.post(
  "/create",
  MW.protect,
  [
    check("title").trim().notEmpty().withMessage("Title is required"),
    check("description")
      .trim()
      .notEmpty()
      .isLength({ max: 50 })
      .withMessage(
        "Description is required and must be at most 50 characters long"
      ),
    check("numberMaxArtists")
      .isInt({ min: 5 })
      .withMessage("Invalid number of maximum artists"),
    check("numberMaxClients")
      .isInt({ min: 5 })
      .withMessage("Invalid number of maximum clients"),
    check("priceClient")
      .isNumeric()
      .withMessage("Price for clients must be numeric"),
    check("priceArtist")
      .isNumeric()
      .withMessage("Price for artists must be numeric"),
    check("dateStart").isISO8601().withMessage("Invalid start date"),
    check("dateEnd").isISO8601().withMessage("Invalid end date"),
    check("isExclusive")
      .isBoolean()
      .withMessage("isExclusive must be a boolean"),
    check("idCategory").isMongoId().withMessage("Invalid category ID"),
  ],
  MC.createMuseum
);

router.get("/museums", MW.protect, MC.getMuseums);

router.get("/participantArtists", MW.protect, MC.getParticipantArtists);

router.get("/participantClients", MW.protect, MC.getParticipantClients);

router.post("/artistJoin", MW.protect, MC.artistJoin);

router.post("/clientJoin", MW.protect, MC.clientJoin);


module.exports = router;
