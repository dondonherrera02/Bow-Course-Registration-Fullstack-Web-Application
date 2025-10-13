/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

// Term date range definitions (month is 0-indexed: 0=January, 11=December)
const TERM_RANGES = {
  Spring: { startMonth: 2, endMonth: 5 }, // March - June
  Summer: { startMonth: 5, endMonth: 7 }, // June - August
  Fall: { startMonth: 8, endMonth: 11 }, // September - December
  Winter: { startMonth: 0, endMonth: 2 }, // January - March
};

// Validate that dates fall within the specified term period
function validateTermDates(term, startDate, endDate) {
  if (!term || !startDate || !endDate) {
    return null;
  }

  const range = TERM_RANGES[term];
  if (!range) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    return null;
  }

  const startMonth = start.getMonth();
  const endMonth = end.getMonth();

  // Check if start date falls within term range
  if (startMonth < range.startMonth || startMonth > range.endMonth) {
    return `Start date must be within ${term} term (${getTermMonthRange(
      term
    )})`;
  }

  // Check if end date falls within term range
  if (endMonth < range.startMonth || endMonth > range.endMonth) {
    return `End date must be within ${term} term (${getTermMonthRange(term)})`;
  }

  return null;
}

// Get human-readable month range for a term
function getTermMonthRange(term) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const range = TERM_RANGES[term];
  if (!range) return "";

  return `${monthNames[range.startMonth]} - ${monthNames[range.endMonth]}`;
}

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

  // Validate term dates match the term period
  const termDateError = validateTermDates(
    data.term,
    data.startDate,
    data.endDate
  );
  if (termDateError) {
    errors.push(termDateError);
  }

  return errors.length > 0 ? errors.join("\r\n") : null;
}

module.exports = {
  validateCourseFields,
  validateTermDates,
  getTermMonthRange,
};
