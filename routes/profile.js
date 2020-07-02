const express = require("express");

const router = express.Router();

// Import controller actions
const {
  getProfile,
  createProfile,
  getProfiles,
  getUserProfile,
  deleteProfile,
  addExperience,
  deleteExperience,
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
  .get(getProfiles)
  .delete(protect, deleteProfile);

router.route("/user/:user_id").get(getUserProfile);

router
  .route("/experience")
  .put(
    [
      protect,
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required"),
      check("from", "From date is required"),
    ],
    addExperience
  );
router.route("/experience/:exp_id").delete(protect, deleteExperience);

module.exports = router;
