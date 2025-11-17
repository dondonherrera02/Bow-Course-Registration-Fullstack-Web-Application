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
const {
  generateStudentId,
  hashPassword,
  validateRegistrationFields,
} = require("../utils/authHelper");
const { prepareUserResponse } = require("../utils/userHelper");
const { findOne, createDocument, exists } = require("../utils/mongoService");

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    // Try student login
    let user = await findOne("students", { username: username });
    if (user) {
      const valid = await bcrypt.compare(password, user.hashedPassword);
      if (!valid) return res.status(401).json({ error: "Invalid password" });
      return res.json(prepareUserResponse(user, roleEnum.STUDENT));
    }

    // Try admin login
    user = await findOne("admins", { username: username });
    if (user) {
      const valid = await bcrypt.compare(password, user.hashedPassword);
      if (!valid) return res.status(401).json({ error: "Invalid password" });
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
router.post("/register", async (req, res) => {
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
    if (errors) {
      return res.status(400).json({ error: errors });
    }

    // Check if username exists
    const usernameExists = await exists("students", { username: username });
    if (usernameExists) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if email exists
    const emailExists = await exists("students", { email: email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    // Create new student
    const newStudent = {
      id: generateStudentId(),
      firstName,
      lastName,
      email,
      phone,
      birthday,
      department: "SD",
      program,
      username,
      hashedPassword,
      registeredCourses: [],
      createdAt: new Date().toISOString(),
    };

    // Insert student into MongoDB
    await createDocument("students", newStudent);

    res.status(201).json({
      message: "Student registered successfully",
      studentId: newStudent.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
