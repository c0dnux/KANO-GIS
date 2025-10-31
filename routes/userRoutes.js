const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// const userController = require("../controllers/userController");

router.post("/signup", authController.signup);
router.post("/login", authController.signin);
router.post("/logout", authController.logout);
router.post("/forgetPassword", authController.forgetPassword);
router.post("/resetPassword", authController.resetPassword);
router.post("/updatePassword", authController.protect, authController.updatePassword);

module.exports = router;
