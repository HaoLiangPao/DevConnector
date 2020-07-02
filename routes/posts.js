const express = require("express");
const { check } = require("express-validator");
const { protect } = require("../middlewares/auth");

// Import controller methods
const { getPosts, createPost, deletePost } = require("../controllers/posts");

const router = express.Router();

// Define routes
router
  .route("/")
  .get(getPosts)
  .post(
    [protect, check("text", "Text is required").not().isEmpty()],
    createPost
  );

router.route("/:id").delete(protect, deletePost);

module.exports = router;
