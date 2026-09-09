const Project = require('../models/Project');
const ProjectCategory = require('../models/ProjectCategory');
const Skill = require('../models/Skill');
const SkillCategory = require('../models/SkillCategory');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const SocialLink = require('../models/SocialLink');
const { getOrCreateSettings } = require('./settingsController');

const getPublicPortfolio = async (req, res, next) => {
  try {
    const [
      settings,
      projectCategories,
      projects,
      skillCategories,
      skills,
      experience,
      education,
      certifications,
      socialLinks
    ] = await Promise.all([
      getOrCreateSettings(),
      ProjectCategory.find().sort({ order: 1, name: 1 }),
      // ONLY published projects
      Project.find({ status: 'published' })
        .populate('category', 'name slug')
        .sort({ order: 1, createdAt: -1 }),
      SkillCategory.find().sort({ order: 1, name: 1 }),
      // ONLY visible skills
      Skill.find({ visible: true })
        .populate('category', 'name')
        .sort({ order: 1, name: 1 }),
      Experience.find().sort({ order: 1 }),
      Education.find().sort({ order: 1 }),
      Certification.find().sort({ order: 1 }),
      // ONLY visible social links
      SocialLink.find({ visible: true }).sort({ order: 1 })
    ]);

    // Group skills by category for easy consumption
    const groupedSkills = skillCategories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      order: cat.order,
      skills: skills.filter((s) => s.category && s.category._id.toString() === cat._id.toString())
    })).filter((cat) => cat.skills.length > 0);

    res.status(200).json({
      success: true,
      data: {
        settings,
        projectCategories,
        projects,
        skills: groupedSkills,
        rawSkills: skills,
        experience,
        education,
        certifications,
        socialLinks
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPublicProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    // Strict draft check: only return if status === 'published'
    const project = await Project.findOne({ slug: slug.toLowerCase(), status: 'published' })
      .populate('category', 'name slug');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or is currently not published.'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const getSitemapEntries = async (req, res, next) => {
  try {
    // Only published projects
    const projects = await Project.find({ status: 'published' }).select('slug updatedAt');
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicPortfolio,
  getPublicProjectBySlug,
  getSitemapEntries
};
