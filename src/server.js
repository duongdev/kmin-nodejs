const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const tasksRouter = require("./routes/tasks");
const usersRouter = require("./routes/users");
const filesRouter = require("./routes/files");
const { parseToken } = require("./middlewares/auth");

const app = express();

app.use(express.static(path.join(__dirname, "../web")));

// http://expressjs.com/en/resources/middleware/body-parser.html
app.use(bodyParser.json());

const config = {
  uri: "mongodb://localhost:27017/kmin-todo-list",
  serverPort: 4000,
};

app.use(parseToken);

/**
 * 1. Filter task by done: GET /tasks?done=true|false
 * 2. Remove a task by ID: DELETE /tasks/:taskId
 * 3. Edit: PUT /tasks/:taskId
 * 4. Pagination GET /tasks?page=1&perPage=10
 */
app.use("/tasks", tasksRouter);
app.use("/users", usersRouter);
app.use("/files", filesRouter);

app.use(function (err, req, res, next) {
  res.status(500).send({ message: err.message, status: 500 });
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
