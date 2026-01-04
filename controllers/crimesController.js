// import Crime from "../models/crimeModel";
const Crime = require("../models/crimeModel");
const catchAsync = require("./../utils/catchAsync");
const axios = require("axios");
const AppError = require("../utils/appError");
const UpdateLog = require("../models/update_log_model");
const ExcelJS = require("exceljs");
const { set } = require("mongoose");
exports.reportCrime = catchAsync(async (req, res, next) => {
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
  const windowMinutes = 120; // 2 hours
  const minDate = new Date(incidentDate.getTime() - windowMinutes * 60 * 1000);
  const maxDate = new Date(incidentDate.getTime() + windowMinutes * 60 * 1000);

  // radius in meters, converted to radians for $centerSphere (meters / earthRadiusMeters)
  const radiusMeters = 100; // 100m
  const earthRadius = 6378137; // meters
  const radiusInRadians = radiusMeters / earthRadius;
  const maybeDuplicate = await Crime.findOne({
    crimeType: req.body.crimeType,
    date: { $gte: minDate, $lte: maxDate },
    victims: req.body.victims,
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

exports.downloadCrimeReport = catchAsync(async (req, res, next) => {
  const reports = await Crime.find().lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Crime Reports");

  // Columns structure
  sheet.columns = [
    { header: "S/N", key: "sn", width: 10 },
    { header: "Report ID", key: "reportId", width: 20 },
    { header: "Crime Type", key: "crimeType", width: 20 },
    { header: "Description", key: "description", width: 40 },
    { header: "Date", key: "date", width: 20 },
    { header: "Status", key: "status", width: 20 },
    { header: "Crime Auth", key: "crimeAuth", width: 20 },
    { header: "Address", key: "address", width: 30 },
    { header: "City", key: "city", width: 20 },
    { header: "LGA", key: "localGovernment", width: 20 },
    { header: "State", key: "state", width: 15 },
    { header: "Coordinates (lng, lat)", key: "coordinates", width: 25 },
    { header: "Victims", key: "victims", width: 10 },
    { header: "Created At", key: "createdAt", width: 20 },
    { header: "Updated At", key: "updatedAt", width: 20 },
  ];

  // Add rows
  reports.forEach((r, i) => {
    sheet.addRow({
      sn: i + 1,
      reportId: r.reportId,
      crimeType: r.crimeType,
      description: r.description,
      date: r.date ? r.date.toISOString().split("T")[0] : "",
      status: r.status,
      crimeAuth: r.crimeAuth,
      address: r.location?.address || "",
      city: r.location?.city || "",
      localGovernment: r.location?.localGovernment || "",
      state: r.location?.state || "",
      coordinates: r.location?.coordinates?.coordinates
        ? `${r.location.coordinates.coordinates[0]}, ${r.location.coordinates.coordinates[1]}`
        : "",
      victims: r.victims || 0,
      createdAt: r.createdAt ? r.createdAt.toISOString().split("T")[0] : "",
      updatedAt: r.updatedAt ? r.updatedAt.toISOString().split("T")[0] : "",
    });
  });

  // Style the header row
  const header = sheet.getRow(1);
  header.font = { bold: true };

  // Send to browser
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="crime_reports.xlsx"'
  );

  await workbook.xlsx.write(res);
  res.end();
});
