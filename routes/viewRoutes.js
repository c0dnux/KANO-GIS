const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

router.post("/activateAccount/:token", authController.activateAccount);
router.get("/", authController.isLoggedIn, viewController.home);
router.get("/map", authController.isLoggedIn, viewController.mapView);
router.get("/login", viewController.login);
router.get("/signup", viewController.signup);
router.get("/reset-password", viewController.resetPassword);
router.get("/reset-password/:token", viewController.resetPassword);
router.get("/forgot-password", viewController.forgotPassword);
router.get("/report-crime", authController.protect, viewController.reportCrime);
router.get("/all-crimes", authController.protect, viewController.allCrimes);
//-------ACTIVATE ACCOUNT ------/////
router.get("/login/:token", viewController.login);

module.exports = router;
