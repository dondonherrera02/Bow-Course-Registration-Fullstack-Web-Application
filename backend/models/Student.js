const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // STUD2025001 格式
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  birthday: { type: String },
  department: { type: String },
  program: { type: String },
  username: { type: String, unique: true },
  hashedPassword: { type: String },
  enrolledCourses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


StudentSchema.virtual('studentId').get(function() {
  return this.id || this._id.toHexString();
});

module.exports = mongoose.model('Student', StudentSchema);