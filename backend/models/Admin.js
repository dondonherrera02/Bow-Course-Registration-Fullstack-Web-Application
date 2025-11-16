const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true },
  hashedPassword: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


AdminSchema.virtual('adminId').get(function() {
  return this.id || this._id.toHexString();
});

module.exports = mongoose.model('Admin', AdminSchema);