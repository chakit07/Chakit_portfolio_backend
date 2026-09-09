const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Admin = require('../models/Admin');
const SiteSettings = require('../models/SiteSettings');
const ProjectCategory = require('../models/ProjectCategory');
const Project = require('../models/Project');
const SkillCategory = require('../models/SkillCategory');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const SocialLink = require('../models/SocialLink');

/*
 * Customized using your resume and LinkedIn PDF.
 *
 * LinkedIn details used where the documents differ:
 * - CWL: Full Stack Engineer, February–August 2026.
 * - iCtrlBiz: Internship Trainee, Noida.
 *
 * Missing project URLs, images, certification metadata,
 * and school dates are left blank.
 *
 * Your existing backend setup must load environment variables.
 * Model definitions were not supplied, so check that missing
 * metadata fields are optional in your schemas.
 */

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Connected to MongoDB.');

    // 1. Admin
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      const password = process.env.ADMIN_PASSWORD;
      const email = process.env.ADMIN_EMAIL;

      if (!password || !email) {
        throw new Error(
          'Set ADMIN_EMAIL and ADMIN_PASSWORD before creating the initial admin.'
        );
      }

      const passwordHash = await Admin.hashPassword(password);

      await Admin.create({
        username: 'admin',
        email,
        passwordHash
      });

      console.log('[Seed] Created initial admin.');
    } else {
      console.log('[Seed] Admin already exists. Skipping.');
    }

    // 2. Site settings
    const existingSettings = await SiteSettings.findOne();

    if (!existingSettings) {
      await SiteSettings.create({
        profile: {
          name: 'Chakit Sharma',

          title: 'Full-Stack Developer | MERN Stack | AI Integration',

          headline:
            'I build full-stack web applications with React, Next.js, Node.js, and MongoDB.',

          bio:
            'I am a full-stack developer with a B.Tech in Computer Science Engineering from IMS Engineering College, affiliated with AKTU (2026, CGPA 7.8). At CWL Technology, I developed Kiddocracy end-to-end, built REST APIs, and improved YBF frontend performance. During my internship at iCtrlBiz Consulting, I built responsive React interfaces and contributed to a project management system with real-time features. I also build AI-integrated applications, including an expense tracker and Eco-Pilot. My earlier Data Science with Python training at ShapeMySkills strengthened my skills in data analysis and visualization.',

          location: 'Ghaziabad, Uttar Pradesh, India',

          currentFocus:
            'Full-stack web development, REST APIs, AI integration, and data structures and algorithms',

          availabilityStatus: '',
          profileImage: '',
          logoText: 'CS.',
          logoImage: '',

          roles: [
            'Full-Stack Developer',
            'MERN Stack Developer',
            'React & Next.js Developer',
            'AI Integration Enthusiast'
          ],

          stats: [
            {
              label: 'LeetCode Problems Solved',
              value: '200+'
            },
            {
              label: 'HackerRank Java Rating',
              value: '5 Stars'
            },
            {
              label: 'CodeChef Problems Solved',
              value: '500+'
            },
            {
              label: 'B.Tech CGPA',
              value: '7.8'
            }
          ],

          resumeUrl: process.env.PORTFOLIO_RESUME_URL || '',
          resumeButtonVisible: Boolean(process.env.PORTFOLIO_RESUME_URL),

          contactEmail: 'chakitsharma7@gmail.com',
          contactPhone: '+91 9411952472'
        },

        seo: {
          siteTitle:
            'Chakit Sharma — Full-Stack Developer | MERN Stack | AI Integration',

          siteDescription:
            'Chakit Sharma, full-stack developer working with React, Next.js, Node.js, MongoDB, and AI integration. Explore my projects, experience, and technical skills.',

          keywords: [
            'Full-Stack Developer',
            'Next.js',
            'Node.js',
            'Express',
            'MongoDB',
            'AI Integration',
            'React'
          ],

          ogImage: '',
          favicon: ''
        },

        appearance: {
          accentColor: '#3b82f6',
          defaultTheme: 'dark'
        },

        sections: [
          {
            id: 'hero',
            name: 'Hero',
            order: 1,
            visible: true
          },
          {
            id: 'about',
            name: 'About',
            order: 2,
            visible: true
          },
          {
            id: 'skills',
            name: 'Skills',
            order: 3,
            visible: true
          },
          {
            id: 'experience',
            name: 'Experience',
            order: 4,
            visible: true
          },
          {
            id: 'projects',
            name: 'Projects',
            order: 5,
            visible: true
          },
          {
            id: 'education',
            name: 'Education & Certifications',
            order: 6,
            visible: true
          },
          {
            id: 'contact',
            name: 'Contact',
            order: 7,
            visible: true
          }
        ],

        visualEffects: {
          enabled: true,
          preset: 'laptop',
          accentColor: '#6366f1',
          intensity: 1.0,
          particles: true,
          cardTilt: true,
          enableOnMobile: false,
          fallbackImage: ''
        },

        footer: {
          text:
            'Engineered with Next.js, Node.js Express, Three.js, and MongoDB.',

          copyright: '© 2026 Chakit Sharma. All rights reserved.'
        }
      });

      console.log('[Seed] Created site settings.');
    } else {
      console.log('[Seed] Site settings already exist. Skipping.');
    }

    // 3. Project category
    let catFullStack = await ProjectCategory.findOne({
      slug: 'full-stack-web'
    });

    if (!catFullStack) {
      catFullStack = await ProjectCategory.create({
        name: 'Full-Stack Web',
        slug: 'full-stack-web',
        order: 1
      });
    }

    // 4. Projects
    if ((await Project.countDocuments()) === 0) {
      await Project.create([
        {
          title: 'Kiddocracy',
          slug: 'kiddocracy',

          summary:
            'Developed and shipped an end-to-end web platform at CWL Technology.',

          description:
            'Owned development from initial architecture through production deployment at CWL Technology.',

          thumbnail: '',
          gallery: [],

          techStack: [
            'Next.js',
            'Tailwind CSS',
            'MongoDB',
            'REST APIs',
            'WebSockets',
            'AWS S3'
          ],

          category: catFullStack._id,
          liveUrl: '',
          repoUrl: '',
          featured: true,
          status: 'published',
          order: 1,

          features: [
            'End-to-end application development',
            'Production deployment',
            'Responsive web interfaces'
          ],

          challenges: [],
          solutions: []
        },

        {
          title: 'Expense Tracker with AI Insights',
          slug: 'expense-tracker-ai-insights',

          summary:
            'Track, categorize, and analyze expenses with AI-powered insights.',

          description:
            'Built a full-stack MERN application with Gemini-powered financial insights, interactive dashboards, and downloadable reports.',

          thumbnail: '',
          gallery: [],

          techStack: [
            'React.js',
            'Node.js',
            'Express.js',
            'MongoDB',
            'Firebase',
            'Gemini API',
            'Recharts'
          ],

          category: catFullStack._id,
          liveUrl: '',
          repoUrl: '',
          featured: true,
          status: 'published',
          order: 2,

          features: [
            'Expense tracking and categorization',
            'AI-powered financial insights',
            'Interactive Recharts dashboards',
            'PDF and Excel report export'
          ],

          challenges: [],
          solutions: []
        },

        {
          title: 'Eco-Pilot — AI-Powered Carbon Footprint Tracker',
          slug: 'eco-pilot',

          summary:
            'Analyze lifestyle inputs and receive personalized emission-reduction recommendations.',

          description:
            'Built an AI-integrated carbon-footprint tracking application with REST APIs for carbon data ingestion, processing, and retrieval.',

          thumbnail: '',
          gallery: [],

          techStack: [
            'React.js',
            'Node.js',
            'Express.js',
            'MongoDB',
            'AI Integration'
          ],

          category: catFullStack._id,
          liveUrl: '',
          repoUrl: '',
          featured: true,
          status: 'published',
          order: 3,

          features: [
            'Lifestyle-based carbon footprint analysis',
            'Personalized emission-reduction recommendations',
            'RESTful carbon data APIs'
          ],

          challenges: [],
          solutions: []
        },

        {
          title: 'Project Management System',
          slug: 'project-management-system',

          summary:
            'Contributed to a real-time project management system during my iCtrlBiz internship.',

          description:
            'Contributed React interfaces and real-time collaboration features for a system managing projects from initiation through client delivery.',

          thumbnail: '',
          gallery: [],

          techStack: [
            'React.js',
            'HTML',
            'CSS',
            'JavaScript',
            'REST APIs',
            'WebSockets'
          ],

          category: catFullStack._id,
          liveUrl: '',
          repoUrl: '',
          featured: false,
          status: 'published',
          order: 4,

          features: [
            'Role-based access for admins, managers, employees, and clients',
            'Hierarchical task assignment',
            'Independent real-time task progress updates',
            'WebSocket-based live chat'
          ],

          challenges: [],
          solutions: []
        },

        {
          title: 'YBF — API Development and Frontend Optimization',
          slug: 'ybf',

          summary:
            'Built REST APIs and improved the Google PageSpeed score from 46 to 80.',

          description:
            'Contributed REST API development and frontend performance optimization at CWL Technology.',

          thumbnail: '',
          gallery: [],

          techStack: ['REST APIs'],

          category: catFullStack._id,
          liveUrl: '',
          repoUrl: '',
          featured: false,
          status: 'published',
          order: 5,

          features: [
            'REST API development and integration',
            'Frontend delivery optimization',
            'Google PageSpeed improvement from 46 to 80'
          ],

          challenges: [],
          solutions: []
        }
      ]);

      console.log('[Seed] Created projects.');
    }

    // 5. Skills
    // Proficiency ratings are omitted because they were not supplied.
    const skillGroups = {
      Languages: [
        'JavaScript (ES6+)',
        'Java',
        'Python'
      ],

      Frontend: [
        'React.js',
        'Next.js',
        'Redux',
        'HTML5',
        'CSS3',
        'Tailwind CSS',
        'Recharts'
      ],

      Backend: [
        'Node.js',
        'Express.js',
        'RESTful API Design',
        'JWT Authentication',
        'WebSockets'
      ],

      Databases: [
        'MongoDB',
        'MySQL',
        'Firebase'
      ],

      'AI & API Integrations': [
        'Gemini API',
        'Twilio',
        'Stripe',
        'REST API Integration'
      ],

      'Tools & Deployment': [
        'Git',
        'GitHub',
        'Vercel',
        'Render',
        'AWS Fundamentals',
        'AWS Elastic Beanstalk',
        'Postman',
        'AWS S3'
      ]
    };

    const seedSkills = (await Skill.countDocuments()) === 0;
    let categoryOrder = 1;

    for (const [name, names] of Object.entries(skillGroups)) {
      let category = await SkillCategory.findOne({ name });

      if (!category) {
        category = await SkillCategory.create({
          name,
          order: categoryOrder
        });
      }

      if (seedSkills) {
        await Skill.create(
          names.map((skillName, index) => ({
            name: skillName,
            category: category._id,
            order: index + 1,
            visible: true
          }))
        );
      }

      categoryOrder += 1;
    }

    // 6. Experience
    if ((await Experience.countDocuments()) === 0) {
      await Experience.create([
        {
          company: 'CWL Technology Private Limited',
          role: 'Full Stack Engineer',
          location: 'Noida',
          startDate: 'Feb 2026',
          endDate: 'Aug 2026',
          isCurrent: false,

          description:
            'Developed production web applications, REST APIs, and responsive Next.js interfaces.',

          bullets: [
            'Developed and shipped Kiddocracy end-to-end, from architecture through production deployment.',
            'Built and integrated REST APIs for YBF and improved the Google PageSpeed performance score from 46 to 80.',
            'Built Node.js and MongoDB REST APIs alongside a Flutter engineer for a rewards-based mobile application.',
            'Documented endpoints using Postman collections and managed version control through GitHub.',
            'Developed reusable, responsive Next.js interfaces.'
          ],

          website: '',
          order: 1
        },

        {
          company: 'iCtrlBiz Consulting Pvt Ltd',
          role: 'Internship Trainee',
          employmentType: 'Internship',
          location: 'Noida',
          startDate: 'Jun 2025',
          endDate: 'Dec 2025',
          isCurrent: false,

          description:
            'Built responsive React interfaces and contributed to production projects, including a Project Management System.',

          bullets: [
            'Translated design specifications into responsive React pages and reusable components.',
            'Contributed to a Project Management System with role-based access for Super Admin, Sub Admin, Managers, Employees, and Clients.',
            'Implemented tree-structured task assignment with independent real-time progress updates.',
            'Integrated WebSocket-based live chat for project communication, task assignment, and requirements sharing.'
          ],

          website: '',
          order: 2
        },

        {
          company: 'Future Intern',
          role: 'Intern',
          employmentType: 'Internship',
          location: 'Ghaziabad, Uttar Pradesh, India',
          startDate: 'Sep 2024',
          endDate: 'Oct 2024',
          isCurrent: false,
          description: '',
          bullets: [],
          website: '',
          order: 3
        },

        {
          company: 'ShapeMySkills Pvt. Ltd.',
          role: 'Technical Trainee',
          location: 'Ghaziabad, Uttar Pradesh, India',
          startDate: 'Jan 2024',
          endDate: 'Mar 2024',
          isCurrent: false,

          description:
            'Completed technical training in Data Science with Python.',

          bullets: [
            'Worked on Python-based data manipulation, analysis, and visualization.'
          ],

          website: '',
          order: 4
        }
      ]);

      console.log('[Seed] Created experience entries.');
    }

    // 7. Education
    if ((await Education.countDocuments()) === 0) {
      await Education.create([
        {
          institution: 'IMS Engineering College, Ghaziabad',
          degree: 'Bachelor of Technology (B.Tech)',
          field: 'Computer Science Engineering',
          startDate: 'Sep 2022',
          endDate: 'Sep 2026',

          description:
            'Affiliated with Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow. CGPA: 7.8. No active backlogs, as stated in the resume.',

          order: 1
        },

        {
          institution: 'Carmel Public School - India',
          degree: 'Intermediate',
          field: '',
          startDate: '',
          endDate: '',
          description: '',
          order: 2
        },

        {
          institution: 'Carmel Public School - India',
          degree: 'High school',
          field: '',
          startDate: '',
          endDate: '',
          description: '',
          order: 3
        }
      ]);

      console.log('[Seed] Created education records.');
    }

    // 8. Certifications
    // Exact titles from LinkedIn.
    // Missing issuers, dates, and credential details are left blank.
    // AWS APAC is a job simulation, not an AWS certification exam.
    if ((await Certification.countDocuments()) === 0) {
      await Certification.create([
        {
          name: 'AWS APAC - Solutions Architecture Job Simulation',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          credentialUrl: '',
          order: 1
        },

        {
          name: 'React and redux',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          credentialUrl: '',
          order: 2
        },

        {
          name: 'Data science',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          credentialUrl: '',
          order: 3
        }
      ]);

      console.log('[Seed] Created certifications.');
    }

    // 9. Social links
    if ((await SocialLink.countDocuments()) === 0) {
      const links = [
        {
          platform: 'GitHub',
          label: 'GitHub Profile',
          url: process.env.PORTFOLIO_GITHUB_URL || '',
          icon: 'Github',
          order: 1,
          visible: true
        },

        {
          platform: 'LinkedIn',
          label: 'LinkedIn Profile',
          url:
            process.env.PORTFOLIO_LINKEDIN_URL ||
            'https://www.linkedin.com/in/chakitsharma/',
          icon: 'Linkedin',
          order: 2,
          visible: true
        },

        {
          platform: 'LeetCode',
          label: 'LeetCode Profile',
          url: process.env.PORTFOLIO_LEETCODE_URL || '',
          icon: 'Code',
          order: 3,
          visible: true
        },

        {
          platform: 'HackerRank',
          label: 'HackerRank Profile',
          url: process.env.PORTFOLIO_HACKERRANK_URL || '',
          icon: 'Code',
          order: 4,
          visible: true
        },

        {
          platform: 'Email',
          label: 'Send Email',
          url: 'mailto:chakitsharma7@gmail.com',
          icon: 'Mail',
          order: 5,
          visible: true
        }
      ].filter((link) => link.url);

      await SocialLink.create(links);

      console.log('[Seed] Created social links.');
    }

    console.log('[Seed] Database seeding completed successfully.');
    process.exitCode = 0;
  } catch (error) {
    console.error(`[Seed] Error seeding database: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedData();