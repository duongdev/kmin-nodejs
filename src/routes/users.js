const express = require("express");
// const mongoose = require("mongoose");
const User = require("../models/User");
const tasksRoute = require("./tasks");

// https://expressjs.com/en/api.html#express.router
const router = express.Router({ mergeParams: true });

router.post("/", (req, res) => {
  // body-parser
  const { email, password, displayName } = req.body;

  User.create({ email, password, displayName })
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.send(error);
    });
});

router.post("/sign-in", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email, password }).then((user) => {
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    res.json(user);
  });
});

router.use("/:userId/tasks", tasksRoute);

module.exports = router;
