const AsycnHandler = require("../middlewares/AsyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const Profile = require("../models/Profile");
const User = require("../models/User");
const normalize = require("normalize-url");
const request = require("request");
const config = require("config");

const { validationResult } = require("express-validator");

// @route        GET /api/v1/profile/me
// @desc         Get current user profile
// @access       Private
exports.getProfile = AsycnHandler(async (req, res, next) => {
  // Get the profile from db, populate user information when profile exists
  let profile = await Profile.findOne({ user: req.user.id }).populate({
    path: "user",
    select: "name avatar",
  });
  // Send {} if no profile found, send a populated one if profile exists
  res.status(200).json({ success: true, data: profile ? profile : {} });
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
// @route        GET /api/v1/profile
// @desc         Get all profiles
// @access       Public
exports.getProfiles = AsycnHandler(async (req, res, next) => {
  // Get the profile from db, populate the user with name and avatar info
  let profiles = await Profile.find().populate({
    path: "user",
    select: "name avatar",
  });
  res
    .status(200)
    .json({ success: true, count: profiles.length, data: profiles });
});
// @route        GET /api/v1/profile/user/:user_id
// @desc         Get profile by user ID
// @access       Public
exports.getUserProfile = AsycnHandler(async (req, res, next) => {
  // Check if the userid is valid
  const user = await User.findById(req.params.user_id);
  if (!user) {
    return next(
      new ErrorResponse(`No user found with id of ${req.params.user_id}`, 404)
    );
  }
  // Get the profile from db, populate the user with name and avatar info
  let profile = await Profile.findOne({ user: req.params.user_id }).populate({
    path: "user",
    select: "name avatar",
  });
  // No error handlling, just send back an empty object
  res
    .status(200)
    .json({ success: true, data: profile === null ? {} : profile });
});
// @route        DELETE /api/v1/profile
// @desc         Delete profile and corresponding user and posts
// @access       Private
exports.deleteProfile = AsycnHandler(async (req, res, next) => {
  // Todo - remove users posts

  // Remove profile
  await Profile.findOneAndRemove({ user: req.user.id });
  // Remove user
  await User.findOneAndRemove({ _id: req.user.id });
  res.status(200).json({ success: true, data: {} });
});
// @route        PUT /api/v1/profile/experience
// @desc         Add profile experience
// @access       Private
exports.addExperience = AsycnHandler(async (req, res, next) => {
  // Check validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // findone will return [...] for experience where findbyid return [object]
  let profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return next(
      new ErrorResponse(`Please add a profile before adding experience`, 404)
    );
  }
  const { title, company, location, from, to, current, description } = req.body;
  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description,
  };
  // Add the experience to the beginning of the experience attribute
  if (profile.experience !== undefined) {
    profile.experience.unshift(newExp);
    await profile.save();
  } else {
    profile = await Profile.findOneAndUpdate({ user: req.user.id }, newExp, {
      new: true,
      runValidators: true,
    });
  }
  res.status(200).json({ success: true, data: profile });
});
// @route        DELETE /api/v1/profile/experience/:exp_id
// @desc         Delete working experience of the logged in user
// @access       Private
exports.deleteExperience = AsycnHandler(async (req, res, next) => {
  // Todo - remove users posts
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return next(
      new ErrorResponse(
        `No experience found with id of ${req.params.exp_id}`,
        404
      )
    );
  }
  const removeIndex = profile.experience
    .map((exp) => exp.id)
    .indexOf(req.params.exp_id);
  // Check if the id exists
  if (removeIndex === -1) {
    return next(
      new ErrorResponse(`No experience found with id of ${req.params.exp_id}`)
    );
  }
  profile.experience.splice(removeIndex, 1);
  await profile.save();
  res.status(200).json({
    success: true,
    message: "Experience Deleted",
    remaining_count: profile.experience.length,
    remaining_experience: profile.experience,
  });
});
// @route        PUT /api/v1/profile/education
// @desc         Add profile education
// @access       Private
exports.addEducation = AsycnHandler(async (req, res, next) => {
  // Check validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // @TO-DO: Find the difference between findOne() and find()
  let profileFind = await Profile.findOne({ user: req.user.id });
  let profileFindOne = await Profile.find({ user: req.user.id });

  let profile = await Profile.findOne({ user: req.user.id }); // findone will return [] for experi
  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  } = req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  };
  // Add the experience to the beginning of the experience attribute
  if (profile.education !== undefined) {
    profile.education.unshift(newEdu);
    await profile.save();
  } else {
    profile = await Profile.findOneAndUpdate({ user: req.user.id }, newExp, {
      new: true,
      runValidators: true,
    });
  }
  res.status(200).json({ success: true, data: profile });
});
// @route        DELETE /api/v1/profile/education/:edu_id
// @desc         Delete working education of the logged in user
// @access       Private
exports.deleteEducation = AsycnHandler(async (req, res, next) => {
  // Todo - remove users posts
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    return next(
      new ErrorResponse(
        `No education found with id of ${req.params.edu_id}`,
        404
      )
    );
  }
  const removeIndex = profile.education
    .map((edu) => edu.id)
    .indexOf(req.params.edu_id);
  // Check if the id exists
  if (removeIndex === -1) {
    return next(
      new ErrorResponse(`No education found with id of ${req.params.edu_id}`)
    );
  }
  profile.education.splice(removeIndex, 1);
  await profile.save();
  res.status(200).json({
    success: true,
    message: "education Deleted",
    remaining_count: profile.education.length,
    remaining_education: profile.education,
  });
});
// @route        GET /api/v1/profile/github/:username
// @desc         Get user repos from Github
// @access       Public
exports.getGithub = AsycnHandler(async (req, res, next) => {
  const options = {
    uri: `https://api.github.com/users/${
      req.params.username
    }/repos?per_page=5&sort=created:asc&client_id=${config.get(
      "githubClientID"
    )}&client_secret=${config.get("githubSecret")}`,
    method: "GET",
    headers: { "user-agent": "node.js" },
  };
  // External requests to github API
  request(options, (error, response, body) => {
    if (error) {
      return next(new ErrorResponse(error, 500));
    }
    if (response.statusCode !== 200) {
      return next(
        new ErrorResponse(
          `No Github profile found with username of ${req.params.username}`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: JSON.parse(body) });
  });
});
