const mongoose = require('mongoose');
require('dotenv').config();
let db = null; //// let db=null(meaning no value, false) at first


const connectDB = async () => {
	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error('MONGODB_URI is not set in environment (backend/.env)');
	}

	try {
		await mongoose.connect(uri);
		 db = mongoose.data; // assign the connection to db variable
		console.log('MongoDB connected');
	} catch (err) {
		console.error('MongoDB connection error:', err);
		throw err;
	}
};

module.exports = { connectDB, mongoose };
