const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const rateLimit = require("express-rate-limit");
const AppError = require("../utils/appError");
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 60 minutes
  limit: 5, // Limit each IP to 30 requests per `window` (here, per 60 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  handler: (req, res, next) => {
    // Custom response when the limit is exceeded
    return next(
      new AppError("Trial limit exceeded. Wait after 5 minutes.", 429)
    );
  },
});


router.post("/signup", authController.signup);
router.post("/login", limiter, authController.signin);
router.post("/logout", authController.logout);
router.post("/forgetPassword", authController.forgetPassword);
router.post("/resetPassword", authController.resetPassword);
router.post(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

module.exports = router;
