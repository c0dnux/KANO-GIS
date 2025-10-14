// import Crime from "../models/crimeModel";
const Crime = require("../models/crimeModel");
const catchAsync = require("./../utils/catchAsync");
const axios = require("axios");
const AppError = require("../utils/appError");
const { set } = require("mongoose");
exports.reportCrime = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const address = `${req.body.location.address} ${req.body.location.city} ${req.body.location.localGovernment}, ${req.body.location.state}, Nigeria`;

  const response = await axios.get(
    "https://geocode.search.hereapi.com/v1/geocode",
    {
      params: {
        q: address,
        apiKey: process.env.HERE_GEOCODE_API_KEY,
      },
    }
  );
  console.log(response.data.items[0].position);
  if (response.data.items.length === 0) {
    return next(new AppError("Unable to geocode the provided address.", 400));
  }
  const { lat, lng } = response.data.items[0].position;

  req.body.location.coordinates = {
    type: "Point",
    coordinates: [parseFloat(lng), parseFloat(lat)], // [longitude, latitude]
  };

  req.body.reportedBy = req.user.id;
  const newCrime = await Crime.create(req.body);

  res.status(201).json({
    status: "success",
    data: newCrime,
  });
});
exports.getAllCrimes = catchAsync(async (req, res, next) => {
  const crimes = await Crime.find().populate("reportedBy", "name email");
  res.status(200).json({
    status: "success",
    results: crimes.length,
    data: crimes,
  });
});
exports.getCrime = catchAsync(async (req, res, next) => {
  const crime = await Crime.findOne({ reportId: req.params.reportId }).populate(
    "reportedBy",
    "name email"
  );
  if (!crime) {
    return next(new AppError("No crime found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: crime,
  });
});
exports.crimeAuth = catchAsync(async (req, res, next) => {
  const crime = await Crime.findOneAndUpdate(
    { reportId: req.params.reportId },
    { $set: { crimeAuth: req.body.crimeAuth } },
    { new: true, runValidators: true }
  );
  if (!crime) {
    return next(new AppError("No crime found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: crime,
  });
});
