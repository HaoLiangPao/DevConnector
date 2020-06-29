const AsycnHandler = require("../middlewares/AsyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const Profile = require("../models/Profile");
const normalize = require("normalize-url");

const { validationResult } = require("express-validator");

// @route        GET /api/v1/profile/me
// @desc         Get current user profile
// @access       Private
exports.getProfile = AsycnHandler(async (req, res, next) => {
  // Set default empty profile
  let profile = {};
  // Get the profile from db
  const exist = await Profile.findOne({ user: req.user.id });
  // Populate user information when profile exists
  if (exist) {
    profile = await exist.populate("User", ["name", "avatar"]);
  }
  res.status(200).json({ success: true, data: profile });
});
// @route        POST /api/v1/profile/
// @desc         Create or Update a user profile
// @access       Private
exports.createProfile = AsycnHandler(async (req, res, next) => {
  // Check results of express-validators
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Get input parameters
  const {
    company,
    location,
    website,
    bio,
    skills,
    status,
    githubusername,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook,
  } = req.body;
  // Create a local profile object to add
  const profileFields = {
    user: req.user.id,
    company,
    location,
    website:
      website && website !== "" ? normalize(website, { forceHttps: true }) : "",
    bio,
    skills: Array.isArray(skills)
      ? skills
      : skills.split(",").map((skill) => " " + skill.trim()),
    status,
    githubusername,
  };

  // Build social object and add to profileFields
  const socialfields = { youtube, twitter, instagram, linkedin, facebook };

  for (const [key, value] of Object.entries(socialfields)) {
    if (value && value.length > 0)
      socialfields[key] = normalize(value, { forceHttps: true });
  }
  profileFields.social = socialfields;

  // Using upsert option (creates new doc if no match is found):
  let profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { $set: profileFields },
    { new: true, upsert: true }
  );
  res.status(200).json({ success: true, data: profile });
});
