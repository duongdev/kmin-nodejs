// https://expressjs.com/en/guide/routing.html

const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const { parseToken, requiresUser } = require("../middlewares/auth");

// https://expressjs.com/en/api.html#express.router
const router = express.Router({ mergeParams: true });

router.use(parseToken, requiresUser);

router.get("/", async (req, res) => {
  const userId = req.user._id;

  let { page = "1", perPage = "10" } = req.query;
  page = +page;
  perPage = +perPage;

  let query = {
    userId,
  };

  if (req.query.done === "true") {
    query.done = true;
    // query = { done: true }
  } else if (req.query.done === "false") {
    query.done = false;
    // query = { done: false }
  }

  const total = await Task.countDocuments(query);
  const tasks = await Task.find(query)
    .sort("-_id")
    .skip(perPage * (page - 1))
    .limit(perPage);

  res.json({
    total,
    page,
    perPage,
    ...query,
    tasks,
  });
});

router.delete("/:taskId", (req, res) => {
  const userId = req.user._id;
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    res.status(400).json({ message: "TaskID is invalid" });
    return;
  }

  Task.findOneAndRemove({ _id: taskId, userId }).then((removedTask) => {
    if (!removedTask) {
      res.status(404).json({ message: "TaskID not found" });
      return;
    }
    res.json(removedTask);
  });
});

router.put("/:taskId", (req, res) => {
  const userId = req.user._id;
  const { taskId } = req.params;
  const { content, done } = req.query;

  if (!mongoose.isValidObjectId(taskId)) {
    res.status(400).json({ message: "TaskID is invalid" });
    return;
  }

  let update = {};

  if (content) {
    update.content = content;
  }
  if (done === "true") {
    update.done = true;
  }
  if (done === "false") {
    update.done = false;
  }

  Task.findOneAndUpdate({ _id: taskId, userId }, update, { new: true }).then(
    (updatedTask) => {
      if (!updatedTask) {
        res.status(404).json({ message: "TaskID not found" });
        return;
      }
      res.json(updatedTask);
    }
  );
});

router.post("/", (req, res) => {
  const { content } = req.body;
  const user = req.user;

  Task.create({ content, userId: user._id }).then((createdTask) => {
    res.json(createdTask);
  });
});

module.exports = router;
