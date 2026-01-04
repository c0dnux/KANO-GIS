const express = require("express");
const crimeController = require("../controllers/crimesController");
const router = express.Router();
const authController = require("../controllers/authController");
const rateLimit = require("express-rate-limit");

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
router.get("/allCrimes", apiLimiter, crimeController.getAllCrimes);
router.patch(
  "/crime-update/:reportId",
  authController.protect,
  authController.restrictTo("admin"),
  crimeController.updateCrime
);
router.post("/:reportId", authController.protect, crimeController.getCrime);
router.get(
  "/download-crime-report",
  authController.protect,
  authController.restrictTo("admin"),
  crimeController.downloadCrimeReport
);
module.exports = router;
