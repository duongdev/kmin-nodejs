// https://expressjs.com/en/guide/routing.html

const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

// https://expressjs.com/en/api.html#express.router
const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  let { page = "1", perPage = "10" } = req.query;
  page = +page;
  perPage = +perPage;

  let query = {};

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
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    res.status(400).json({ message: "TaskID is invalid" });
    return;
  }

  Task.findByIdAndRemove(taskId).then((removedTask) => {
    if (!removedTask) {
      res.status(404).json({ message: "TaskID not found" });
      return;
    }
    res.json(removedTask);
  });
});

router.put("/:taskId", (req, res) => {
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

  Task.findByIdAndUpdate(taskId, update, { new: true }).then((updatedTask) => {
    if (!updatedTask) {
      res.status(404).json({ message: "TaskID not found" });
      return;
    }
    res.json(updatedTask);
  });
});

router.post("/", (req, res) => {
  const { userId } = req.params;
  const { content } = req.body;

  Task.create({ content, userId }).then((createdTask) => {
    res.json(createdTask);
  });
});

module.exports = router;
