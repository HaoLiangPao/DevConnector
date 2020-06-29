const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const AsyncHandler = require("../middlewares/AsyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/User");

const { validationResult } = require("express-validator");

// @route        POST /api/v1/users
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
  let user = await User.findOne({ email });
  if (user) {
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
  user = new User({
    name,
    email,
    avatar,
    password,
  });
  // 4. Encrypt password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  // 5. Return jsonwebtoken
  res.status(201).json({ success: true, data: user });
});
