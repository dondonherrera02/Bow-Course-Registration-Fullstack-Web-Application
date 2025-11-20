/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */
const express = require("express");
const bcrypt = require("bcrypt");
const { verifyToken, hashPassword } = require("../utils/authHelper");
const router = express.Router();

const { ObjectId } = require("mongodb");
const { findOne, createDocument, exists, updateOne } = require("../utils/mongoService");
const { findStudentByReqStudentId } = require("../utils/studentHelper");



// Get student profile
router.get("/profile", verifyToken, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }
  try {
    // prefer req.user.studentId if present, otherwise req.user.id
    const lookupId = req.user.studentId || req.user.id;
    const student = await findStudentByReqStudentId(lookupId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const { hashedPassword, ...profile } = student;
    res.json(profile);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Edit student profile
router.put("/profile", verifyToken, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    birthday,
    role,
    department,
    program,
    currentPassword,
    newPassword,
    studentId,
  } = req.body;

  if (!firstName && !lastName && !email && !phone && !newPassword) {
    return res.status(400).json({ error: "At least one field must be provided to update" });
  }

  try {
    const lookupId = req.user.studentId || req.user.id;
    const student = await findStudentByReqStudentId(lookupId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to change password" });
      }
      const valid = await bcrypt.compare(currentPassword, student.hashedPassword || "");
      if (!valid) return res.status(401).json({ error: "Current password is incorrect" });
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters long" });
      }
      student.hashedPassword = await hashPassword(newPassword);
    }

    // Check email uniqueness
    if (email && email !== student.email) {
      const emailExists = await findOne("students", { email, _id: { $ne: student._id } });
      if (emailExists) return res.status(400).json({ error: "Email is already taken" });
    }

    // Apply updates
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (birthday) updateFields.birthday = birthday;
    if (role) updateFields.role = role;
    if (department) updateFields.department = department;
    if (program) updateFields.program = program;
    if (student.hashedPassword && newPassword) updateFields.hashedPassword = student.hashedPassword;
    if (studentId) updateFields.studentId = studentId;
    updateFields.updatedAt = new Date();

    await updateOne("students", { _id: student._id }, { $set: updateFields });

    const updated = await findOne("students", { _id: student._id });
    const { hashedPassword: hp, ...clean } = updated;
    res.json({ message: "Profile updated successfully", profile: clean });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Register for a course
router.post("/register-course", verifyToken, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const { courseCode, term } = req.body;
  if (!courseCode || !term) {
    return res.status(400).json({ error: "Course code and term are required" });
  }

  try {
    const lookupId = req.user.studentId || req.user.id;
    const student = await findStudentByReqStudentId(lookupId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const course = await findOne("courses", { code: courseCode });
    if (!course) return res.status(404).json({ error: "Course not found" });

    if ((course.enrolled || 0) >= (course.capacity || 0)) {
      return res.status(400).json({ error: "Course is full. No more seats available." });
    }

    const existing = (student.registeredCourses || []).find(reg => reg.courseCode === courseCode && reg.term === term);
    if (existing) return res.status(400).json({ error: "Already registered for this course in the selected term" });

    const coursesInTerm = (student.registeredCourses || []).filter(reg => reg.term === term).length;
    if (coursesInTerm >= 5) return res.status(400).json({ error: "Maximum 5 courses allowed per term" });

    const registration = {
      courseCode,
      courseName: course.name,
      term,
      registrationDate: new Date().toISOString(),
    };

    // update student and course (not using transaction) using helpers
    await updateOne("students", { _id: student._id }, { $push: { registeredCourses: registration }, $set: { updatedAt: new Date() } });

    await updateOne("courses", { _id: course._id }, { $inc: { enrolled: 1 }, $set: { updatedAt: new Date() } });

    const updatedCourse = await findOne("courses", { _id: course._id });

    res.json({
      message: "Course registered successfully",
      registration: {
        courseCode,
        courseName: registration.courseName,
        term,
        enrolled: updatedCourse.enrolled,
        capacity: updatedCourse.capacity,
        remainingSlots: (updatedCourse.capacity || 0) - (updatedCourse.enrolled || 0),
      },
    });
  } catch (err) {
    console.error("Register course error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Unregister from a course
router.put("/unregister-course", verifyToken, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const { courseCode, term } = req.body;
  if (!courseCode || !term) return res.status(400).json({ error: "Course code and term are required" });

  try {
    const lookupId = req.user.studentId || req.user.id;
    const student = await findStudentByReqStudentId(lookupId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const registrationIndex = (student.registeredCourses || []).findIndex(reg => reg.courseCode === courseCode && reg.term === term);
    if (registrationIndex === -1) return res.status(400).json({ error: "Not registered for this course in the selected term" });

    const coursesInTerm = (student.registeredCourses || []).filter(reg => reg.term === term).length;
    if (coursesInTerm <= 2) return res.status(400).json({ error: "Minimum 2 courses required per term" });

    // remove registration
    await updateOne("students", { _id: student._id }, { $pull: { registeredCourses: { courseCode, term } }, $set: { updatedAt: new Date() } });

    const course = await findOne("courses", { code: courseCode });
    if (course) {
      const newEnrolled = Math.max((course.enrolled || 0) - 1, 0);
      await updateOne("courses", { _id: course._id }, { $set: { enrolled: newEnrolled, updatedAt: new Date() } });
    }

    res.json({ message: "Course unregistered successfully" });
  } catch (err) {
    console.error("Unregister course error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get student's registered courses
router.get("/registered-courses", verifyToken, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }
  try {
    const lookupId = req.user.studentId || req.user.id;
    const student = await findStudentByReqStudentId(lookupId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const { term } = req.query;
    let registeredCourses = student.registeredCourses || [];
    if (term) registeredCourses = registeredCourses.filter(reg => reg.term === term);
    res.json(registeredCourses);
  } catch (err) {
    console.error("Get registered courses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit contact form
router.post("/contact", verifyToken, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const lookupId = req.user.studentId || req.user.id;
    const student = await findStudentByReqStudentId(lookupId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const newContactForm = {
      studentId: student.studentId || student._id.toString(),
      name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      email: student.email || "",
      message,
      timestamp: new Date(),
    };

    const result = await createDocument("contactForms", newContactForm);
    // createDocument returns the insert result object from insertOne
    newContactForm.id = result.insertedId ? result.insertedId.toString() : undefined;

    res.status(201).json({ message: "Contact form submitted successfully", contactForm: newContactForm });
  } catch (err) {
    console.error("Contact submit error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
