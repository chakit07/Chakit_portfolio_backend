const aiService = require('../services/aiService');
const Project = require('../models/Project');
const ContactMessage = require('../models/ContactMessage');
const env = require('../config/env');

/**
 * Public: Grounded AI Portfolio Assistant Chat
 */
const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid message string is required.'
      });
    }

    const reply = await aiService.chatWithPortfolio(history || [], message.trim());

    res.status(200).json({
      success: true,
      data: {
        reply,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Recruiter Job Matcher
 */
const matchJob = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description of at least 15 characters.'
      });
    }

    const matchData = await aiService.matchJobDescription(jobDescription.trim());

    res.status(200).json({
      success: true,
      data: matchData
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Case Study Perspective Summarizer
 */
const summarizeProject = async (req, res, next) => {
  try {
    const { slug, mode = 'tldr' } = req.body;
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Project slug is required.'
      });
    }

    const project = await Project.findOne({ slug, status: 'published' }).lean();
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const summary = await aiService.summarizeProject(project, mode);

    res.status(200).json({
      success: true,
      data: {
        slug,
        title: project.title,
        mode,
        summary
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Generate Project Case Study Content
 */
const generateCaseStudy = async (req, res, next) => {
  try {
    const { title, roughNotes, techStack } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required for generating a case study.'
      });
    }

    const caseStudy = await aiService.generateCaseStudy({
      title: title.trim(),
      roughNotes,
      techStack
    });

    res.status(200).json({
      success: true,
      data: caseStudy
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Generate Smart Email Reply Draft
 */
const generateReplyDraft = async (req, res, next) => {
  try {
    const { messageId, name, email, subject, message, tone } = req.body;

    let targetName = name;
    let targetEmail = email;
    let targetSubject = subject;
    let targetMessage = message;

    if (messageId) {
      const msgDoc = await ContactMessage.findById(messageId).lean();
      if (msgDoc) {
        targetName = msgDoc.name;
        targetEmail = msgDoc.email;
        targetSubject = msgDoc.subject;
        targetMessage = msgDoc.message;
      }
    }

    if (!targetMessage) {
      return res.status(400).json({
        success: false,
        message: 'Message content or a valid messageId is required.'
      });
    }

    const draft = await aiService.generateEmailReply({
      name: targetName || 'Visitor',
      email: targetEmail || '',
      subject: targetSubject || '',
      message: targetMessage,
      tone: tone || 'professional'
    });

    res.status(200).json({
      success: true,
      data: draft
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Polish Bio or Taglines
 */
const polishText = async (req, res, next) => {
  try {
    const { text, targetType, tone } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text to polish is required.'
      });
    }

    const result = await aiService.polishText({
      text: text.trim(),
      targetType: targetType || 'bio',
      tone: tone || 'modern'
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * AI Service Health & Status
 */
const getAiStatus = async (req, res) => {
  const hasKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim());
  res.status(200).json({
    success: true,
    data: {
      provider: 'Google Gemini',
      model: env.GEMINI_MODEL || 'gemini-1.5-flash',
      configured: hasKey,
      mode: hasKey ? 'live_api' : 'heuristic_fallback'
    }
  });
};

module.exports = {
  chat,
  matchJob,
  summarizeProject,
  generateCaseStudy,
  generateReplyDraft,
  polishText,
  getAiStatus
};
