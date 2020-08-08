const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
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
      avatar: {
        type: String,
      },
    },
    { timestamps: true }
  )
);

module.exports = User;
