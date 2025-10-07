/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const { readJSON, writeJSON } = require("../utils/fileOperations");
const { verifyToken } = require("../utils/authHelper");

const router = express.Router();

// Get student profile
router.get("/profile", verifyToken, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const students = readJSON("students.json");
  const student = students.find((s) => s.id === req.user.id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Remove password from response
  const { password, ...studentProfile } = student;
  res.json(studentProfile);
});

// Register for a course
router.post("/register-course", verifyToken, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const { courseCode, term } = req.body;

  if (!courseCode || !term) {
    return res.status(400).json({ error: "Course code and term are required" });
  }

  const students = readJSON("students.json");
  const studentIndex = students.findIndex((s) => s.id === req.user.id);

  if (studentIndex === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const courses = readJSON("courses.json");
  const course = courses.find((c) => c.code === courseCode);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const student = students[studentIndex];

  // Check if already registered for this course in the same term
  const existingRegistration = student.registeredCourses.find(
    (reg) => reg.courseCode === courseCode && reg.term === term
  );

  if (existingRegistration) {
    return res.status(400).json({
      error: "Already registered for this course in the selected term",
    });
  }

  // Check course limit (2-5 courses per term)
  const coursesInTerm = student.registeredCourses.filter(
    (reg) => reg.term === term
  ).length;

  if (coursesInTerm >= 5) {
    return res.status(400).json({
      error: "Maximum 5 courses allowed per term",
    });
  }

  // Add course registration
  student.registeredCourses.push({
    courseCode,
    courseName: course.name,
    term,
    registrationDate: new Date().toISOString(),
  });

  students[studentIndex] = student;
  writeJSON("students.json", students);

  res.json({
    message: "Course registered successfully",
    registration: {
      courseCode,
      courseName: course.name,
      term,
    },
  });
});

// Unregister from a course
router.put("/unregister-course", verifyToken, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const { courseCode, term } = req.body;

  if (!courseCode || !term) {
    return res.status(400).json({ error: "Course code and term are required" });
  }

  const students = readJSON("students.json");
  const studentIndex = students.findIndex((s) => s.id === req.user.id);

  if (studentIndex === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const student = students[studentIndex];

  // Find and remove the registration
  const registrationIndex = student.registeredCourses.findIndex(
    (reg) => reg.courseCode === courseCode && reg.term === term
  );

  if (registrationIndex === -1) {
    return res.status(400).json({
      error: "Not registered for this course in the selected term",
    });
  }

  /*
  TODO: To be confirmed the requirements
  // Check minimum course requirement (at least 2 courses per term)
  const coursesInTerm = student.registeredCourses.filter(
    (reg) => reg.term === term
  ).length;

  if (coursesInTerm <= 2) {
    return res.status(400).json({
      error: "Minimum 2 courses required per term",
    });
  }*/

  student.registeredCourses.splice(registrationIndex, 1);
  students[studentIndex] = student;
  writeJSON("students.json", students);

  res.json({ message: "Course unregistered successfully" });
});

// Get student's registered courses
router.get("/registered-courses", verifyToken, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const students = readJSON("students.json");
  const student = students.find((s) => s.id === req.user.id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const { term } = req.query;
  let registeredCourses = student.registeredCourses;

  if (term) {
    registeredCourses = registeredCourses.filter((reg) => reg.term === term);
  }

  res.json(registeredCourses);
});

// Submit contact form
router.post("/contact", verifyToken, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const students = readJSON("students.json");
  const contactForms = readJSON("contactForms.json");

  const student = students.find((s) => s.id === req.user.id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const newContactForm = {
    id: Date.now().toString(),
    studentId: student.id,
    name: `${student.firstName} ${student.lastName}`,
    email: student.email,
    message,
    timestamp: new Date().toISOString(),
  };

  contactForms.push(newContactForm);
  writeJSON("contactForms.json", contactForms);

  res.status(201).json({
    message: "Contact form submitted successfully",
    contactForm: newContactForm,
  });
});

module.exports = router;
