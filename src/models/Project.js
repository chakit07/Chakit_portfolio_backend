const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    thumbnail: {
      type: String,
      default: ''
    },
    gallery: {
      type: [String],
      default: []
    },
    techStack: {
      type: [String],
      default: []
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectCategory',
      required: true
    },
    liveUrl: {
      type: String,
      default: ''
    },
    repoUrl: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    order: {
      type: Number,
      default: 0
    },
    features: {
      type: [String],
      default: []
    },
    challenges: {
      type: [String],
      default: []
    },
    solutions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast lookup and public filtering
projectSchema.index({ status: 1, order: 1 });
projectSchema.index({ category: 1 });

module.exports = mongoose.model('Project', projectSchema);
