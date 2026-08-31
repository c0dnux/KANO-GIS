const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const AppError = require("../utils/appError");

const slidingWindow = require("../utils/slidingWindow");

const loginLimiter = slidingWindow({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Try again in 5 minutes.",
});

const globalLimiter = slidingWindow({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Try again in 15 minutes.",
});

router.post("/signup", globalLimiter, authController.signup);
router.post("/login", loginLimiter, authController.signin);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgetPassword", loginLimiter, authController.forgetPassword);
router.post("/resetPassword", authController.resetPassword);
router.post(
  "/updatePassword",
  authController.protect,
  authController.updatePassword,
);
router.post(
  "/suspend/:id",
  authController.protect,
  authController.restrictTo("admin"),
  authController.suspendAccount,
);
router.post(
  "/block/:id",
  authController.protect,
  authController.restrictTo("admin"),
  authController.blockAccount,
);
router.post(
  "/create_user",
  authController.protect,
  authController.restrictTo("admin"),
  authController.createUser,
);
module.exports = router;
