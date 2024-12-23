const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail = require("../utils/emailService");

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// Register user
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate email, password, and name
  if (!email || !password || !name) {
    return next(new AppError("Please provide all required fields", 400));
  }

  // Check if the user already exists
  let user = await User.findOne({ email });

  if (user && user.emailVerified) {
    return next(new AppError("Email already exists", 400));
  }

  // Generate OTP and save the user or update
  let otp;
  if (user) {
    // User exists, generate OTP
    otp = user.generateOtp();
  } else {
    // Create new user and generate OTP
    user = await User.create({ name, email, password });
    otp = user.generateOtp();
  }

  try {
    // Save the user if OTP is generated
    await user.save();

    // Send OTP email
    const letter = `<p>Your OTP to RESET your password is ${otp}</p>`;
    await sendEmail(email, "Your OTP", letter);

    // Respond with success message
    res
      .status(200)
      .json({ message: `Your RESET password OTP sent to ${email}` });
  } catch (err) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("Failed to send OTP", err);
    return next(new AppError("Failed to send OTP", 500));
  }
});

// Verify Email
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { otp, email } = req.body;

  // Validate input
  if (!otp || !email) {
    return next(new AppError("Please provide both OTP and email", 400));
  }

  try {
    // Find the user with the matching email and valid OTP
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() }, // OTP is still valid
    });

    if (!user) {
      return next(new AppError("Invalid OTP or OTP expired", 400));
    }

    // Mark the user's email as verified and clear OTP details
    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Save the updated user document
    await user.save();

    // Generate a JWT token for the verified user
    const token = generateToken(user);

    // Respond with success message and token
    user.password = undefined;
    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
      token,
      user,
    });
  } catch (error) {
    // Catch and handle unexpected errors
    return next(
      new AppError("An error occurred while verifying the email", 500)
    );
  }
});

// Login user
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!user.emailVerified) {
    return next(new AppError("Please verify your email to get access", 401));
  }

  // Generate and send JWT token
  const token = generateToken(user);

  // Implemented in the front end
  // res.cookie("jwt", token, {
  //   httpOnly: true, // Prevent client-side access
  //   secure: true, // Required for HTTPS
  //   sameSite: "None",
  // });

  user.password = undefined;
  res.json({
    status: "success",
    message: "Logged in successfuly!",
    token,
    data: { user },
  });
});

// isAuthenticated
exports.isAuthenticated = asyncHandler(async (req, res, next) => {
  // 1) Getting Token And Check If It's There
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError("Your are not logged in! Please login to get access", 401)
    );
  // 2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check If User Still Exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("the user belonging to this token does no longer exist")
    );
  }

  currentUser.password = undefined;
  // GRANT ACCESS TO PROTECTED ROUTE
  res.status(200).json({
    status: "success",
    message: "You are authenticated!",
    data: { user: currentUser },
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("There is no user with that email", 404));
  }

  const otp = user.generateOtp();

  try {
    // Save the user if OTP is generated
    await user.save();

    // Send OTP email
    const letter = `<p>Your OTP is ${otp}</p>`;
    await sendEmail(email, "Your OTP", letter);

    // Respond with success message
    res.status(200).json({ message: `OTP sent to ${email}` });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(400).json({
      status: "error",
      err,
    });
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;
  if (!email || !password || !passwordConfirm) {
    return next(new AppError("All fields are required", 400));
  }
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return next(new AppError("User not found with the email provided", 400));
  }
  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }
  user.password = password;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  res.status(200).json({ message: "Password reset successful" });
});
