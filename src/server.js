const express = require("express");
const mongoose = require("mongoose");
const Task = require("./models/Task");

const app = express();

const config = {
  uri: "mongodb://localhost:27017/kmin-todo-list",
  serverPort: 4000,
};

app.get("/tasks", (req, res) => {
  Task.find()
    .sort("-_id")
    // or
    // .sort({ _id: -1 })
    .then((tasks) => {
      res.json(tasks);
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
