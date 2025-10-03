const fs = require("fs");
const path = require("path");

// Read JSON file
const readJSON = (filename) => {
  try {
    const filePath = path.join(__dirname, "../data", filename);
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

// Write JSON file
const writeJSON = (filename, data) => {
  try {
    const filePath = path.join(__dirname, "../data", filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

module.exports = { readJSON, writeJSON };
