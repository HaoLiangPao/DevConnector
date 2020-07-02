const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to the console for dev
  console.log(err.stack.red);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const { keyValue } = error;
    const message = `Duplicate filed values entered, please check the value: ${Object.values(
      err.keyValue
    )}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(
      (field) => ` ${field.message}`
    );
    error = new ErrorResponse(message, 400);
  }

  // Pass the status and error message through res
  res.status(error.statusCode || 500).json({
    success: false,
    errors: [{ msg: error.message }] || "Server Error",
  });
};

module.exports = errorHandler;
