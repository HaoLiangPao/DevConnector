const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

// --- Middleware function ---
const { protect } = require("../middlewares/auth");

// Import controller actions
const { getMe, register, login } = require("../controllers/auth");

// Defin routes
router.get("/me", protect, getMe);
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  register
);
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password").exists(),
  ],
  login
);

module.exports = router;
