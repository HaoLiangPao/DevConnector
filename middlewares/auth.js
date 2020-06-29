const jwt = require("jsonwebtoken");
const config = require("config");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/User");
const AsycnHandler = require("../middlewares/AsyncHandler");

exports.protect = AsycnHandler(async (req, res, next) => {
  // Check authorization token send within the header
  const token = req.header("x-auth-token");
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
  try {
    // Verify the token
    const payload = jwt.verify(token, config.get("JWT_SECRET"));
    const user = await User.findById(payload.id);
    if (!user) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});
