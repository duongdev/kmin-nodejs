const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // https://www.npmjs.com/package/bcrypt
  password: {
    type: String,
    required: true,
    min: 8,
  },
  displayName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  avatar: {
    type: String,
  },
});

module.exports = User;
