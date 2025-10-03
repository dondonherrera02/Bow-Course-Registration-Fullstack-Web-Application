const express = require("express");
const router = express.Router();
const { readJSON } = require("../utils/fileOperations");

// Get all programs (public)
router.get("/", (req, res) => {
  const programs = readJSON("programs.json");
  res.json(programs);
});

// Get program by code
router.get("/:code", (req, res) => {
  const programs = readJSON("programs.json");
  const program = programs.find((p) => p.code === req.params.code);

  if (!program) {
    return res.status(404).json({ error: "Program not found" });
  }

  res.json(program);
});

module.exports = router;
