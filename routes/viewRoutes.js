const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const { viewCacheMiddleware } = require("../utils/cache");

router.post("/activateAccount/:token", authController.activateAccount);
router.get(
  "/",
  authController.isLoggedIn,
  viewCacheMiddleware("home", 300, { perUser: true }),
  viewController.home,
);
router.get(
  "/map",
  authController.isLoggedIn,
  viewCacheMiddleware("map", 300, { perUser: true }),
  viewController.mapView,
);
router.get("/login", viewController.login);
router.get("/signup", viewController.signup);
router.get("/reset-password", viewController.resetPassword);
router.get("/reset-password/:token", viewController.resetPassword);
router.get("/forgot-password", viewController.forgotPassword);
router.get("/report-crime", authController.protect, viewController.reportCrime);
router.get(
  "/notifications",
  authController.protect,
  authController.restrictTo("responder"),
  viewController.notifications,
);
router.get(
  "/all-crimes",
  authController.protect,
  authController.restrictTo("admin"),
  viewCacheMiddleware("all-crimes", 180),
  viewController.allCrimes,
);
router.get(
  "/crime/:id",
  authController.protect,
  viewController.viewUpdateCrime,
);
router.get("/settings", authController.protect, viewController.settings);
router.get(
  "/dashboard",
  authController.protect,
  viewCacheMiddleware("dashboard", 120, { perUser: true }),
  viewController.dashboard,
);
router.get(
  "/analytics",
  authController.protect,
  authController.restrictTo("admin"),
  viewCacheMiddleware("analytics", 180),
  viewController.analytics,
);
router.get(
  "/users",
  authController.protect,
  authController.restrictTo("admin"),
  viewController.users,
);
router.get(
  "/user/:id",
  authController.protect,
  authController.restrictTo("admin"),
  viewCacheMiddleware("user-details", 180),
  viewController.userDetails,
);
//-------ACTIVATE ACCOUNT ------/////
router.get("/login/:token", viewController.login);

router.post("/contact", viewController.submitContact);

module.exports = router;
