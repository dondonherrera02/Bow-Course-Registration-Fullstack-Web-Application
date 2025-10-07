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
  const now = new Date();
  let startDate, endDate;
  if (data.startDate) startDate = new Date(data.startDate);
  if (data.endDate) endDate = new Date(data.endDate);

  if (data.startDate && isNaN(startDate)) {
    errors.push("Invalid Start Date format (YYYY-MM-DD)");
  }
  if (data.endDate && isNaN(endDate)) {
    errors.push("Invalid End Date format (YYYY-MM-DD)");
  }

  // Check chronological order and if dates are not in the past
  if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
    if (endDate <= startDate) {
      errors.push("End Date must be after Start Date");
    }
    if (startDate < now) {
      errors.push("Start Date must not be in the past");
    }
    if (endDate < now) {
      errors.push("End Date must not be in the past");
    }
  }

  // Description minimum length
  if (data.description && data.description.length < 10) {
    errors.push("Description must be at least 10 characters");
  }

  return errors.length > 0 ? errors.join(", ") : null;
}

module.exports = {
  validateCourseFields,
};
