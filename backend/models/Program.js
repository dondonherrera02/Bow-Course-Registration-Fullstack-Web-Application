const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  department: { type: String },
  duration: { type: String }, // e.g., "2 years"
  credits: { type: Number }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


ProgramSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Program', ProgramSchema);