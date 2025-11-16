const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  term: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  description: { type: String },
  capacity: { type: Number, required: true },
  enrolled: { type: Number, default: 0 },
  programCode: { type: String, required: true },
  createdBy: { type: String },
  updatedBy: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


CourseSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Course', CourseSchema);