const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// Register user
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate email and password
  if (!email || !password || !name) {
    return next(new AppError("Please provide all required fields", 400));
  }

  // Check if user already exists
  const user = await User.findOne({ email });
  if (user) {
    return next(new AppError("Email already exists", 400));
  }

  // Create new user
  const newUser = new User({ name, email, password });
  await newUser.save();

  newUser.password = undefined;

  // Generate and send JWT token
  const token = generateToken(newUser);
  res.status(201).json({
    status: "success",
    message: "User created successfuly!",
    token,
    data: { user: newUser },
  });
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

  // Generate and send JWT token
  const token = generateToken(user);

  res.cookie("jwt", token, {
    httpOnly: true,
  });

  user.password = undefined;
  res.json({
    status: "success",
    message: "Logged in successfuly!",
    token,
    data: { user },
  });
});
