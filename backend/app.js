/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera
 */

const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const { SwaggerDocs } = require("./swagger.js");

// set up global configuration access - .env file
dotenv.config();

// CORS Middleware
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use(express.json()); // body parsing middleware

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Bow Course Registration API is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}/swagger`)
);

SwaggerDocs(app, PORT);
