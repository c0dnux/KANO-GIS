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
router.get(
  "/all-crimes",
  authController.protect,
  authController.restrictTo("admin"),
  viewController.allCrimes
);
router.get(
  "/crime/:id",
  authController.protect,
  viewController.viewUpdateCrime
);
router.get("/settings", authController.protect, viewController.settings);
router.get("/dashboard", authController.protect, viewController.dashborad);
router.get(
  "/analytics",
  authController.protect,
  authController.restrictTo("admin"),
  viewController.analytics
);
//-------ACTIVATE ACCOUNT ------/////
router.get("/login/:token", viewController.login);

module.exports = router;
