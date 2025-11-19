/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

function getClient() {
  const { client } = require("../app.js");
  return client;
}

function getDatabase(dbName = process.env.DB_NAME) {
  const client = getClient();
  return client.db(dbName);
}

async function createDocument(collectionName, document) {
  try {
    const db = getDatabase();
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(document);
    return result;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

async function findOne(collectionName, query) {
  try {
    const db = getDatabase();
    const collection = db.collection(collectionName);
    const result = await collection.findOne(query);
    return result;
  } catch (error) {
    console.error(`Error finding document in ${collectionName}:`, error);
    throw error;
  }
}

async function exists(collectionName, query) {
  try {
    const document = await findOne(collectionName, query);
    return document !== null;
  } catch (error) {
    console.error(`Error checking existence in ${collectionName}:`, error);
    throw error;
  }
}

async function generateStudentIdDb() {
  const db = getDatabase();
  const c = db.collection("students");
  const year = new Date().getFullYear();
  const count = await c.countDocuments();
  return `STUD${year}${String(count + 1).padStart(3, "0")}`;
}

async function generateAdminIdDb() {
  const db = getDatabase();
  const c = db.collection("admins");

  // Get the highest existing adminId number, then +1
  const cursor = c.find({}, { projection: { adminId: 1 } });
  let max = 0;

  await cursor.forEach(doc => {
    const id = doc && (doc.adminId || doc.id || doc._id && doc._id.toString());
    if (!id) return;
    const m = id.toString().match(/(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });

  const next = max + 1;
  return `ADMIN${String(next).padStart(3, "0")}`;
}
// TODO: Create additional functions such as updateOne, deleteOne, etc.

module.exports = {
  getDatabase,
  createDocument,
  findOne,
  exists,
  generateStudentIdDb,
  generateAdminIdDb
  
};
