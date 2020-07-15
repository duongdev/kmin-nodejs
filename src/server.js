const express = require("express");
const mongoose = require("mongoose");
const Task = require("./models/Task");

const app = express();

const config = {
  uri: "mongodb://localhost:27017/kmin-todo-list",
  serverPort: 4000,
};

/**
 * 1. Filter task by done: GET /tasks?done=true|false
 * 2. Remove a task by ID: DELETE /tasks/:taskId
 * 3. Edit: PUT /tasks/:taskId
 * 4. Pagination GET /tasks?page=1&perPage=10
 */

app.get("/tasks", (req, res) => {
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
  
  Task.countDocuments(query).then((total) => {
    Task.find(query)
      .sort("-_id")
      .skip(perPage * (page - 1))
      .limit(perPage)
      .then((tasks) => {
        res.json({
          total,
          page,
          perPage,
          ...query,
          tasks,
        });
      });
  });
});

app.delete("/tasks/:taskId", (req, res) => {
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

app.put("/tasks/:taskId", (req, res) => {
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

app.post("/tasks", (req, res) => {
  const content = req.query.content;

  Task.create({ content }).then((createdTask) => {
    res.json(createdTask);
  });
});

app.patch(`/tasks/:taskId`, (req, res) => {
  const taskId = req.params.taskId;
  const done = req.query.done === "true";

  if (!mongoose.isValidObjectId(taskId)) {
    res.status(400).json({ message: `TaskID is invalid`, taskId });
    return;
  }

  Task.findByIdAndUpdate(taskId, { $set: { done } }, { new: true }).then(
    (updatedTask) => {
      if (!updatedTask) {
        res.status(404).json({ message: `Task ID doesn't exist`, taskId });
        return;
      }
      res.json(updatedTask);
    }
  );
});

mongoose
  .connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(config.serverPort, () => {
      console.log(`Web server is running on port ${config.serverPort}`);
    });
  });
