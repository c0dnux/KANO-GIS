const express = require("express");
const crimeController = require("../controllers/crimesController");
const router = express.Router();
const authController = require("../controllers/authController");
const rateLimit = require("express-rate-limit");
const { cacheMiddleware } = require("../utils/cache");

// Create a limiter
const apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hrs
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});
router.post("/report", authController.protect, crimeController.reportCrime);

router.patch(
  "/crime-update/:reportId",
  authController.protect,
  authController.restrictTo("responder", "admin"),
  crimeController.updateCrime,
);
router.post(
  "/:reportId",
  authController.protect,
  cacheMiddleware("crime", 300),
  crimeController.getCrime,
);
router.get(
  "/download-crime-report",
  authController.protect,
  authController.restrictTo("responder", "admin"),
  crimeController.downloadCrimeReport,
);
/// API Endpoint
router.get(
  "/allCrimes",
  apiLimiter,
  cacheMiddleware("crimes", 300),
  crimeController.getAllCrimes,
);
module.exports = router;
