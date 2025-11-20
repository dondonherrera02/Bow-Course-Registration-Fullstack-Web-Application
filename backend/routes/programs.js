/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const router = express.Router();
const { findMany, findOne } = require("../utils/mongoService");
const { collectionEnum } = require("../utils/enum");

// Get all programs (public)
router.get("/", async (req, res) => {
  try {
    const programs = await findMany(collectionEnum.PROGRAMS, {});
    res.json(programs || []);
  } catch (err) {
    console.error("Get programs error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get program by code
router.get("/:code", async (req, res) => {
  try {
    const program = await findOne(collectionEnum.PROGRAMS, { code: req.params.code });
    if (!program) return res.status(404).json({ error: "Program not found" });
    res.json(program);
  } catch (err) {
    console.error("Get program error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
