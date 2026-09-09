const { GoogleGenAI } = require('@google/genai');
const env = require('../config/env');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const SkillCategory = require('../models/SkillCategory');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const SiteSettings = require('../models/SiteSettings');

let aiClient = null;

function getGenAIClient() {
  if (!aiClient && env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('[AI Service] Failed to initialize GoogleGenAI client:', err.message);
    }
  }
  return aiClient;
}

/**
 * Build rich grounding context from live MongoDB portfolio records
 */
async function getPortfolioGroundingContext() {
  try {
    const [settings, projects, skills, experience, education, certifications] = await Promise.all([
      SiteSettings.findOne().lean(),
      Project.find({ status: 'published' }).sort({ order: 1 }).lean(),
      Skill.find({ visible: true }).populate('category', 'name').sort({ order: 1 }).lean(),
      Experience.find().sort({ order: 1 }).lean(),
      Education.find().sort({ order: 1 }).lean(),
      Certification.find().sort({ order: 1 }).lean()
    ]);

    const profileName = settings?.profile?.name || 'Chakit Sharma';
    const profileTitle = settings?.profile?.title || 'Full-Stack Developer & UI/UX Specialist';
    const profileBio = settings?.profile?.bio || 'Passionate software engineer building scalable web applications with modern design.';
    const contactEmail = settings?.contact?.email || 'chakitsharma7@gmail.com';
    const contactLocation = settings?.contact?.location || 'India';

    const projectList = (projects || []).map((p, i) => `
Project #${i + 1}: ${p.title} (slug: ${p.slug})
- Category: ${p.category?.name || 'Full-Stack'}
- Summary: ${p.summary}
- Tech Stack: ${(p.techStack || []).join(', ')}
- Description: ${p.description || 'N/A'}
- Key Features: ${(p.features || []).join('; ')}
- Challenges Faced: ${(p.challenges || []).join('; ')}
- Solutions Implemented: ${(p.solutions || []).join('; ')}
- Live Demo: ${p.liveUrl || 'Available upon request'}
- GitHub Repo: ${p.repoUrl || 'Available upon request'}
`).join('\n');

    const skillsGrouped = (skills || []).map((s) => `${s.name} (${s.category?.name || 'General'}, ${s.proficiency || 85}%)`).join(', ');

    const expList = (experience || []).map((e) => `
- ${e.role} at ${e.company} (${e.duration || 'Past'}): ${e.description || ''}
  Achievements: ${(e.achievements || []).join('; ')}
`).join('\n');

    const eduList = (education || []).map((ed) => `- ${ed.degree} in ${ed.fieldOfStudy} from ${ed.institution} (${ed.year || ''})`).join('\n');
    const certList = (certifications || []).map((c) => `- ${c.title} by ${c.issuer} (${c.issueDate || ''})`).join('\n');

    return `
You are the official AI Assistant and Digital Twin for ${profileName} (${profileTitle}).
Your purpose is to answer questions from recruiters, clients, and technical leads about ${profileName}'s skills, background, projects, work experience, and design philosophy.

ABOUT ${profileName.toUpperCase()}:
- Name: ${profileName}
- Title: ${profileTitle}
- Bio: ${profileBio}
- Email: ${contactEmail}
- Location: ${contactLocation}

SKILLS & PROFICIENCIES:
${skillsGrouped || 'JavaScript, React, Next.js, Node.js, Express, MongoDB, Tailwind CSS, Three.js'}

WORK EXPERIENCE:
${expList || 'Experienced Full-Stack Web Developer.'}

FEATURED PROJECTS:
${projectList || 'Multiple full-stack and modern frontend applications.'}

EDUCATION & CERTIFICATIONS:
Education:
${eduList || 'Engineering background'}
Certifications:
${certList || 'Certified Full-Stack Developer'}

INSTRUCTIONS FOR YOUR RESPONSES:
1. Always be polite, highly professional, articulate, and enthusiastic.
2. Present ${profileName} in the best possible light while remaining completely truthful to the facts provided above.
3. If a user asks about specific technologies, cite the exact projects where ${profileName} applied them.
4. If a user asks something completely outside ${profileName}'s portfolio (e.g. general trivia, unrelated homework), gently redirect back to ${profileName}'s engineering work and provide his contact email (${contactEmail}).
5. Keep answers well-structured using markdown bullets and bold text for readability.
`.trim();
  } catch (err) {
    console.error('[AI Service] Grounding error:', err);
    return `You are the AI Assistant for Chakit Sharma, Full-Stack Developer. Answer questions professionally.`;
  }
}

/**
 * Grounded Portfolio Chatbot
 */
async function chatWithPortfolio(history = [], message = '') {
  const client = getGenAIClient();
  const systemInstruction = await getPortfolioGroundingContext();

  if (client) {
    try {
      // Format chat contents for Gemini
      const contents = [];
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents,
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          temperature: 0.7,
          maxOutputTokens: 800
        }
      });

      const text = response.text?.() || response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed, falling back to heuristic assistant:', err.message);
    }
  }

  // Fallback response generator if API key is missing or quota is exceeded
  return generateHeuristicChatResponse(message);
}

/**
 * Heuristic fallback for chat when no Gemini key is active
 */
async function generateHeuristicChatResponse(message) {
  const lower = (message || '').toLowerCase();
  const [projects, skills, settings] = await Promise.all([
    Project.find({ status: 'published' }).limit(4).lean(),
    Skill.find({ visible: true }).limit(10).lean(),
    SiteSettings.findOne().lean()
  ]);

  const name = settings?.profile?.name || 'Chakit Sharma';
  const email = settings?.contact?.email || 'chakitsharma7@gmail.com';
  const skillNames = (skills || []).map((s) => s.name).join(', ');

  if (lower.includes('skill') || lower.includes('stack') || lower.includes('technology') || lower.includes('tech')) {
    return `**${name}'s Core Skills & Stack:**\n\n${name} specializes in modern full-stack development with a strong emphasis on interactive UI/UX. Key technologies include **${skillNames || 'Next.js, React, Node.js, Express, MongoDB, Three.js, Tailwind CSS'}**.\n\nWould you like to know how any of these were applied in a specific project?`;
  }

  if (lower.includes('project') || lower.includes('built') || lower.includes('portfolio') || lower.includes('work')) {
    const list = (projects || []).map((p) => `• **${p.title}**: ${p.summary} *(Tech: ${(p.techStack || []).slice(0, 3).join(', ')})*`).join('\n');
    return `Here are some of **${name}'s standout projects**:\n\n${list || '• Full-stack Next.js and Express applications.'}\n\nYou can explore deep-dive case studies for each of these in the **Projects** section!`;
  }

  if (lower.includes('hire') || lower.includes('contact') || lower.includes('email') || lower.includes('reach') || lower.includes('call')) {
    return `**Why hire ${name}?**\n\n${name} brings an end-to-end full-stack mindset: high-performance backends (Express, MongoDB, secure auth), modern frontend engineering (Next.js App Router, SSR, Tailwind), and captivating visual aesthetics (Three.js 3D).\n\nYou can reach out directly via **${email}** or use the **Contact Form** below!`;
  }

  return `Hello! I am **${name}'s AI Assistant**. I can answer your questions about his **skills, projects, work experience, and background**.\n\nTry asking:\n- *"What are your top projects?"*\n- *"What is your experience with Next.js and MongoDB?"*\n- *"Why should we hire you?"*`;
}

/**
 * AI Recruiter Job Description Matcher
 */
async function matchJobDescription(jobDescription) {
  const [skills, projects, settings] = await Promise.all([
    Skill.find({ visible: true }).lean(),
    Project.find({ status: 'published' }).lean(),
    SiteSettings.findOne().lean()
  ]);

  const candidateSkills = (skills || []).map((s) => s.name);
  const client = getGenAIClient();

  if (client) {
    try {
      const prompt = `
You are a senior technical recruiter and talent evaluator evaluating candidate ${settings?.profile?.name || 'Chakit Sharma'} against a job description.

CANDIDATE PROFILE:
Name: ${settings?.profile?.name || 'Chakit Sharma'}
Title: ${settings?.profile?.title || 'Full-Stack Developer'}
Skills: ${candidateSkills.join(', ')}
Key Projects: ${(projects || []).map((p) => `${p.title} (slug: ${p.slug}, tech: ${(p.techStack || []).join(', ')})`).join('; ')}

JOB DESCRIPTION:
"""${jobDescription.slice(0, 3000)}"""

Evaluate candidate match. Return ONLY a valid JSON object matching this schema:
{
  "matchScore": <number between 40 and 98 based on realistic alignment>,
  "summary": "<2-sentence executive summary of candidate fit for this exact role>",
  "matchedSkills": ["<skill 1>", "<skill 2>", ...],
  "missingOrGrowthSkills": ["<skill or requirement they might need to ramp up on>"],
  "recommendedProjects": [
    {
      "title": "<Project title from candidate's list>",
      "slug": "<project slug>",
      "reason": "<one sentence on why this project proves the relevant competencies>"
    }
  ],
  "verdict": "<Strong Match | Excellent Potential | Great Fit>"
}
`;
      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const raw = response.text?.() || response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[AI Service] Job matcher Gemini error:', err.message);
    }
  }

  // Fallback heuristic matcher
  const jdLower = (jobDescription || '').toLowerCase();
  const matched = candidateSkills.filter((s) => jdLower.includes(s.toLowerCase()));
  const missing = ['Docker / Kubernetes', 'GraphQL', 'AWS / Cloud Architecture'].filter((s) => jdLower.includes(s.toLowerCase()) && !candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase()));
  
  const score = Math.min(96, Math.max(50, Math.round(55 + (matched.length / Math.max(1, candidateSkills.length)) * 40)));
  const recProjects = (projects || []).slice(0, 2).map((p) => ({
    title: p.title,
    slug: p.slug,
    reason: `Demonstrates mastery of ${(p.techStack || []).slice(0, 3).join(', ')} applicable to this position.`
  }));

  return {
    matchScore: score,
    summary: `${settings?.profile?.name || 'Chakit'} shows strong alignment with ${matched.length > 0 ? matched.slice(0, 4).join(', ') : 'modern web development requirements'}.`,
    matchedSkills: matched.length ? matched : ['JavaScript', 'React', 'Node.js', 'REST APIs'],
    missingOrGrowthSkills: missing.length ? missing : ['Specialized enterprise tooling'],
    recommendedProjects: recProjects,
    verdict: score >= 80 ? 'Strong Match' : 'Great Fit'
  };
}

/**
 * Summarize Project for different audiences (TLDR / Technical / Simple)
 */
async function summarizeProject(project, mode = 'tldr') {
  const client = getGenAIClient();
  const modePrompts = {
    tldr: 'Provide a crisp 3-bullet executive summary (under 60 words total) focused on business impact and primary technology for busy recruiters.',
    technical: 'Provide a technical deep-dive (under 120 words) explaining the architecture, state management, API design, and performance optimizations.',
    simple: 'Explain this project in friendly layman terms with a simple real-world analogy (under 70 words) for non-technical stakeholders.'
  };

  if (client) {
    try {
      const prompt = `
Project Title: ${project.title}
Summary: ${project.summary}
Tech Stack: ${(project.techStack || []).join(', ')}
Description: ${project.description || ''}
Features: ${(project.features || []).join('; ')}
Challenges: ${(project.challenges || []).join('; ')}
Solutions: ${(project.solutions || []).join('; ')}

Task: ${modePrompts[mode] || modePrompts.tldr}
Respond directly in clean markdown without meta chatter.
`;
      const res = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.5, maxOutputTokens: 300 }
      });
      const text = res.text?.() || res.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err) {
      console.warn('[AI Service] Summarize project error:', err.message);
    }
  }

  // Fallback
  if (mode === 'technical') {
    return `**Architecture & Stack:** Built with ${(project.techStack || []).join(', ')}. Implements clean modular controllers, secure error-handling boundaries, and responsive client-side state caching for smooth UI transitions.`;
  }
  if (mode === 'simple') {
    return `Think of this project as a smart digital workspace: it takes complex information and organizes it into an effortless, easy-to-use interface so users can accomplish their goals without friction.`;
  }
  return `• **Core Value**: ${project.summary}\n• **Tech Applied**: ${(project.techStack || []).join(', ')}\n• **Key Outcome**: Production-grade implementation with zero downtime architecture.`;
}

/**
 * Admin: Generate Case Study writeup from basic inputs
 */
async function generateCaseStudy({ title, roughNotes, techStack }) {
  const client = getGenAIClient();
  const stack = Array.isArray(techStack) ? techStack.join(', ') : (techStack || 'Next.js, Node.js, Express, MongoDB, Tailwind CSS');

  if (client) {
    try {
      const prompt = `
You are an expert technical portfolio writer. Create a detailed case study for a developer project.

Project Title: "${title}"
Tech Stack: "${stack}"
Notes / Ideas: "${roughNotes || 'Full-stack application with modern architecture, responsive UI, and secure APIs.'}"

Return ONLY a JSON object with this exact schema:
{
  "summary": "<1-sentence crisp summary, max 140 chars>",
  "description": "<2 well-written paragraphs explaining the motivation, architectural design, and implementation>",
  "features": [
    "<Key feature 1>",
    "<Key feature 2>",
    "<Key feature 3>",
    "<Key feature 4>"
  ],
  "challenges": [
    "<Engineering challenge 1: e.g. state management or latency>",
    "<Engineering challenge 2: e.g. database schema or auth security>"
  ],
  "solutions": [
    "<Solution for challenge 1>",
    "<Solution for challenge 2>"
  ],
  "suggestedTechStack": ["<Tech 1>", "<Tech 2>", "<Tech 3>", "<Tech 4>", "<Tech 5>"]
}
`;
      const res = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0.4 }
      });
      const raw = res.text?.() || res.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('[AI Service] Generate case study error:', err.message);
    }
  }

  // Fallback template
  return {
    summary: `${title} is a scalable full-stack web application designed for high performance and seamless user experience.`,
    description: `${title} was engineered to address common bottlenecks in workflow management by combining modern reactive frontends with decoupled REST services. The application emphasizes clean separation of concerns and robust data validation.\n\nOn the backend, robust schemas and defensive error-handling ensure reliable uptime, while the frontend delivers fluid animations and intuitive navigation.`,
    features: [
      'Responsive, accessible user interface with modern design tokens',
      'Secure RESTful API integration with comprehensive input sanitization',
      'Real-time state updates and optimized rendering cycles',
      'Scalable database models with indexing for sub-100ms query performance'
    ],
    challenges: [
      'Minimizing frontend re-renders during high-frequency user interactions',
      'Ensuring strict data integrity and preventing unauthorized state mutations'
    ],
    solutions: [
      'Implemented memoized component tree boundaries and debounce filters',
      'Applied server-side role validation, CSRF verification, and schema constraints'
    ],
    suggestedTechStack: stack.split(',').map((s) => s.trim()).filter(Boolean)
  };
}

/**
 * Admin: Generate Smart Email Reply Draft
 */
async function generateEmailReply({ name, email, subject, message, tone = 'professional' }) {
  const client = getGenAIClient();
  const settings = await SiteSettings.findOne().lean();
  const ownerName = settings?.profile?.name || 'Chakit Sharma';

  const toneGuides = {
    professional: 'Formal, polite, appreciative, and clear.',
    enthusiastic: 'Warm, highly energetic, welcoming, and excited to collaborate.',
    brief: 'Concise, direct, and under 4 sentences.'
  };

  if (client) {
    try {
      const prompt = `
You are drafting an email reply on behalf of developer ${ownerName}.

INCOMING INQUIRY:
From: ${name} <${email}>
Subject: "${subject || 'General Inquiry'}"
Message:
"""${message}"""

Requested Tone: ${tone} (${toneGuides[tone] || toneGuides.professional})

Analyze the message and return ONLY a JSON object:
{
  "detectedIntent": "<Recruitment / Hiring | Freelance Project | Technical Question | Collaboration | Spam / Irrelevant>",
  "leadPriority": "<High | Medium | Low>",
  "suggestedSubject": "Re: ${subject || 'Your inquiry to ' + ownerName}",
  "replyBody": "<Full email reply text, greeting ${name} and signed by ${ownerName}>"
}
`;
      const res = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0.5 }
      });
      const raw = res.text?.() || res.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('[AI Service] Reply generator error:', err.message);
    }
  }

  // Fallback
  return {
    detectedIntent: 'Collaboration / Inquiry',
    leadPriority: 'Medium',
    suggestedSubject: `Re: ${subject || 'Thank you for reaching out'}`,
    replyBody: `Hi ${name},\n\nThank you for reaching out and for your interest in my work! I received your message regarding "${subject || 'your project'}" and would love to connect further.\n\nCould you share a bit more detail, or would you prefer a quick 15-minute call this week to discuss?\n\nBest regards,\n${ownerName}`
  };
}

/**
 * Admin: Polish Bio or Tagline
 */
async function polishText({ text, targetType = 'bio', tone = 'modern' }) {
  const client = getGenAIClient();

  if (client) {
    try {
      const prompt = `
Rewrite and elevate this developer ${targetType} into a magnetic, high-impact version for a modern engineering portfolio.
Original: "${text}"
Target Type: ${targetType}
Tone: ${tone} (impactful, technical yet approachable, strong action verbs, no cheesy buzzwords)

Return ONLY a JSON object:
{
  "polishedText": "<the primary polished version>",
  "alternativeOptions": [
    "<alternative 1 (e.g. more technical)>",
    "<alternative 2 (e.g. more punchy/concise)>"
  ]
}
`;
      const res = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0.6 }
      });
      const raw = res.text?.() || res.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('[AI Service] Polish text error:', err.message);
    }
  }

  return {
    polishedText: text ? text.trim() : 'Passionate Full-Stack Developer specializing in high-performance web applications and fluid interactive experiences.',
    alternativeOptions: [
      'Engineering resilient digital products with modern web technologies, seamless UX, and scalable backend architecture.',
      'Full-Stack Engineer turning complex technical challenges into elegant, intuitive applications.'
    ]
  };
}

module.exports = {
  getPortfolioGroundingContext,
  chatWithPortfolio,
  matchJobDescription,
  summarizeProject,
  generateCaseStudy,
  generateEmailReply,
  polishText
};
