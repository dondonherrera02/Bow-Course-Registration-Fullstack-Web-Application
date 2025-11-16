/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const { readJSON, writeJSON } = require("../utils/fileOperations");
const { verifyToken } = require("../utils/authHelper");
const { validateCourseFields } = require("../utils/courseHelper");

const router = express.Router();

// Get all courses (public)
router.get("/", (req, res) => {
  const courses = readJSON("courses.json");

  // Add remaining slots calculation to each course
  const coursesWithSlots = courses.map((course) => ({
    ...course,
    remainingSlots: course.capacity - course.enrolled,
    isFull: course.enrolled >= course.capacity,
  }));

  res.json(coursesWithSlots);
});

// Get course by code
router.get("/:code", (req, res) => {
  const courses = readJSON("courses.json");
  const course = courses.find((c) => c.code === req.params.code);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  // Add remaining slots calculation
  const courseWithSlots = {
    ...course,
    remainingSlots: course.capacity - course.enrolled,
    isFull: course.enrolled >= course.capacity,
  };

  res.json(courseWithSlots);
});

// Create new course (Admin only)
router.post("/", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const errors = validateCourseFields(req.body);
  if (errors) {
    return res.status(400).json({ error: errors });
  }

  const now = new Date();
  let reqStartDate, reqEndDate;
  if (req.body.startDate) reqStartDate = new Date(req.body.startDate);
  if (req.body.endDate) reqEndDate = new Date(req.body.endDate);
  // Check chronological order and if dates are not in the past
  if (
    reqStartDate &&
    reqEndDate &&
    !isNaN(reqStartDate) &&
    !isNaN(reqEndDate)
  ) {
    if (reqEndDate <= reqStartDate) {
      return res
        .status(400)
        .json({ error: "End Date must be after Start Date" });
    }
    if (reqStartDate < now) {
      return res
        .status(400)
        .json({ error: "Start Date must not be in the past" });
    }
    if (reqEndDate < now) {
      return res
        .status(400)
        .json({ error: "End Date must not be in the past" });
    }
  }

  const {
    code,
    name,
    term,
    startDate,
    endDate,
    description,
    capacity,
    programCode,
  } = req.body;

  const courses = readJSON("courses.json");

  // Check if course code already exists
  if (courses.some((c) => c.code === code)) {
    return res.status(400).json({ error: "Course code already exists" });
  }

  const programs = readJSON("programs.json");

  // Check if the request program code exists
  if (!programs.some((p) => p.code === programCode)) {
    return res.status(400).json({ error: "Program code not registered" });
  }

  const newCourse = {
    code,
    name,
    term,
    startDate,
    endDate,
    description,
    capacity,
    enrolled: 0,
    programCode,
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
    updatedBy: req.user.username,
    updatedAt: new Date().toISOString(),
  };

  courses.push(newCourse);
  writeJSON("courses.json", courses);

  res.status(201).json({
    message: "Course created successfully",
    course: newCourse,
  });
});

// Update course (Admin only)
router.put("/:code", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const courses = readJSON("courses.json");
  const courseIndex = courses.findIndex((c) => c.code === req.params.code);

  if (courseIndex === -1) {
    return res.status(404).json({ error: "Course not found" });
  }

  const existingCourse = courses[courseIndex];
  const { name, term, startDate, endDate, description, capacity, programCode } =
    req.body;

  // Build the updated course data for validation
  const updatedData = {
    code: existingCourse.code,
    name: name || existingCourse.name,
    term: term || existingCourse.term,
    startDate: startDate || existingCourse.startDate,
    endDate: endDate || existingCourse.endDate,
    description: description || existingCourse.description,
    capacity: capacity !== undefined ? capacity : existingCourse.capacity,
    programCode: programCode || existingCourse.programCode,
  };

  // Validate all fields (using updated values)
  const errors = validateCourseFields(updatedData);
  if (errors) {
    return res.status(400).json({ error: errors });
  }

  // Check chronological order
  const reqStartDate = new Date(updatedData.startDate);
  const reqEndDate = new Date(updatedData.endDate);

  if (!isNaN(reqStartDate) && !isNaN(reqEndDate)) {
    if (reqEndDate <= reqStartDate) {
      return res
        .status(400)
        .json({ error: "End Date must be after Start Date" });
    }
  }

  // Update course
  courses[courseIndex] = {
    ...existingCourse,
    ...(name && { name }),
    ...(term && { term }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(description && { description }),
    ...(capacity !== undefined && { capacity }),
    ...(programCode && { programCode }),
    updatedBy: req.user.username,
    updatedAt: new Date().toISOString(),
  };

  writeJSON("courses.json", courses);

  res.json({
    message: "Course updated successfully",
    course: courses[courseIndex],
  });
});

// Delete course (Admin only)
router.delete("/:code", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const courses = readJSON("courses.json");
  const courseIndex = courses.findIndex((c) => c.code === req.params.code);

  if (courseIndex === -1) {
    return res.status(404).json({ error: "Course not found" });
  }

  courses.splice(courseIndex, 1);
  writeJSON("courses.json", courses);

  res.json({ message: "Course deleted successfully" });
});

module.exports = router;