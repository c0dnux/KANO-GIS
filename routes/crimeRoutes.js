const express = require("express");
const crimeController = require("../controllers/crimesController");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/report", authController.protect, crimeController.reportCrime);
module.exports = router;
