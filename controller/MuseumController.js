const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const Museum = require("../models/museum");
const Participant = require("../models/participant");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.createMuseum = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    numberMaxArtists,
    numberMaxClients,
    priceClient,
    priceArtist,
    dateStart,
    dateEnd,
    isExclusive,
    idCategory,
  } = req.body;

  const museum = new Museum({
    title,
    description,
    numberMaxArtists,
    numberMaxClients,
    priceClient,
    priceArtist,
    dateStart,
    dateEnd,
    isExclusive,
    idCategory,
  });
  try {
    await museum.save();
  } catch (error) {
    return next(new HttpError("Failed to create museum", 500));
  }
  res.status(201).json({
    message: "Museum created successfully",
    museum,
  });
});

exports.getMuseums = asyncHandler(async (req, res, next) => {
  const museums = await Museum.find();

  if (!museums || museums.length === 0) {
    return next(new HttpError("No museums found", 404));
  }

  res.status(200).json({
    message: "Museums retrieved successfully",
    museums,
  });
});

exports.getParticipantArtists = asyncHandler(async (req, res, next) => {
  const museumId = req.body.museumId;

  const participantArtists = await Participant.find({
    museumId,
    participantType: "artist",
  }).populate("participantId");

  if (!participantArtists || participantArtists.length === 0) {
    return res.status(404).json({
      note: "vide",
      message: "No participant artists found for this museum",
    });
  }

  res.status(200).json({
    message: "Participant artists retrieved successfully",
    participantArtists,
  });
});

exports.getParticipantClients = asyncHandler(async (req, res, next) => {
  const museumId = req.body.museumId;

  const participantArtists = await Participant.find({
    museumId,
    participantType: "client",
  }).populate("participantId");

  if (!participantArtists || participantArtists.length === 0) {
    return res.status(404).json({
      note: "vide",
      message: "No participant clients found for this museum",
    });
  }

  res.status(200).json({
    message: "Participant clients retrieved successfully",
    participantArtists,
  });
});

exports.artistJoin = asyncHandler(async (req, res, next) => {
  const { museumId } = req.body;
  const artistId = req.user._id;

  const existingParticipant = await Participant.findOne({
    museumId,
    participantId: artistId,
  });

  if (existingParticipant) {
    return next(
      new HttpError("Artist is already a participant in this museum", 400)
    );
  }

  const participant = new Participant({
    museumId,
    participantId: artistId,
    participantType: "artist",
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await participant.save({ session });
    await Museum.findByIdAndUpdate(
      museumId,
      { $inc: { artistsEntered: 1 } },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    return next(new HttpError("Failed to join the museum as an artist", 500));
  }

  res.status(201).json({
    message: "Artist successfully joined the museum",
  });
});

exports.clientJoin;

exports.editMuseum;

exports.addArtwork;
