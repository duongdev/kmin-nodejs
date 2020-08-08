const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { requiresUser } = require("../middlewares/auth");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const { JWT_SECRET, SALT_ROUNDS } = require("../constants");

// https://expressjs.com/en/api.html#express.router
const router = express.Router({ mergeParams: true });

router.post("/", (req, res) => {
  // body-parser
  const { email, password, displayName } = req.body;

  User.create({ email, password, displayName })
    .then((user) => {
      return user;
    })
    .then((user) => {
      return bcrypt.hash(password, SALT_ROUNDS).then((hash) => {
        user.password = hash;
        return user.save();
      });
    })
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.send(error);
    });
});

router.post("/sign-in", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).then((user) => {
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token });
      } else {
        res.status(401).json({ message: "Wrong password" });
      }
    });
  });
});

router.post(
  "/me/avatar",
  requiresUser,
  upload.single("avatar"),
  async (req, res) => {
    const user = req.user;
    user.avatar = req.file.filename;
    await user.save();
    res.json(user);
  }
);

router.get("/me", requiresUser, async (req, res) => {
  const user = req.user;
  res.json(user);
});

module.exports = router;
