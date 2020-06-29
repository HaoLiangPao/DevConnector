const AsyncHandler = require("../middlewares/AsyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/User");

const { validationResult } = require("express-validator");

// @route        POST /api/v1/users
// @desc         Register a user
// @access       Public
exports.register = AsyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  res.send("User route");
});
