const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      default: ''
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

socialLinkSchema.index({ order: 1 });

module.exports = mongoose.model('SocialLink', socialLinkSchema);
