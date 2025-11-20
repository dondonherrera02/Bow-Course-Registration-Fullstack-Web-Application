/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const bcrypt = require("bcrypt");
const { readJSON } = require("./fileOperations");
const { roleEnum } = require("./enum");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "bowcourse-secret-key-2025";
const { getDatabase } = require("./mongoService");
// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      studentId: user.studentId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      birthday: user.birthday
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// Verify admin role middleware
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== roleEnum.ADMIN) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Generate student ID
async function generateStudentIdDb() {
  const db = await getDatabase();
  const c = db.collection("students");
  const year = new Date().getFullYear();
  const count = await c.countDocuments();
  return `STUD${year}${String(count + 1).padStart(3, "0")}`;
}
// Generate admin ID
async function generateAdminIdDb() {
  const db = await getDatabase();
  const c = db.collection("admins");

  // Get the highest existing adminId number, then +1
  const cursor = c.find({}, { projection: { adminId: 1 } });
  let max = 0;

  await cursor.forEach(doc => {
    const id = doc && (doc.adminId || doc.id || doc._id && doc._id.toString());
    if (!id) return;
    const m = id.toString().match(/(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  const next = max + 1;
  return `ADMIN${String(next).padStart(3, "0")}`;
}
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Validates presence and format for registration fields
const validateRegistrationFields = (data) => {
  const errors = [];

  // Required fields
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "username",
    "password",
  ];

  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Field-specific format checks
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format");
  }

  if (data.password && data.password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (data.phone && !/^\d{10,15}$/.test(data.phone)) {
    errors.push("Phone number must contain only digits (10-15 digits)");
  }

  if (data.birthday) {
    const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdayRegex.test(data.birthday)) {
      errors.push("Birthday must be in YYYY-MM-DD format");
    } else {
      const birthday = new Date(data.birthday);
      const now = new Date();
      if (isNaN(birthday)) {
        errors.push("Invalid birthday date");
      } else if (birthday > now) {
        errors.push("Birthday cannot be in the future");
      } else {
        // Minimum age validation
        const ageDiff = now.getFullYear() - birthday.getFullYear();
        const m = now.getMonth() - birthday.getMonth();
        const age =
          m < 0 || (m === 0 && now.getDate() < birthday.getDate())
            ? ageDiff - 1
            : ageDiff;
        if (age < 15) {
          errors.push("You must be at least 15 years old");
        }
      }
    }
  }

  if (data.username && /\s/.test(data.username)) {
    errors.push("Username must not contain spaces");
  }

  return errors.length > 0 ? errors.join("\r\n") : null;
};

module.exports = {
  generateToken,
  verifyToken,
  verifyAdmin,
  generateStudentIdDb,
  generateAdminIdDb,
  hashPassword,
  validateRegistrationFields,
};
