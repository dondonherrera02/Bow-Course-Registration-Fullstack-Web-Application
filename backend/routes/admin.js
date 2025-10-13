/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const { readJSON, writeJSON } = require("../utils/fileOperations");
const { verifyToken } = require("../utils/authHelper");
const { roleEnum } = require("../utils/enum");

const router = express.Router();

// Get all students (Admin only)
router.get("/students", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const students = readJSON("students.json");

  // Remove passwords from response
  const studentsWithoutPasswords = students.map(
    ({ password, ...student }) => student
  );

  res.json(studentsWithoutPasswords);
});

// Get student by ID (Admin)
router.get("/students/:id", verifyToken, (req, res) => {
  if (req.user.role !== roleEnum.ADMIN) {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const students = readJSON("students.json");
  const student = students.find((s) => s.id === req.params.id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Remove password from response
  const { password, ...studentDetails } = student;
  res.json(studentDetails);
});

// Get all contact forms (Admin only)
router.get("/contact-forms", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const contactForms = readJSON("contactForms.json");

  // Sort by timestamp (newest first)
  const sortedForms = contactForms.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  res.json(sortedForms);
});

// Delete contact form (Admin only)
router.delete("/contact-forms/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const contactForms = readJSON("contactForms.json");
  const formIndex = contactForms.findIndex((form) => form.id === req.params.id);

  if (formIndex === -1) {
    return res.status(404).json({ error: "Contact form not found" });
  }

  contactForms.splice(formIndex, 1);
  writeJSON("contactForms.json", contactForms);

  res.json({ message: "Contact form deleted successfully" });
});

// Get students grouped by program (Admin only)
router.get("/students-by-program", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const students = readJSON("students.json");

  // Group students by program
  const studentsByProgram = students.reduce((acc, student) => {
    const { password, ...studentWithoutPassword } = student;

    if (!acc[student.program]) {
      acc[student.program] = [];
    }

    acc[student.program].push(studentWithoutPassword);
    return acc;
  }, {});

  res.json(studentsByProgram);
});

// Get all course registrations (Admin only)
router.get("/course-registrations", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const students = readJSON("students.json");
  const { courseCode, term } = req.query;

  let registrations = [];

  students.forEach((student) => {
    student.registeredCourses.forEach((course) => {
      registrations.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        program: student.program,
        courseCode: course.courseCode,
        courseName: course.courseName,
        term: course.term,
        registrationDate: course.registrationDate,
      });
    });
  });

  // Apply filters
  if (courseCode) {
    registrations = registrations.filter((reg) =>
      reg.courseCode.toLowerCase().includes(courseCode.toLowerCase())
    );
  }

  if (term) {
    registrations = registrations.filter((reg) => reg.term === term);
  }

  res.json(registrations);
});

// Get dashboard statistics (Admin only)
router.get("/dashboard-stats", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const students = readJSON("students.json");
  const courses = readJSON("courses.json");
  const programs = readJSON("programs.json");
  const contactForms = readJSON("contactForms.json");

  // Calculate total registrations
  const totalRegistrations = students.reduce(
    (total, student) => total + student.registeredCourses.length,
    0
  );

  // Calculate students by program
  const studentsByProgram = students.reduce((acc, student) => {
    acc[student.program] = (acc[student.program] || 0) + 1;
    return acc;
  }, {});

  // Calculate recent contact forms (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentContactForms = contactForms.filter(
    (form) => new Date(form.timestamp) > thirtyDaysAgo
  ).length;

  const stats = {
    totalStudents: students.length,
    totalCourses: courses.length,
    totalPrograms: programs.length,
    totalRegistrations,
    totalContactForms: contactForms.length,
    recentContactForms,
    studentsByProgram,
  };

  res.json(stats);
});

module.exports = router;
