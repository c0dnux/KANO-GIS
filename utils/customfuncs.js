const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

exports.signTokenHandler = async (statusCode, message, res, user) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const User = require("./../models/userModel");
  await User.findByIdAndUpdate(user._id, {
    refreshToken,
    refreshTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  const refreshCookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/api/v1/users/refresh-token",
  };

  res.cookie("jwt", token, cookieOptions);
  res.cookie("jwt_refresh", refreshToken, refreshCookieOptions);
  res.setHeader("Access-Control-Allow-Credentials", true);
  user.password = undefined;
  return res.status(statusCode).json({
    status: "Success",
    token,
    message: message,
    data: { user },
  });
};
