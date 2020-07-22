const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = require("../constants").JWT_SECRET;

const parseToken = async (req, res, next) => {
  const token = req.headers.token;

  try {
    const tokenData = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(tokenData.userId);

    if (user) {
      req.user = user;
    }
  } catch (error) {
    req.user = null;
  }
  next();
};

const requiresUser = (req, res, next) => {
  const user = req.user;

  if (user) {
    return next();
  }

  res.status(403).json({ message: "Unauthorized" });
};

module.exports = { parseToken, requiresUser };
