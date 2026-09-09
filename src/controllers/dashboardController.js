const Project = require('../models/Project');
const Skill = require('../models/Skill');
const SkillCategory = require('../models/SkillCategory');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const ContactMessage = require('../models/ContactMessage');
const Media = require('../models/Media');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProjects,
      publishedProjects,
      draftProjects,
      totalSkills,
      totalSkillCategories,
      totalExperience,
      totalEducation,
      totalCertifications,
      totalMessages,
      unreadMessages,
      totalMedia,
      recentMessages,
      recentProjects
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'published' }),
      Project.countDocuments({ status: 'draft' }),
      Skill.countDocuments(),
      SkillCategory.countDocuments(),
      Experience.countDocuments(),
      Education.countDocuments(),
      Certification.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ isRead: false, isArchived: false }),
      Media.countDocuments(),
      ContactMessage.find({ isArchived: false }).sort({ createdAt: -1 }).limit(5),
      Project.find().populate('category', 'name').sort({ updatedAt: -1 }).limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          projects: {
            total: totalProjects,
            published: publishedProjects,
            draft: draftProjects
          },
          skills: {
            total: totalSkills,
            categories: totalSkillCategories
          },
          experience: totalExperience,
          education: totalEducation,
          certifications: totalCertifications,
          messages: {
            total: totalMessages,
            unread: unreadMessages
          },
          media: totalMedia
        },
        recent: {
          messages: recentMessages,
          projects: recentProjects
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
