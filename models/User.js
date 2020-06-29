const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const { JsonWebTokenError } = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.methods.getSignedToken = function () {
  const JWT_SECRET = config.get("JWT_SECRET");
  const JWT_EXPIRE = config.get("JWT_EXPIRE");
  // Sign the token with JWT secret
  return jwt.sign({ id: this._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

module.exports = mongoose.model("user", UserSchema);
