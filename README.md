# Chakit Sharma — Portfolio Backend API

A high-performance, enterprise-grade REST API powering the developer portfolio and admin dashboard. Built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **Multer**, and **Google Gemini AI**.

---

## Key Features & New Add-ons

### 1. Automated Email Notifications (Nodemailer)
- **Instant Inquiry Alerts**: Automatically dispatches a clean, responsive HTML email to the website owner (`EMAIL_USER`) whenever a visitor or recruiter submits a contact form.
- **Professional Minimal Template**: Formats sender details, subject, inquiry message, and includes a direct *"Reply via Email"* CTA button.
- **Flexible SMTP Configuration**: Supports Gmail (via Google App Passwords) or custom SMTP servers (`SMTP_HOST`, `SMTP_PORT`).
- **Non-blocking Resilience**: If email credentials are not configured, incoming messages are still safely stored in MongoDB and an alert is logged to the console without interrupting the user.

### 2. Google Gemini 3.6 AI Engine
- **Upgraded to `gemini-3.6-flash`**: Fully migrated to Google's latest Gemini 3.6 architecture.
- **Context-Grounded Conversational AI**: Powers the public AI Twin chatbot widget (`/api/v1/ai/chat`) with live MongoDB context and custom technical experience prompts (Next.js, MongoDB, Kiddocracy, REST APIs).
- **Recruiter Role-Fit Matcher (`/api/v1/ai/role-matcher`)**: Evaluates job descriptions against candidate skills and projects to calculate compatibility percentages.
- **1-Click Smart Email Reply (`/api/v1/ai/reply-draft`)**: Analyzes inquiry intent (Hiring, Freelance, Collaboration) and drafts professional replies for admin review.
- **AI Case Study Perspectives (`/api/v1/ai/perspectives`)**: Generates 3-way project summaries (Recruiter 30s, Tech Lead Deep Dive, Layman Analogy).

### 3. Education & Academic Performance Scoring
- **Academic Score Metric (`percentageOrCgpa`)**: Added percentage, CGPA, or honors grade support to the `Education` model (`/api/v1/education`) and public portfolio payloads.

### 4. Admin Branding & Dynamic Settings
- **Custom Admin Title & Logo (`adminTitle`, `adminLogoImage`)**: Expanded `SiteSettings` schema to allow full dynamic branding for the admin console sidebar.
- **SEO & Favicon URL (`seo.favicon`)**: Stores uploaded `.ico`, `.png`, or `.svg` favicon paths for dynamic tab branding.
- **Modular Visual & Hero Framing**: Stores 3D scene presets, ambient backgrounds, and hero portrait framing styles.

### 5. Security & Session Architecture
- **Server-Managed Cookie Sessions**: HttpOnly, SameSite, Secure cookie-based authentication with MongoDB session tracking.
- **CSRF Token Validation**: Protected state-changing mutations with custom token exchange (`/api/v1/auth/csrf`).
- **Rate Limiting & Sanitation**: Strict rate limiting on auth and contact endpoints, Mongo-sanitize, and XSS filtering.
- **Media Upload Manager with Deletion Protection**: Multer local storage with automatic reference checks before deleting media.

---

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini API (`@google/genai` with `gemini-3.6-flash`)
- **Email Service**: Nodemailer
- **File Uploads**: Multer
- **Security**: Helmet, CORS, Cookie-Parser, Bcryptjs, Express-Rate-Limit

---

## Directory Structure

```
backend/
├── package.json
├── .env.example
├── .env
├── uploads/                     # Static media uploads
├── src/
│   ├── app.js                   # Express application setup & middleware
│   ├── server.js                # HTTP server bootstrap
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── env.js               # Validated environment configurations
│   ├── models/                  # 11 Mongoose Data Models
│   │   ├── Admin.js             # Admin credentials & hashing
│   │   ├── Session.js           # Server-side auth sessions
│   │   ├── SiteSettings.js      # Hero, SEO, Favicon, Branding, 3D
│   │   ├── Project.js           # Projects & case studies
│   │   ├── ProjectCategory.js   # Project categories
│   │   ├── Skill.js             # Technical skills & proficiency
│   │   ├── SkillCategory.js     # Skill groupings
│   │   ├── Experience.js        # Career history
│   │   ├── Education.js         # Degree, Institute, Percentage/CGPA
│   │   ├── Certification.js     # Credentials & verification links
│   │   ├── ContactMessage.js    # Inquiries & archived messages
│   │   └── SocialLink.js        # GitHub, LinkedIn, etc.
│   ├── controllers/             # Request controllers
│   ├── services/
│   │   ├── aiService.js         # Gemini 3.6 grounding & RAG logic
│   │   └── emailService.js      # Nodemailer SMTP & notification templates
│   ├── middleware/              # Auth, CSRF, upload, rate limiters
│   ├── routes/                  # Versioned API routes (/api/v1)
│   └── utils/
│       ├── seed.js              # Database seeder
│       └── createAdmin.js       # CLI administrator creator
└── tests/
    └── api.test.js              # Automated integration tests
```

---

## Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_db
FRONTEND_URL=http://localhost:3000

SESSION_SECRET=your_32_character_session_secret_key_here
CSRF_SECRET=your_32_character_csrf_secret_key_here
COOKIE_DOMAIN=localhost

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash

# Initial Admin Credentials (Optional for setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here

# Nodemailer Email Notification Settings
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_google_app_password
# Optional custom SMTP:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
```

> **Tip for Gmail Users**: Generate a 16-character App Password at [Google Account App Passwords](https://myaccount.google.com/apppasswords) and set it as `EMAIL_PASS`.

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Database Data
```bash
npm run seed
```

### 3. Create an Administrator Account
```bash
npm run create-admin
# or: node src/utils/createAdmin.js --username admin --email admin@example.com --password YourPassword123!
```

### 4. Start Development Server
```bash
npm run dev
```
The API server will run at `http://localhost:5000`.

### 5. Run Automated Tests
```bash
npm test
```

---

## API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/health` | Service health status | Public |
| `GET` | `/api/v1/public/portfolio` | Full public portfolio data bundle | Public |
| `POST` | `/api/v1/public/contact` | Submit contact form (triggers Nodemailer) | Public (Rate-limited) |
| `POST` | `/api/v1/ai/chat` | Multi-turn AI assistant chat | Public |
| `POST` | `/api/v1/ai/role-matcher` | Recruiter job-fit evaluator | Public |
| `POST` | `/api/v1/auth/login` | Administrator session login | Public |
| `GET` | `/api/v1/auth/me` | Current session verification | Protected |
| `GET` | `/api/v1/settings` | Retrieve site settings & 3D config | Protected |
| `PUT` | `/api/v1/settings` | Update site settings, branding & SEO | Protected |
| `POST` | `/api/v1/media/upload` | Upload images/PDFs (Multer) | Protected |
| `GET` | `/api/v1/messages` | Contact inbox list | Protected |

---

## License
MIT License. Developed by Chakit Sharma.
