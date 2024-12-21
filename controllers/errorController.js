const globalErrorHandling = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV == "development") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV == "production") {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // LOG error
      console.error(err);
      // Send generic message
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
};

module.exports = globalErrorHandling;
