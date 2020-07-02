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
  addEducation,
  deleteEducation,
  getGithub,
} = require("../controllers/profile");
const { protect } = require("../middlewares/auth");
const { check } = require("express-validator");

// Define routes
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

router.get("/me", protect, getProfile);
router.route("/user/:user_id").get(getUserProfile);

// Adding and deleting experience section
router
  .route("/experience")
  .post(
    [
      protect,
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required"),
      check("from", "From date is required"),
    ],
    addExperience
  );
router.route("/experience/:exp_id").delete(protect, deleteExperience);
// Adding and deleting education section
router.route("/education").post(
  [
    protect,
    check("school", "School is required").not().isEmpty(),
    check("degree", "Degree is required").not().isEmpty(),
    check("fieldofstudy", "Field of study is required").not().isEmpty(),
    check("from", "From date is required and needs to be from the past")
      .not()
      .isEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
  ],
  addEducation
);
router.route("/education/:edu_id").delete(protect, deleteEducation);

// Get github profile
router.route("/github/:username").get(getGithub);

module.exports = router;
