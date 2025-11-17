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

// TODO: Create additional functions such as updateOne, deleteOne, etc.

module.exports = {
  getDatabase,
  createDocument,
  findOne,
  exists,
};
