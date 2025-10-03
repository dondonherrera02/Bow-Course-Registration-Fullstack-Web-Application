const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileOperations");

// Get all courses (public)
router.get("/", (req, res) => {
  const courses = readJSON("courses.json");
  res.json(courses);
});

// Get course by code
router.get("/:code", (req, res) => {
  const courses = readJSON("courses.json");
  const course = courses.find((c) => c.code === req.params.code);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  res.json(course);
});

module.exports = router;
