const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const env = require('../src/config/env');
const Admin = require('../src/models/Admin');

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }
});

test.after(async () => {
  await mongoose.disconnect();
});

test('API Health Check: GET /api/v1/health returns 200 and ok status', async () => {
  const res = await request(app).get('/api/v1/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
  assert.strictEqual(res.body.database, 'connected');
});

test('Public Portfolio: GET /api/v1/public/portfolio returns published projects and excludes drafts', async () => {
  const res = await request(app).get('/api/v1/public/portfolio');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.projects));

  // Check that NO project in public endpoint has status 'draft'
  const draftProjects = res.body.data.projects.filter((p) => p.status === 'draft');
  assert.strictEqual(draftProjects.length, 0, 'Draft projects must not appear in public portfolio');
});

test('Draft Project Visibility: GET /api/v1/public/projects/:slug returns 404 for draft projects', async () => {
  const res = await request(app).get('/api/v1/public/projects/devguard-security-scanner');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

test('Public Contact: POST /api/v1/public/contact validates required fields', async () => {
  const res = await request(app)
    .post('/api/v1/public/contact')
    .send({ name: 'Tester', email: 'invalid-email', subject: 'Test', message: 'Hello' });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('Public Contact: Honeypot silently drops spam submission with 200 response', async () => {
  const res = await request(app)
    .post('/api/v1/public/contact')
    .send({
      name: 'SpamBot',
      email: 'bot@spam.com',
      subject: 'Buy Crypto',
      message: 'Click this link',
      _hp_field: 'http://spam-site.com'
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
});

test('Auth Security: Protected endpoints return 401 when unauthenticated', async () => {
  const res = await request(app).get('/api/v1/dashboard/stats');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('Auth Flow: Login with invalid credentials returns 401', async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: 'admin', password: 'WrongPassword123!' });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('Auth Flow: Successful login sets cookie and grants access to protected routes', async () => {
  // Login with seeded admin
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: 'admin', password: process.env.ADMIN_PASSWORD || 'Admin@123456' });

  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginRes.body.success, true);
  assert.ok(loginRes.headers['set-cookie'], 'Response must set session cookie');

  const cookies = loginRes.headers['set-cookie'];
  const csrfToken = loginRes.body.csrfToken;

  // Verify dashboard stats with auth cookie
  const statsRes = await request(app)
    .get('/api/v1/dashboard/stats')
    .set('Cookie', cookies);

  assert.strictEqual(statsRes.status, 200);
  assert.strictEqual(statsRes.body.success, true);
  assert.ok(typeof statsRes.body.data.counts.projects.total === 'number');

  // Verify CSRF protection on mutation
  const mutationWithoutCsrf = await request(app)
    .post('/api/v1/projects')
    .set('Cookie', cookies)
    .send({ title: 'New Test Project' });

  assert.strictEqual(mutationWithoutCsrf.status, 403, 'Mutation without CSRF token must be rejected with 403');
});

test('AI Suite: GET /api/v1/ai/status returns provider metadata', async () => {
  const res = await request(app).get('/api/v1/ai/status');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.provider, 'Google Gemini');
});

test('AI Suite: POST /api/v1/ai/chat validates inputs and responds', async () => {
  const badRes = await request(app).post('/api/v1/ai/chat').send({ message: '' });
  assert.strictEqual(badRes.status, 400);

  const goodRes = await request(app).post('/api/v1/ai/chat').send({ message: 'What are Chakit skills?' });
  assert.strictEqual(goodRes.status, 200);
  assert.strictEqual(goodRes.body.success, true);
  assert.ok(typeof goodRes.body.data.reply === 'string');
});

test('AI Suite: POST /api/v1/ai/match-job computes candidate fit', async () => {
  const res = await request(app).post('/api/v1/ai/match-job').send({
    jobDescription: 'Looking for a Senior Full-Stack developer with Next.js, Node.js, and MongoDB experience.'
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(typeof res.body.data.matchScore === 'number');
  assert.ok(Array.isArray(res.body.data.matchedSkills));
});

test('AI Suite: Admin AI endpoints require authentication', async () => {
  const csrfRes = await request(app).get('/api/v1/auth/csrf');
  const cookie = csrfRes.headers['set-cookie'];
  const token = csrfRes.body.csrfToken;

  const res = await request(app)
    .post('/api/v1/ai/generate-case-study')
    .set('Cookie', cookie)
    .set('x-csrf-token', token)
    .send({ title: 'Test AI Project' });

  assert.strictEqual(res.status, 401);
});

