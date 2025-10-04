const express = require("express");
const router = express.Router();
const { readJSON } = require("../utils/fileOperations");
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

  return res.status(401).json({ error: "Invalid credentials" });
});

module.exports = router;
