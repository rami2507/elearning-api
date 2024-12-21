const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// Get all users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

// Get single user
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// delete User

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

exports.deleteUsers = asyncHandler(async (req, res) => {
  const users = await User.deleteMany();
  res.status(200).json({
    status: "success",
    message: "All users deleted successfully",
  });
});
