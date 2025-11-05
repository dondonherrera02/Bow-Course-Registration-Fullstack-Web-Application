/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const { SwaggerDocs } = require("./swagger.js");

// set up global configuration access - .env file
dotenv.config();

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const programRoutes = require("./routes/programs");
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/students");
const { connectDB } = require("./utils/mongodb.js");


const allowedOrigins = [
  "https://bow-course-registration-puce.vercel.app", // vercel UI
  "http://localhost:3000", // local server [UI]
];

// CORS Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json()); // body parsing middleware

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
/*const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}/swagger`)
);

SwaggerDocs(app, PORT);*/
connectDB();

