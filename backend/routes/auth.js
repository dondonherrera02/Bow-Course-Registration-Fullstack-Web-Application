/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const router = express.Router();
const { writeJSON, readJSON } = require("../utils/fileOperations");
const { roleEnum } = require("../utils/enum");
const bcrypt = require("bcrypt");
const {
  generateStudentId,
  hashPassword,
  validateRegistrationFields,
} = require("../utils/authHelper");
const { findUserByField, prepareUserResponse } = require("../utils/userHelper");

// Register new student (MongoDB based)
router.post("/register", async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, birthday,
      program, username, password
    } = req.body;

    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const Student = require("../models/Student");

    if (await Student.findOne({ username })) {
      return res.status(400).json({ error: "Username already exists" });
    }
    if (await Student.findOne({ email })) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const year = new Date().getFullYear();
    const count = await Student.countDocuments();
    const studentId = `STUD${year}${String(count + 1).padStart(3, "0")}`;

    const hashedPassword = await hashPassword(password);

    const newStudent = await Student.create({
      studentId,
      firstName,
      lastName,
      email,
      phone,
      birthday,
      program,
      username,
      hashedPassword,
      registeredCourses: []
    });

    // don't return hashedPassword
    const safeStudent = newStudent.toObject();
    delete safeStudent.hashedPassword;

    const token = require("../utils/authHelper").generateToken({
      id: newStudent._id.toString(),
      username: newStudent.username,
      role: roleEnum.STUDENT || "student",
    });

    res.status(201).json({ message: "Student registered", student: safeStudent, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route (MongoDB based)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const Student = require("../models/Student");
    const Admin = require("../models/Admin");

    // Try student login
    let user = await Student.findOne({ username });
    if (user) {
      const valid = await bcrypt.compare(password, user.hashedPassword);
      if (!valid) return res.status(401).json({ error: "Invalid password" });

      const token = require("../utils/authHelper").generateToken({
        id: user._id.toString(),
        username: user.username,
        role: roleEnum.STUDENT || "student",
      });

      const safeUser = user.toObject();
      delete safeUser.hashedPassword;
      return res.json({ message: "Login successful", user: safeUser, token });
    }

    // Try admin login
    user = await Admin.findOne({ username });
    if (user) {
      const valid = await bcrypt.compare(password, user.hashedPassword);
      if (!valid) return res.status(401).json({ error: "Invalid password" });

      const token = require("../utils/authHelper").generateToken({
        id: user._id.toString(),
        username: user.username,
        role: roleEnum.ADMIN || "admin",
      });

      const safeUser = user.toObject();
      delete safeUser.hashedPassword;
      return res.json({ message: "Login successful", user: safeUser, token });
    }

    // no user found
    return res.status(401).json({ error: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});





// Login route(JSON_file based)
/*router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  // Try student login
  let user = findUserByField("students.json", "username", username);
  if (user) {
    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) return res.status(401).json({ error: "Invalid password" });
    return res.json(prepareUserResponse(user, roleEnum.STUDENT));
  }

  // Try admin login
  user = findUserByField("admins.json", "username", username);
  if (user) {
    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) return res.status(401).json({ error: "Invalid password" });
    return res.json(prepareUserResponse(user, roleEnum.ADMIN));
  }

  // If no valid user found
  return res.status(401).json({ error: "Invalid credentials" });
});*/

// Register new student(JSON_file based) route
/*router.post("/register", async (req, res) => {
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

  // Validation
  const errors = validateRegistrationFields(req.body);
  if (errors) {
    return res.status(400).json({ error: errors });
  }

  // Check if username or email exists
  let studentUsername = findUserByField("students.json", "student", username);
  if (studentUsername) {
    return res.status(400).json({ error: "Username already exists" });
  }

  let studentEmail = findUserByField("students.json", "email", email);

  if (studentEmail) {
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

  const students = readJSON("students.json");
  students.push(newStudent);
  writeJSON("students.json", students);

  res.status(201).json({
    message: "Student registered successfully",
    studentId: newStudent.id,
  });
});*/



module.exports = router;
