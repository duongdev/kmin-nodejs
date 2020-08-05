const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const router = express.Router({ mergeParams: true });

// /files/:filename
router.get(`/:fileName`, async (req, res) => {
  const { type, h, w, s } = req.query;

  const inputFile = fs.readFileSync(`uploads/${req.params.fileName}`);

  const height = +s || +h;
  const width = +s || +w;

  console.log({ height, width });

  const resizedFile = await sharp(inputFile).resize({ width, height }).toBuffer();

  res.contentType(type).send(resizedFile);
});

module.exports = router;
