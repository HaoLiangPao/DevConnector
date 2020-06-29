const express = require("express");

const router = express.Router();

// Import controller actions
const {
  getProfile,
  createProfile,
  getProfiles,
} = require("../controllers/profile");
const { protect } = require("../middlewares/auth");
const { check } = require("express-validator");

// Define routes
router.get("/me", protect, getProfile);
router
  .route("/")
  .post(
    [
      protect,
      check("status", "Status are required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
    createProfile
  )
  .get(getProfiles);

module.exports = router;
