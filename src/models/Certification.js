const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      default: '',
      trim: true
    },
    issueDate: {
      type: String,
      default: ''
    },
    expiryDate: {
      type: String,
      default: ''
    },
    credentialId: {
      type: String,
      default: ''
    },
    credentialUrl: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

certificationSchema.index({ order: 1 });

module.exports = mongoose.model('Certification', certificationSchema);
