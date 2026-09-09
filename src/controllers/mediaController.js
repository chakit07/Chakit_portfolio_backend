const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Experience = require('../models/Experience');
const SiteSettings = require('../models/SiteSettings');

const getAllMedia = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const query = {};

    if (type === 'image') {
      query.mimeType = { $regex: '^image/' };
    } else if (type === 'document') {
      query.mimeType = 'application/pdf';
    }

    if (search) {
      query.originalName = { $regex: search, $options: 'i' };
    }

    const mediaList = await Media.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: mediaList });
  } catch (error) {
    next(error);
  }
};

const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;

    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: relativeUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: media
    });
  } catch (error) {
    next(error);
  }
};

const checkMediaUsage = async (mediaUrl, filename) => {
  const references = [];
  const searchPattern = new RegExp(`${filename}|${escapeRegExp(mediaUrl)}`, 'i');

  // Check published projects
  const projects = await Project.find({
    status: 'published',
    $or: [
      { thumbnail: searchPattern },
      { gallery: searchPattern }
    ]
  }).select('title slug');

  projects.forEach((p) => {
    references.push(`Published Project: "${p.title}"`);
  });

  // Check certifications
  const certs = await Certification.find({ image: searchPattern }).select('name');
  certs.forEach((c) => {
    references.push(`Certification: "${c.name}"`);
  });

  // Check experience
  const exps = await Experience.find({ logo: searchPattern }).select('company role');
  exps.forEach((e) => {
    references.push(`Experience: "${e.company} - ${e.role}"`);
  });

  // Check site settings
  const settings = await SiteSettings.findOne();
  if (settings) {
    if (settings.profile?.profileImage && searchPattern.test(settings.profile.profileImage)) {
      references.push('Profile Avatar / Hero Image');
    }
    if (settings.profile?.logoImage && searchPattern.test(settings.profile.logoImage)) {
      references.push('Site Brand Logo');
    }
    if (settings.profile?.resumeUrl && searchPattern.test(settings.profile.resumeUrl)) {
      references.push('Active Resume PDF');
    }
    if (settings.seo?.ogImage && searchPattern.test(settings.seo.ogImage)) {
      references.push('SEO OpenGraph Image');
    }
    if (settings.seo?.favicon && searchPattern.test(settings.seo.favicon)) {
      references.push('Site Favicon');
    }
    if (settings.visualEffects?.fallbackImage && searchPattern.test(settings.visualEffects.fallbackImage)) {
      references.push('3D Hero Fallback Image');
    }
  }

  return references;
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media record not found.' });
    }

    // Check if media is in use by published content
    const usage = await checkMediaUsage(media.url, media.filename);
    if (usage.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete media: it is currently used by published content.',
        usedIn: usage
      });
    }

    // Delete file from disk if exists
    if (fs.existsSync(media.path)) {
      try {
        fs.unlinkSync(media.path);
      } catch (err) {
        console.warn(`[Media] Could not delete physical file: ${err.message}`);
      }
    }

    await Media.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMedia,
  uploadMedia,
  deleteMedia
};
