const { getDatabase } = require("./mongoService");
const { ObjectId } = require("mongodb");


// Find student by studentId (e.g. "STUD2025001") or by Mongo _id string fallback
async function findStudentByReqStudentId(studentId) {
  if (!studentId) return null;

  const db = await getDatabase();
  const students = db.collection("students");

  // try by studentId first
  let student = await students.findOne({ studentId });
  if (student) return student;

  // fallback: if looks like ObjectId, try _id
  if (ObjectId.isValid(studentId)) {
    try {
      student = await students.findOne({ _id: new ObjectId(studentId) });
      if (student) return student;
    } catch (e) {
      // ignore parse/lookup errors
    }
  }

  return null;
}

module.exports = {
  findStudentByReqStudentId,
};