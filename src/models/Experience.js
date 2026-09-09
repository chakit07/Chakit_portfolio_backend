const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    employmentType: {
      type: String,
      default: 'Full-time'
    },
    location: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      default: ''
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      default: ''
    },
    bullets: {
      type: [String],
      default: []
    },
    logo: {
      type: String,
      default: ''
    },
    website: {
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

experienceSchema.index({ order: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
