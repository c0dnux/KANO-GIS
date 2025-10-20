const express = require("express");
const crimeController = require("../controllers/crimesController");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/report", authController.protect, crimeController.reportCrime);
router.post("/allCrimes", authController.protect, crimeController.getAllCrimes);
router.patch(
  "/crime-update/:reportId",
  authController.protect,
  crimeController.updateCrime
);
router.post("/:reportId", authController.protect, crimeController.getCrime);
module.exports = router;
