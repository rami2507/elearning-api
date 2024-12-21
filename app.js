const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const globalErrorHandling = require("./controllers/errorController");
const cors = require("cors");

const app = express();

// cors
const allowedOrigins = [
  "http://localhost:3000", // Development URL
  process.env.CLIENT_URL, // Production URL
];
app.use(cors({ credentials: true, origin: allowedOrigins }));

// Parsing Data
app.use(express.json());
app.use(cookieParser());

dotenv.config({ path: ".env" });

// Mounting Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

// Global Error Handling middleware
app.use(globalErrorHandling);

module.exports = app;
