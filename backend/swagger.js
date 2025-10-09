/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

// install swagger-jsdoc swagger-ui-express --save-dev
// Ref: https://dev.to/desmondsanctity/documenting-nodejs-api-using-swagger-4klp

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bow Course Registration Fullstack Web Application",
      description: "Server running...",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:8080/",
        description: "Local server",
      },
    ],
  },
  apis: ["./router/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const SwaggerDocs = (app, port) => {
  // Swagger Page
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Documentation in JSON format
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

module.exports = {
  SwaggerDocs,
};
