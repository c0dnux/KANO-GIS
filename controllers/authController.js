const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const { signTokenHandler } = require("./../utils/customfuncs");
const Email = require("./../utils/emailBrevo");
const AppError = require("./../utils/appError");

exports.signup = catchAsync(async (req, res, next) => {
  const allowed = ["name", "email", "password", "confirmPassword"];
  let gotten = {};
  allowed.forEach((elem) => {
    if (req.body[elem]) gotten[elem] = req.body[elem];
  });
  const existingUser = await User.findOne({ email: gotten.email });
  if (existingUser) {
    if (existingUser.active) {
      return next(
        new AppError("This email is already registered. Please log in.", 409)
      ); // 409 Conflict
    }
    const confirmToken = existingUser.confirmTokenGen();
    existingUser.name = gotten.name;
    existingUser.newPassword = gotten.password;
    existingUser.confirmPassword = gotten.confirmPassword;

    await existingUser.save();

    const url = `${req.protocol}://${req.get(
      "host"
    )}/activateAccount/${confirmToken}`;
    await new Email(existingUser, url).sendWelcome();
    return signTokenHandler(
      200,
      "Confirmation email resent. Please check your inbox.",
      res,
      existingUser
    );
  }

  const newUser = new User(gotten);
  const confirmToken = newUser.confirmTokenGen();
  await newUser.save();

  const url = `${req.protocol}://${req.get(
    "host"
  )}/activateAccount/${confirmToken}`;

  await new Email(newUser, url).sendWelcome();

  signTokenHandler(201, "Confirm email to activate account", res, newUser);
});
exports.activateAccount = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const hashToken = crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");
  const user = await User.findOne({
    confirmToken: hashToken,
    confirmTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.confirmToken = undefined;
  user.confirmTokenExpires = undefined;
  user.active = true;
  await user.save({ validateBeforeSave: false });

  // const token = signToken(user._id);
  // res.status(200).json({ status: "Success", token, data: user });
  signTokenHandler(200, "Account activated", res, user);
});
exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return next(new AppError("Provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password +active");
  if (!user) {
    return next(new AppError("Incorrect email or password.", 404));
  }

  if (!user.active) {
    return next(new AppError("This acount is deleted or not activated.", 401));
  }
  const isCorrect = await user.isCorrectPassword(password, user.password);

  if (!user || !isCorrect) {
    return next(new AppError("Incorrect username or password", 401));
  }
  // const token = signToken(user._id);
  // res.status(200).json({ status: "Success", token, data: user });
  signTokenHandler(200, "Logged in", res, user);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //Check if token exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("Please Login to get Access", 503));
  }
  ///Check if token is valid
  const jwtPomisified = promisify(jwt.verify);
  const decoded = await jwtPomisified(token, process.env.JWT_SECRET);
  ///Check if user exists
  const userExist = await User.findById(decoded.id);
  if (!userExist) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }
  //Check if user has changed password after Token was issued
  const passWordChanged = userExist.passwordChangedAfter(decoded.iat);

  if (passWordChanged) {
    return next(
      new AppError("User recently changed password, Login again", 401)
    );
  }
  //Give access
  req.user = userExist;
  res.locals.user = userExist;
  next();
});
//Only for rendered pages
//Dont put catchAsync here
exports.isLoggedIn = async (req, res, next) => {
  //Check if token exist
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      ///Check if token is valid
      const jwtPomisified = promisify(jwt.verify);
      const decoded = await jwtPomisified(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      ///Check if user exists
      const userExist = await User.findById(decoded.id);
      if (!userExist) {
        return next();
      }
      //Check if user has changed password after Token was issued
      const passWordChanged = userExist.passwordChangedAfter(decoded.iat);

      if (passWordChanged) {
        return next();
      }
      //Give access
      res.locals.user = userExist;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
//Dont put catchAsync here
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "Success" });
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not allowed to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("No user with the given email", 404));
  }
  const resetToken = user.confirmTokenGen();

  await user.save();
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({ status: "Success", message: "Token sent to email" });
  } catch (error) {
    user.confirmToken = undefined;
    user.confirmTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error resetting password", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;

  const hashToken = crypto
    .createHash("sha256")
    .update(String(resetToken))
    .digest("hex");

  const user = await User.findOne({
    confirmToken: hashToken,
    confirmTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Reset token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.confirmToken = undefined;
  user.confirmTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // const token = signToken(user._id);

  // res
  //   .status(200)
  //   .json({ status: "Success", message: "Updated your password", token });
  signTokenHandler(200, "Check Email", res, user);
});
// exports.updatePassword = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user.id).select("+password");
//   if (
//     !(await user.isCorrectPassword(req.body.passwordCurrent, user.password))
//   ) {
//     return next(new AppErr("Your current password is wrong", 401));
//   }

//   user.password = req.body.password;

//   await user.save();

//   const token = signToken(user._id);

//   res
//     .status(200)
//     .json({ status: "Success", message: "Password updated", token });
//   signTokenHandler(200, "Password updated", res, user);
// });

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (
    !(await user.isCorrectPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError("Your current password is wrong", 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  // const token = signToken(user._id);
  // res
  //   .status(200)
  //   .json({ status: "Success", message: "Password updated", token });
  signTokenHandler(200, "Password updated", res, user);
});
