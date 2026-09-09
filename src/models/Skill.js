const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillCategory',
      required: true
    },
    icon: {
      type: String,
      default: '' // Lucide icon name or image URL
    },
    proficiency: {
      type: String,
      default: 'Proficient' // e.g. 'Advanced', 'Expert', 'Intermediate', '90%'
    },
    order: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

skillSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('Skill', skillSchema);
