const express = require('express');
const authRoutes = require('./authRoutes');
const settingsRoutes = require('./settingsRoutes');
const projectRoutes = require('./projectRoutes');
const skillRoutes = require('./skillRoutes');
const experienceRoutes = require('./experienceRoutes');
const educationRoutes = require('./educationRoutes');
const certificationRoutes = require('./certificationRoutes');
const socialLinkRoutes = require('./socialLinkRoutes');
const mediaRoutes = require('./mediaRoutes');
const messageRoutes = require('./messageRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const publicRoutes = require('./publicRoutes');
const aiRoutes = require('./aiRoutes');
const mongoose = require('mongoose');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus
  });
});

// Versioned routes
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/experience', experienceRoutes);
router.use('/education', educationRoutes);
router.use('/certifications', certificationRoutes);
router.use('/socials', socialLinkRoutes);
router.use('/media', mediaRoutes);
router.use('/messages', messageRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/public', publicRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
