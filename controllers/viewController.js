const catchAsync = require("../utils/catchAsync");
const Crime = require("../models/crimeModel");
const crypto = require("crypto");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.home = catchAsync(async (req, res, next) => {
  const queryFilter = { crimeAuth: "Verified" };
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

  const data = {
    totalCrimes,
    totalVictims,
    updatedBreakdown,
    updatedOverview,
  };
  res.status(200).render("index", data);
});
exports.mapView = catchAsync(async (req, res, next) => {
  const crimedata = await Crime.find({ crimeAuth: "Verified" });
  res.status(200).render("map", { crimes: crimedata });
});
exports.login = catchAsync(async (req, res, next) => {
  const token = req.params.token;

  if (token) {
    const hashToken = crypto
      .createHash("sha256")
      .update(String(token))
      .digest("hex");
    const user = await User.findOne({
      confirmToken: hashToken,
      confirmTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new AppError("Token is invalid or expired", 400));
    }
    user.confirmToken = undefined;
    user.confirmTokenExpires = undefined;
    user.active = true;
    await user.save({ validateBeforeSave: false });
  }
  res
    .status(200)
    .render("login", { title: "Crime Repo - Sign In", page: "login" });
});
exports.signup = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .render("signup", { title: "Crime Repo - Sign Up", page: "signup" });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  res.status(200).render("reset-password", {
    title: "Crime Repo - Reset password",
    token,
    page: "login",
  });
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .render("forgot-password", { title: "Crime Repo - Forgot password" });
});
exports.reportCrime = catchAsync(async (req, res, next) => {
  res.status(200).render("report-crime", {
    title: "Crime Repo - Report a crime",
    page: "report",
  });
});
exports.allCrimes = catchAsync(async (req, res, next) => {
  const crimedata = await Crime.find();
  const formatted = crimedata.map((c) => ({
    id: c.reportId,
    description: c.description,
    status: c.status, // e.g. "Under Investigation", "Resolved"
    auth: c.crimeAuth, // from schema
    date: c.date ? c.date.toISOString().split("T")[0] : "",
    type: c.crimeType,
    location: `${c.location.address}, ${c.location.city}`,
  }));
  res.status(200).render("all-crimes", {
    page: "all-crimes",
    crimes: formatted,
    title: "Crime Repo - All Crimes",
  });
});
exports.viewUpdateCrime = catchAsync(async (req, res, next) => {
  const reportId = req.params.id;
  const crime = await Crime.findOne({ reportId: reportId });
  if (!crime) {
    return next(new AppError("Crime not available", 404));
  }

  if (crime.date && crime.createdAt) {
    const crimeDate = new Date(crime.date);
    const createdAtDate = new Date(crime.createdAt);
    const year = crimeDate.getFullYear();

    const month = String(crimeDate.getMonth() + 1).padStart(2, "0");
    const day = String(crimeDate.getDate()).padStart(2, "0");
    const hours = String(crimeDate.getHours()).padStart(2, "0");
    const minutes = String(crimeDate.getMinutes()).padStart(2, "0");

    // Construct the string required by <input type="datetime-local">
    crime.formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    crime.formattedCreatedAt = createdAtDate.toLocaleString("en-US", options);
  }

  res.status(200).render("view-update-crime", {
    title: "Crime Repo - Update Crime Report",
    page: "update",
    crime,
  });
});

exports.settings = catchAsync(async (req, res, next) => {
  res.status(200).render("settings", {
    title: "Crime Repo - Settings",
    page: "settings",
  });
});
exports.dashborad = catchAsync(async (req, res, next) => {
  // 1. Find all reports submitted by the current user
  const allReports = await Crime.find({ reportedBy: req.user.id });

  // 2. Calculate statistics
  const total = allReports.length;
  const verified = allReports.filter(
    (report) => report.crimeAuth === "Verified"
  ).length;
  const pending = allReports.filter(
    (report) => report.crimeAuth === "Pending"
  ).length;

  const stats = {
    total,
    verified,
    pending,
  };

  // 3. Format the reports for the template
  const reports = allReports.map((report) => {
    // Check for a valid date
    const dateReported = report.createdAt
      ? new Date(report.createdAt)
      : null;

    return {
      id: report.reportId, // Mongoose virtual 'id'
      type: report.crimeType, // Assuming field name is 'crimeType'
      // Only format the date if it's valid, otherwise provide a fallback
      date:
        dateReported && !isNaN(dateReported)
          ? new Date(dateReported).toLocaleDateString("en-GB")
          : "N/A", // Formats to YYYY-MM-DD or shows N/A
      status: report.crimeAuth,
    };
  });

  // 4. Render the dashboard with all the necessary data
  res.status(200).render("dashboard", {
    title: "Crime Repo - Dashboard",
    page: "dashboard",
    user: req.user, // Pass the whole user object
    stats: stats,
    reports: reports,
  });
});
