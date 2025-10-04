const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "bowcourse-secret-key-2025";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Verify admin role middleware
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = { generateToken, verifyToken, verifyAdmin };
