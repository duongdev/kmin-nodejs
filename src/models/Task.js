const mongoose = require("mongoose");

// https://mongoosejs.com/docs/guide.html
const Task = mongoose.model("Task", {
  content: {
    type: String,
    required: true,
  },
  done: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
});

module.exports = Task;
