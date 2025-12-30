/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const { roleEnum, collectionEnum } = require("../utils/enum");
const { verifyToken } = require("../utils/authHelper");
const { validateCourseFields } = require("../utils/courseHelper");
const { findMany, findOne, createDocument, exists, updateOne, deleteOne } = require("../utils/mongoService");

const router = express.Router();

// Get all courses (public)
router.get("/", async (req, res) => {
  try {
    const courses = await findMany(collectionEnum.COURSES, {});
    const coursesWithSlots = (courses || []).map((course) => ({
      ...course,
      remainingSlots: (course.capacity || 0) - (course.enrolled || 0),
      isFull: (course.enrolled || 0) >= (course.capacity || 0),
    }));
    res.json(coursesWithSlots);
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get course by code
router.get("/:code", async (req, res) => {
  try {
    const course = await findOne(collectionEnum.COURSES, { code: req.params.code });
    if (!course) return res.status(404).json({ error: "Course not found" });
    const courseWithSlots = {
      ...course,
      remainingSlots: (course.capacity || 0) - (course.enrolled || 0),
      isFull: (course.enrolled || 0) >= (course.capacity || 0),
    };
    res.json(courseWithSlots);
  } catch (err) {
    console.error("Get course error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new course (Admin only)
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== roleEnum.ADMIN) {
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

  // Check if course code already exists
  if (await exists(collectionEnum.COURSES, { code })) {
    return res.status(400).json({ error: "Course code already exists" });
  }

  // Check program exists
  if (!(await exists(collectionEnum.PROGRAMS, { code: programCode }))) {
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

  await createDocument(collectionEnum.COURSES, newCourse);

  res.status(201).json({
    message: "Course created successfully",
    course: newCourse,
  });
});

// Update course (Admin only)
router.put("/:code", verifyToken, async (req, res) => {
  if (req.user.role !== roleEnum.ADMIN) {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const existingCourse = await findOne(collectionEnum.COURSES, { code: req.params.code });
  if (!existingCourse) return res.status(404).json({ error: "Course not found" });

  const { name, term, startDate, endDate, description, capacity, programCode } = req.body;

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
      return res.status(400).json({ error: "End Date must be after Start Date" });
    }
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (term) updateFields.term = term;
  if (startDate) updateFields.startDate = startDate;
  if (endDate) updateFields.endDate = endDate;
  if (description) updateFields.description = description;
  if (capacity !== undefined) updateFields.capacity = capacity;
  if (programCode) updateFields.programCode = programCode;

  updateFields.updatedBy = req.user.username;
  updateFields.updatedAt = new Date().toISOString();

  await updateOne(collectionEnum.COURSES, { code: req.params.code }, { $set: updateFields });
  const updated = await findOne(collectionEnum.COURSES, { code: req.params.code });

  res.json({ message: "Course updated successfully", course: updated });
});

// Delete course (Admin only)
router.delete("/:code", verifyToken, async (req, res) => {
  if (req.user.role !== roleEnum.ADMIN) {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const existing = await findOne(collectionEnum.COURSES, { code: req.params.code });
  if (!existing) return res.status(404).json({ error: "Course not found" });
  if (existing.enrolled > 0) 
    return res.status(400).json({ error: "Cannot delete course with active enrollments" });
  

  await deleteOne(collectionEnum.COURSES, { code: req.params.code });
  res.json({ message: "Course deleted successfully" });
});

module.exports = router;
