// import Crime from "../models/crimeModel";
const Crime = require("../models/crimeModel");
const catchAsync = require("./../utils/catchAsync");
const axios = require("axios");
const AppError = require("../utils/appError");
const UpdateLog = require("../models/update_log_model");
const { set } = require("mongoose");
exports.reportCrime = catchAsync(async (req, res, next) => {
  console.log("BAckend", req.body);
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
  console.log(response.data);

  if (response.data.items.length === 0) {
    return next(new AppError("Unable to geocode the provided address.", 400));
  }
  const { lat, lng } = response.data.items[0].position;

  req.body.location.coordinates = {
    type: "Point",
    coordinates: [parseFloat(lng), parseFloat(lat)],
  };

  req.body.reportedBy = req.user.id;
  /*---------------CHECKING FOR DUPLICATE --------------------*/
  const incidentDate = new Date(req.body.date);
  const windowMinutes = 120;
  const minDate = new Date(incidentDate.getTime() - windowMinutes * 60 * 1000);
  const maxDate = new Date(incidentDate.getTime() + windowMinutes * 60 * 1000);

  // radius in meters, converted to radians for $centerSphere (meters / earthRadiusMeters)
  const radiusMeters = 100; // 100m
  const earthRadius = 6378137; // meters
  const radiusInRadians = radiusMeters / earthRadius;
  const maybeDuplicate = await Crime.findOne({
    crimeType: req.body.crimeType,
    date: { $gte: minDate, $lte: maxDate },
    "location.coordinates": {
      $geoWithin: {
        $centerSphere: [
          req.body.location.coordinates.coordinates,
          radiusInRadians,
        ],
      },
    },
  }).lean();

  if (maybeDuplicate) {
    return next(new AppError("Crime already reported.", 409));
  }
  /*---------------END OF DUPLICATE CHECK --------------------*/

  const newCrime = await Crime.create(req.body);

  res.status(201).json({
    status: "Success",
    message: "Crime reported successfully",
    data: newCrime,
  });
});
exports.getAllCrimes = catchAsync(async (req, res, next) => {
  const crimes = await Crime.find();
  res.status(200).json({
    status: "Success",
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
exports.updateCrime = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;

  // Get the old crime record first
  const oldCrime = await Crime.findOne({ reportId });
  if (!oldCrime) {
    return next(new AppError("No crime found with that ID", 404));
  }

  // Update the record
  const updatedCrime = await Crime.findOneAndUpdate(
    { reportId },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  // Determine which fields changed
  const updatedFields = Object.keys(req.body).filter(
    (key) => oldCrime[key] !== req.body[key]
  );

  // Log the update
  await UpdateLog.create({
    updateType: "CrimeReport",
    recordId: updatedCrime._id,
    updatedFields,
    updatedBy: req.user.id, // assuming you have authentication
  });

  res.status(200).json({
    status: "Success",
    message: "Crime updated successfully",
  });
});
