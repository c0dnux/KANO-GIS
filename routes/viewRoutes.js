const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

router.post("/activateAccount/:token", authController.activateAccount);
router.get("/HOME", authController.isLoggedIn, viewController.home);
router.get("/map", viewController.mapView);
router.get("/login", viewController.login);
module.exports = router;
