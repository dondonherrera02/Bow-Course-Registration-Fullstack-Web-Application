/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */
const express = require("express");
const bcrypt = require("bcrypt");
const { roleEnum, collectionEnum } = require("../utils/enum");
const { verifyToken, hashPassword } = require("../utils/authHelper");
const router = express.Router();

const { findOne, createDocument, updateOne, exists } = require("../utils/mongoService");

// Get student profile
router.get("/profile", verifyToken, async (req, res) => {
  if (req.user.role !== roleEnum.STUDENT) {
    return res.status(403).json({ error: "Access denied. Students only." });
  }
  try {
    const student = await findOne(collectionEnum.STUDENTS, { userId: req.user.userId });
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
  if (req.user.role !== roleEnum.STUDENT) {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    birthday,
    department,
    program,
    currentPassword,
    newPassword,
  } = req.body;

  if (!firstName && !lastName && !email && !phone && !newPassword) {
    return res
      .status(400)
      .json({ error: "At least one field must be provided to update" });
  }

  try {
    const student = await findOne(collectionEnum.STUDENTS, { userId: req.user.userId });

    if (!student) return res.status(404).json({ error: "Student not found" });

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to change password" });
      }

      const valid = await bcrypt.compare(currentPassword, student.hashedPassword || "");

      if (!valid)
        return res.status(401).json({ error: "Current password is incorrect" });

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters long" });
      }
      student.hashedPassword = await hashPassword(newPassword);
    }

    // Check email uniqueness
    if (email && email !== student.email) {
      const emailExists = await exists(collectionEnum.STUDENTS, { email, userId: { $ne: req.user.userId } });

      if (emailExists)
        return res.status(400).json({ error: "Email is already taken" });
    }

    // Apply updates
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (birthday) updateFields.birthday = birthday;
    if (department) updateFields.department = department;
    if (program) updateFields.program = program;
    if (student.hashedPassword && newPassword) updateFields.hashedPassword = student.hashedPassword;

    updateFields.updatedAt = new Date().toISOString();

    await updateOne(collectionEnum.STUDENTS, { userId: student.userId }, { $set: updateFields });

    const updatedStudent = await findOne(collectionEnum.STUDENTS, { userId: student.userId });
    const safeProfile = {
      userId: updatedStudent.userId,
      firstName: updatedStudent.firstName,
      lastName: updatedStudent.lastName,
      email: updatedStudent.email,
      phone: updatedStudent.phone,
      birthday: updatedStudent.birthday,
      department: updatedStudent.department,
      program: updatedStudent.program,
      createdAt: updatedStudent.createdAt,
      updatedAt: updatedStudent.updatedAt,
    };

    return res.json({
      message: "Profile updated successfully",
      profile: safeProfile,
    });

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
    const student = await findOne(collectionEnum.STUDENTS, { userId: req.user.userId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const course = await findOne(collectionEnum.COURSES, { code: courseCode });
    if (!course) return res.status(404).json({ error: "Course not found" });

    if ((course.enrolled || 0) >= (course.capacity || 0)) {
      return res.status(400).json({ error: "Course is full. No more seats available." });
    }

    const existing = (student.registeredCourses || []).find((reg) => reg.courseCode === courseCode && reg.term === term);
    if (existing)
      return res.status(400).json({ error: "Already registered for this course in the selected term" });

    const coursesInTerm = (student.registeredCourses || []).filter((reg) => reg.term === term).length;
    if (coursesInTerm >= 5)
      return res.status(400).json({ error: "Maximum 5 courses allowed per term" });


    // Add course registration
    student.registeredCourses.push({
      courseCode,
      courseName: course.name,
      term,
      registrationDate: new Date().toISOString(),
    });

    // update student
    student.updatedAt = new Date().toISOString();
    await updateOne(collectionEnum.STUDENTS, { userId: student.userId }, { $set: student });

    // update course
    course.enrolled += 1;
    course.updatedAt = new Date().toISOString();
    await updateOne(collectionEnum.COURSES, { code: courseCode }, { $set: course });

    const updatedCourse = await findOne(collectionEnum.COURSES, { code: courseCode });

    res.json({
      message: "Course registered successfully",
      registration: {
        courseCode,
        courseName: updatedCourse.name,
        term,
        enrolled: updatedCourse.enrolled,
        capacity: updatedCourse.capacity,
        remainingSlots:
          (updatedCourse.capacity || 0) - (updatedCourse.enrolled || 0),
      },
    });
  } catch (err) {
    console.error("Register course error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Unregister from a course
router.put("/unregister-course", verifyToken, async (req, res) => {
  if (req.user.role !== roleEnum.STUDENT) {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const { courseCode, term } = req.body;

  if (!courseCode || !term) {
    return res.status(400).json({ error: "Course code and term are required" });
  }

  try {
    const student = await findOne(collectionEnum.STUDENTS, { userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const registrationIndex = (student.registeredCourses || []).findIndex(
      (reg) => reg.courseCode === courseCode && reg.term === term
    );

    if (registrationIndex === -1) {
      return res.status(400).json({ error: "Not registered for this course in the selected term" });
    }

    const coursesInTerm = student.registeredCourses.filter((reg) => reg.term === term).length;
    if (coursesInTerm <= 2) {
      return res.status(400).json({ error: "Minimum 2 courses required per term" });
    }

    // Remove the registration
    student.registeredCourses.splice(registrationIndex, 1);
    student.updatedAt = new Date();

    await updateOne(
      collectionEnum.STUDENTS,
      { userId: student.userId },
      { $set: student }
    );

    // Update course enrollment count
    const course = await findOne(collectionEnum.COURSES, { code: courseCode });
    if (course) {
      const updatedEnrolled = Math.max((course.enrolled || 0) - 1, 0);

      await updateOne(
        collectionEnum.COURSES,
        { code: courseCode },
        {
          $set: {
            enrolled: updatedEnrolled,
            updatedAt: new Date(),
          },
        }
      );
    }

    return res.json({ message: "Course unregistered successfully" });

  } catch (err) {
    console.error("Unregister course error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// Get student's registered courses
router.get("/registered-courses", verifyToken, async (req, res) => {
  if (req.user.role !== roleEnum.STUDENT) {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  try {
    const student = await findOne(collectionEnum.STUDENTS, { userId: req.user.userId });

    if (!student) return res.status(404).json({ error: "Student not found" });

    const { term } = req.query;

    let registeredCourses = student.registeredCourses || [];

    if (term) registeredCourses = registeredCourses.filter((reg) => reg.term === term);

    res.json(registeredCourses);

  } catch (err) {
    console.error("Get registered courses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit contact form
router.post("/contact", verifyToken, async (req, res) => {
  if (req.user.role !== roleEnum.STUDENT) {
    return res.status(403).json({ error: "Access denied. Students only." });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const student = await findOne(collectionEnum.STUDENTS, { userId: req.user.userId });

    if (!student) return res.status(404).json({ error: "Student not found" });

    const newContactForm = {
      userId: student.userId,
      studentId: student.userId,
      name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      email: student.email || "",
      message,
      timestamp: new Date().toISOString(),
    };

    const result = await createDocument(collectionEnum.CONTACTFORMS, newContactForm);

    if (result && result.insertedId) {
      newContactForm.id = result.insertedId.toString();
      newContactForm._id = result.insertedId;
    }

    res.status(201).json({
      message: "Contact form submitted successfully",
      contactForm: newContactForm,
    });
  } catch (err) {
    console.error("Contact submit error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
