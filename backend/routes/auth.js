const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileOperations");
const { generateToken } = require("../utils/auth");

// Login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  // Check admins
  const admins = readJSON("admins.json");
  const admin = admins.find(
    (a) => a.username === username && a.password === password
  );

  if (admin) {
    const token = generateToken({ ...admin, role: "admin" });
    return res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        role: "admin",
        email: admin.email,
      },
    });
  }

  // Check students
  const students = readJSON("students.json");
  const student = students.find(
    (s) => s.username === username && s.password === password
  );

  if (student) {
    const token = generateToken({ ...student, role: "student" });
    return res.json({
      token,
      user: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        role: "student",
        email: student.email,
        department: student.department,
        program: student.program,
      },
    });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

// Generate student ID
const generateStudentId = () => {
  const students = readJSON("students.json");
  const year = new Date().getFullYear();
  const lastId =
    students.length > 0 ? students[students.length - 1].id : `STUD${year}000`;
  const num = parseInt(lastId.slice(-3)) + 1;
  return `STUD${year}${String(num).padStart(3, "0")}`;
};

// Register new student
router.post("/register", (req, res) => {
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
  if (!firstName || !lastName || !email || !username || !password) {
    return res
      .status(400)
      .json({ error: "All required fields must be filled" });
  }

  const students = readJSON("students.json");

  // Check if username or email exists
  if (students.find((s) => s.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  if (students.find((s) => s.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

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
    password,
    registeredCourses: [],
    createdAt: new Date().toISOString(),
  };

  students.push(newStudent);
  writeJSON("students.json", students);

  res.status(201).json({
    message: "Student registered successfully",
    studentId: newStudent.id,
  });
});

module.exports = router;
