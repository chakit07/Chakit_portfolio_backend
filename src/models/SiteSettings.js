const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    profile: {
      name: { type: String, default: 'Chakit Sharma' },
      title: { type: String, default: 'Senior Full-Stack Developer & UI/UX Specialist' },
      headline: { type: String, default: 'Crafting high-performance digital experiences with modern web technologies and elegant architectures.' },
      bio: { type: String, default: 'Passionate software engineer and product designer specializing in scalable web applications, real-time architectures, and interactive 3D user interfaces.' },
      location: { type: String, default: 'San Francisco, CA' },
      currentFocus: { type: String, default: 'Building scalable distributed systems and interactive web experiences' },
      availabilityStatus: { type: String, default: 'Available for high-impact opportunities' },
      profileImage: { type: String, default: '' },
      logoText: { type: String, default: 'Portfolio' },
      logoImage: { type: String, default: '' },
      roles: {
        type: [String],
        default: [
          'Senior Full-Stack Engineer',
          'UI/UX & 3D Web Creative',
          'Node.js & Next.js Specialist',
          'Cloud & Distributed Systems Architect'
        ]
      },
      stats: [
        {
          label: { type: String, required: true },
          value: { type: String, required: true }
        }
      ],
      resumeUrl: { type: String, default: '' },
      resumeButtonVisible: { type: Boolean, default: true },
      contactEmail: { type: String, default: 'contact@example.com' },
      contactEmailVisible: { type: Boolean, default: true },
      contactPhone: { type: String, default: '+1 (555) 019-2834' },
      contactPhoneVisible: { type: Boolean, default: true },
      contactVisible: { type: Boolean, default: true }
    },
    seo: {
      siteTitle: { type: String, default: 'Chakit Sharma — Full-Stack Developer & UI/UX Designer' },
      siteDescription: { type: String, default: 'Modern, high-performance portfolio featuring interactive 3D elements, full-stack projects, and engineering leadership.' },
      keywords: { type: [String], default: ['Full-Stack Developer', 'Next.js', 'Node.js', 'React', 'Three.js', 'MongoDB'] },
      ogImage: { type: String, default: '' },
      favicon: { type: String, default: '' }
    },
    appearance: {
      accentColor: { type: String, default: '#3b82f6' }, // blue-500
      defaultTheme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' }
    },
    sections: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        order: { type: Number, required: true },
        visible: { type: Boolean, default: true }
      }
    ],
    visualEffects: {
      enabled: { type: Boolean, default: true },
      preset: { type: String, default: 'laptop' },
      accentColor: { type: String, default: '#6366f1' },
      intensity: { type: Number, min: 0.2, max: 2.0, default: 1.0 },
      particles: { type: Boolean, default: true },
      cardTilt: { type: Boolean, default: true },
      enableOnMobile: { type: Boolean, default: false },
      fallbackImage: { type: String, default: '' },
      hologramImage: { type: String, default: '' },
      imageBorderEffect: { type: String, default: 'glow-gradient' },
      borderColor: { type: String, default: '' },
      borderWidth: { type: Number, min: 1, max: 16, default: 2 },
      borderRadius: { type: String, enum: ['none','sm','md','lg','xl','2xl','full'], default: 'xl' }
    },
    footer: {
      text: { type: String, default: 'Crafted with precision using Next.js, Three.js, Express & MongoDB.' },
      textVisible: { type: Boolean, default: true },
      copyright: { type: String, default: '© 2026 All rights reserved.' },
      copyrightVisible: { type: Boolean, default: true },
      visible: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
