/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const router = express.Router();
const { roleEnum } = require("../utils/enum");
const bcrypt = require("bcrypt");
const { hashPassword,
  validateRegistrationFields,
  generateStudentIdDb,
  generateAdminIdDb } = require("../utils/authHelper");
const { prepareUserResponse } = require("../utils/userHelper");

const { findOne, createDocument, exists } = require("../utils/mongoService");

// Login route, student and admin
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    // Try student login (use helper)
    let user = await findOne("students", { username: username });
    if (user) {
      const valid = await bcrypt.compare(password, user.hashedPassword || "");
      if (!valid) return res.status(401).json({ error: "Invalid password" });
      // ensure user.id exists for token
      user.id = user.studentId || (user._id && user._id.toString());
      return res.json(prepareUserResponse(user, roleEnum.STUDENT));
    }

    // Try admin login (use helper)
    user = await findOne("admins", { username: username });
    if (user) {
      const valid = await bcrypt.compare(password, user.hashedPassword || "");
      if (!valid) return res.status(401).json({ error: "Invalid password" });
      user.id = user.adminId || (user._id && user._id.toString());
      return res.json(prepareUserResponse(user, roleEnum.ADMIN));
    }

    // If no valid user found
    return res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Register new student
router.post("/register-student", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    birthday,
    program,
    username,
    password,
  } = req.body;

  try {
    // Validation
    const errors = validateRegistrationFields(req.body);
    if (errors && errors.length) {
      return res.status(400).json({ error: errors });
    }

    // Check if username/email exists (use helpers)
    if (await exists("students", { username })) {
      return res.status(400).json({ error: "Username already exists" });
    }
    if (await exists("students", { email })) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password before storing
    const hashed = await hashPassword(password);

    // Generate student id based on DB count
    const studentId = await generateStudentIdDb();

    // Create new student document
    const newStudent = {
      studentId, // use studentId field to avoid collision with Mongo _id
      firstName,
      lastName,
      email,
      phone,
      birthday,
      program,
      username,
      role: "student",
      department: "",
      hashedPassword: hashed,
      registeredCourses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert student into MongoDB using helper
    await createDocument("students", newStudent);

    res.status(201).json({
      message: "Student registered successfully",
      studentId: newStudent.studentId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Register new admin
router.post("/register-admin", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if username exists (use helper)
    if (await exists("admins", { username })) {
      return res.status(400).json({ error: "Username already exists" });
    }
    // Hash the password before storing
    const hashed = await hashPassword(password);

    // Generate admin id
    const adminId = await generateAdminIdDb();

    // Create new admin document
    const newAdmin = {
      adminId,
      username,
      role: "admin",
      hashedPassword: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Insert admin into MongoDB using helper
    await createDocument("admins", newAdmin);

    res.status(201).json({
      message: "Admin registered successfully",
      username: newAdmin.username,
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;