const gravatar = require("gravatar");
const AsyncHandler = require("../middlewares/AsyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/User");

const { validationResult } = require("express-validator");
const AsycnHandler = require("../middlewares/AsyncHandler");

// @route        POST /api/v1/auth/register
// @desc         Register a user
// @access       Public
exports.register = AsyncHandler(async (req, res, next) => {
  // Check results of express-validators
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Get all input information
  const { name, email, password } = req.body;
  // 1. See if the user exists
  const exist = await User.findOne({ email });
  if (exist) {
    return next(
      new ErrorResponse(`User with email of (${email}) is already exists`, 400)
    );
  }
  // 2. Get user gravatar
  const avatar = gravatar.url(email, {
    s: "200", // default size
    r: "pg", // rating
    d: "mm", //default (could use 404)
  });
  // 3. Create a user instance
  let userToAdd = {
    name,
    email,
    avatar,
    password,
  };
  // 4. Encrypt password (It will be done automatically within User model before it get saved)
  const user = await User.create(userToAdd);
  // 5. Return jsonwebtoken
  SendTokenResponse(user, 201, res);
});

// @route        GET /api/v1/auth/me
// @desc         Get current logged in user
// @access       Private
exports.getMe = AsycnHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: req.user });
});

// @route        GET /api/v1/auth/login
// @desc         Login a user
// @access       Public
exports.login = AsycnHandler(async (req, res, next) => {
  // Check results of express-validators
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Get all input information
  const { email, password } = req.body;
  // 1. See if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new ErrorResponse(`User with email of ${email} is not registered`, 400)
    );
  }
  // 2. Authenticate the password and email
  if (!user.matchPassword(password)) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }
  // 3. Return jsonwebtoken
  SendTokenResponse(user, 200, res);
});

// --- Helper Function ---
// Generate JWT token and send it back within a response
const SendTokenResponse = async (user, statusCode, res) => {
  // Generate the jwt token according to the user instance
  const token = user.getSignedToken();
  // Sendback the token in the response
  res.status(statusCode).json({
    success: true,
    token,
  });
};
