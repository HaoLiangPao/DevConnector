const AsyncHandler = require("../middlewares/AsyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const Post = require("../models/Post");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// @route        GET /api/v1/posts
// @desc         Test route
// @access       Public
exports.getPosts = AsyncHandler(async (req, res, next) => {
  const posts = await Post.find().sort({ date: -1 });
  res.status(200).json({ success: true, count: posts.length, data: posts });
});
// @route        CREATE /api/v1/posts
// @desc         Create a post
// @access       Private
exports.createPost = AsyncHandler(async (req, res, next) => {
  // Check validator error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  // Get user name and avatar
  const user = await User.findById(req.user.id);
  const newPost = new Post({
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id,
  });
  const post = await newPost.save();

  res.status(200).json({ success: true, data: post });
});
// @route        UPDATE /api/v1/posts/:id
// @desc         Update a post
// @access       Private
exports.updatePost = AsyncHandler(async (req, res, next) => {
  // Check validator error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  // Get user name and avatar
  const user = await User.findById(req.user.id);
  const newPost = new Post({
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id,
  });
  const post = await newPost.save();

  res.status(200).json({ success: true, data: post });
});
// @route        DELETE /api/v1/posts/:id
// @desc         Delete a post
// @access       Private
exports.deletePost = AsyncHandler(async (req, res, next) => {
  // Check if the id input is valid
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(
      new ErrorResponse(`No post found with id of ${req.params.id}`, 404)
    );
  }

  // Authorization check
  if (post.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User with id of ${req.user.id} is not authorized`, 401)
    );
  }

  // Update the database
  await post.remove();

  res.status(200).json({ success: true, data: {} });
});
