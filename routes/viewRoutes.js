const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

router.post("/activateAccount/:token", authController.activateAccount);

module.exports = router;
