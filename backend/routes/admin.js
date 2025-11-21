/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const { verifyToken } = require("../utils/authHelper");
const { roleEnum, collectionEnum } = require("../utils/enum");
const { findMany, findOne, deleteOne } = require("../utils/mongoService");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Get all students (Admin only)
router.get("/students", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  try {
    const students = await findMany(collectionEnum.STUDENTS, {});
    const programs = await findMany(collectionEnum.PROGRAMS, {});

    const programMap = {};
    (programs || []).forEach((prg) => {
      if (prg && prg.code) programMap[prg.code] = prg.name;
    });

    const studentsWithoutPasswords = (students || []).map((student) => {
      const { hashedPassword, password, ...s } = student || {};
      const programName = programMap[s.program] || null;
      return { ...s, programName };
    });

    res.json(studentsWithoutPasswords);
  } catch (err) {
    console.error("Get students (admin) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get student by ID (Admin)
router.get("/students/:id", verifyToken, async (req, res) => {
  if (req.user.role !== roleEnum.ADMIN) {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  try {
    const id = req.params.id;
    let student = null;

    // If it's a valid ObjectId, try lookup by _id first
    if (ObjectId.isValid(id)) {
      student = await findOne(collectionEnum.STUDENTS, { _id: new ObjectId(id) });
    }

    // Fallback: lookup by studentId field
    if (!student) {
      student = await findOne(collectionEnum.STUDENTS, { studentId: id });
    }

    if (!student) return res.status(404).json({ error: "Student not found" });
    const { hashedPassword, password, ...studentDetails } = student;
    res.json(studentDetails);
  } catch (err) {
    console.error("Get student by id (admin) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all contact forms (Admin only)
router.get("/contact-forms", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  try {
    const contactForms = await findMany(collectionEnum.CONTACTFORMS, {});
    const sortedForms = (contactForms || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    res.json(sortedForms);
  } catch (err) {
    console.error("Get contact forms (admin) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete contact form (Admin only)
router.delete("/contact-forms/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  try {
    const id = req.params.id;
    let result;
    if (ObjectId.isValid(id)) {
      result = await deleteOne(collectionEnum.CONTACTFORMS, { _id: new ObjectId(id) });
    }
    if (!result || result.deletedCount === 0) {
      result = await deleteOne(collectionEnum.CONTACTFORMS, { studentId: id });
    }
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ error: "Contact form not found" });
    }
    res.json({ message: "Contact form deleted successfully" });
  } catch (err) {
    console.error("Delete contact form (admin) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get students grouped by program (Admin only)
router.get("/students-by-program", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  try {
    const students = await findMany(collectionEnum.STUDENTS, {});
    const studentsByProgram = (students || []).reduce((acc, student) => {
      const { password, hashedPassword, ...studentWithoutPassword } = student || {};
      if (!acc[student.program])
        acc[student.program] = [];
      acc[student.program].push(studentWithoutPassword);
      return acc;
    }, {});
    res.json(studentsByProgram);
  } catch (err) {
    console.error("Get students by program (admin) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all course registrations (Admin only)
router.get("/course-registrations", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  try {
    const students = await findMany(collectionEnum.STUDENTS, {});
    const { courseCode, term } = req.query;
    let registrations = [];
    (students || []).forEach((student) => {
      (student.registeredCourses || [])
        .filter((course) => course && course.courseCode) // skip invalid/empty entries
        .forEach((course) => {
          registrations.push({
            // prefer studentId field but fall back to userId/_id for safety
            studentId: student.studentId || student.userId || (student._id && student._id.toString()),
            studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
            studentEmail: student.email || "",
            program: student.program,
            courseCode: course.courseCode,
            courseName: course.courseName,
            term: course.term,
            registrationDate: course.registrationDate,
          });
        });
    });

    if (courseCode) {
      registrations = registrations.filter((reg) =>
        reg.courseCode && reg.courseCode.toLowerCase().includes(courseCode.toLowerCase())
      );
    }

    if (term) {
      registrations = registrations.filter((reg) => reg.term === term);
    }

    res.json(registrations);
  } catch (err) {
    console.error("Get course registrations (admin) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get dashboard statistics (Admin only)
router.get("/dashboard-stats", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  try {
    const students = await findMany(collectionEnum.STUDENTS, {});
    const courses = await findMany(collectionEnum.COURSES, {});
    const programs = await findMany(collectionEnum.PROGRAMS, {});
    const contactForms = await findMany(collectionEnum.CONTACTFORMS, {});

    const totalRegistrations = (students || []).reduce(
      (total, student) => total + ((student.registeredCourses || []).length),
      0
    );

    const studentsByProgram = (students || []).reduce((acc, student) => {
      acc[student.program] = (acc[student.program] || 0) + 1;
      return acc;
    }, {});

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentContactForms = (contactForms || []).filter(
      (form) => new Date(form.timestamp) > thirtyDaysAgo
    ).length;

    const stats = {
      totalStudents: (students || []).length,
      totalCourses: (courses || []).length,
      totalPrograms: (programs || []).length,
      totalRegistrations,
      totalContactForms: (contactForms || []).length,
      recentContactForms,
      studentsByProgram,
    };

    res.json(stats);
  } catch (err) {
    console.error("Get dashboard stats (admin) error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
