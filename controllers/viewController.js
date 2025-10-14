const catchAsync = require("../utils/catchAsync");
const Crime = require("../models/crimeModel");

exports.home = catchAsync(async (req, res, next) => {
  const queryFilter = { crimeAuth: "verified" };
  // Counts every crime report document.
  const totalCrimes = await Crime.countDocuments(queryFilter);
  const victimsData = await Crime.aggregate([
    { $match: queryFilter },
    {
      $group: {
        _id: null,
        totalVictims: { $sum: "$victims" },
      },
    },
  ]);

  // The result is an array, so you need to access the first element.
  const totalVictims = victimsData.length > 0 ? victimsData[0].totalVictims : 0;
  const crimeBreakdown = await Crime.aggregate([
    { $match: queryFilter },
    {
      $group: {
        _id: "$crimeType",
        count: { $sum: 1 },
      },
    },
  ]);
  const colorMap = {
    Theft: "bg-blue-500",
    Assault: "bg-orange-500",
    Fraud: "bg-yellow-500",
    Murder: "bg-red-600",
    Kidnapping: "bg-indigo-600",
    Vandalism: "bg-purple-500",
    Other: "bg-slate-400",
  };
  const updatedBreakdown = crimeBreakdown.map((c) => ({
    ...c,
    percentage: ((c.count / totalCrimes) * 100).toFixed(2),
    color: colorMap[c._id] || "bg-slate-400",
  }));
  const statusOverview = await Crime.aggregate([
    { $match: queryFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  const statusColorMap = {
    "Under Investigation": "bg-yellow-500",
    Resolved: "bg-green-500",
    Closed: "bg-gray-500",
    Unknown: "bg-indigo-500",
  };
  const updatedOverview = statusOverview.map((c) => ({
    ...c,
    percentage: ((c.count / totalCrimes) * 100).toFixed(2),
    color: statusColorMap[c._id] || "bg-slate-400",
  }));
  console.log(
    totalCrimes,
    victimsData,
    totalVictims,
    updatedBreakdown,
    statusOverview
  );
  const data = {
    totalCrimes,
    totalVictims,
    updatedBreakdown,
    updatedOverview,
  };
  res.status(200).render("index", data);
});
