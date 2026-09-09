const SiteSettings = require('../models/SiteSettings');

const DEFAULT_SECTIONS = [
  { id: 'hero', name: 'Hero', order: 1, visible: true },
  { id: 'about', name: 'About', order: 2, visible: true },
  { id: 'skills', name: 'Skills', order: 3, visible: true },
  { id: 'experience', name: 'Experience', order: 4, visible: true },
  { id: 'projects', name: 'Projects', order: 5, visible: true },
  { id: 'education', name: 'Education & Certifications', order: 6, visible: true },
  { id: 'contact', name: 'Contact', order: 7, visible: true }
];

const getOrCreateSettings = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({
      sections: DEFAULT_SECTIONS
    });
  } else if (!settings.sections || settings.sections.length === 0) {
    settings.sections = DEFAULT_SECTIONS;
    await settings.save();
  }
  return settings;
};

const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

const toPlain = (obj) => {
  if (!obj) return {};
  if (typeof obj.toObject === 'function') return obj.toObject();
  if (typeof obj === 'object') return { ...obj };
  return {};
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    const { profile, seo, appearance, sections, visualEffects, footer } = req.body;

    if (profile) settings.profile = { ...toPlain(settings.profile), ...profile };
    if (seo) settings.seo = { ...toPlain(settings.seo), ...seo };
    if (appearance) settings.appearance = { ...toPlain(settings.appearance), ...appearance };
    if (sections && Array.isArray(sections)) settings.sections = sections;
    if (visualEffects) settings.visualEffects = { ...toPlain(settings.visualEffects), ...visualEffects };
    if (footer) settings.footer = { ...toPlain(settings.footer), ...footer };

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Website settings updated successfully.',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

const updateVisualEffects = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    settings.visualEffects = {
      ...toPlain(settings.visualEffects),
      ...req.body
    };
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Visual effects configuration updated.',
      data: settings.visualEffects
    });
  } catch (error) {
    next(error);
  }
};

const updateSectionConfig = async (req, res, next) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        message: 'Sections array is required.'
      });
    }

    const settings = await getOrCreateSettings();
    settings.sections = sections;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Section visibility and display order updated.',
      data: settings.sections
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateVisualEffects,
  updateSectionConfig,
  getOrCreateSettings
};
