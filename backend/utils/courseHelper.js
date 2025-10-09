/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

function validateCourseFields(data) {
  const errors = [];

  // Required fields
  const requiredFields = [
    "code",
    "name",
    "term",
    "startDate",
    "endDate",
    "description",
    "capacity",
    "programCode",
  ];
  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Course code
  if (data.code && !/^[A-Z0-9]{4,10}$/.test(data.code)) {
    errors.push("Course code must be 4-10 uppercase letters/numbers");
  }

  // Term: must be one of the specified terms
  if (data.term && !/^(Spring|Summer|Fall|Winter)$/.test(data.term)) {
    errors.push("Term must be one of: 'Spring', 'Summer', 'Fall', 'Winter'");
  }

  // Date validation logic
  let startDate, endDate;
  if (data.startDate) startDate = new Date(data.startDate);
  if (data.endDate) endDate = new Date(data.endDate);

  if (data.startDate && isNaN(startDate)) {
    errors.push("Invalid Start Date format (YYYY-MM-DD)");
  }
  if (data.endDate && isNaN(endDate)) {
    errors.push("Invalid End Date format (YYYY-MM-DD)");
  }

  // Description minimum length
  if (data.description && data.description.length < 10) {
    errors.push("Description must be at least 10 characters");
  }

  if (
    typeof data.capacity !== "number" ||
    data.capacity < 1 ||
    data.capacity > 40
  ) {
    errors.push("Capacity must be a number between 1 and 40");
  }

  return errors.length > 0 ? errors.join(", ") : null;
}

module.exports = {
  validateCourseFields,
};
