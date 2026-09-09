const readline = require('readline');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const getCliArg = (flag) => {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return null;
};

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const run = async () => {
  try {
    await connectDB();

    let username = getCliArg('--username') || process.env.ADMIN_USERNAME;
    let email = getCliArg('--email') || process.env.ADMIN_EMAIL;
    let password = getCliArg('--password') || process.env.ADMIN_PASSWORD;

    if (!username) {
      username = await askQuestion('Enter Admin Username (default: admin): ');
      if (!username) username = 'admin';
    }

    if (!email) {
      email = await askQuestion('Enter Admin Email (default: admin@portfolio.local): ');
      if (!email) email = 'admin@portfolio.local';
    }

    if (!password) {
      password = await askQuestion('Enter Admin Password (min 8 chars): ');
    }

    if (!password || password.length < 8) {
      console.error('[Error] Password is required and must be at least 8 characters.');
      process.exit(1);
    }

    const passwordHash = await Admin.hashPassword(password);

    const existingAdmin = await Admin.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (existingAdmin) {
      existingAdmin.username = username.toLowerCase();
      existingAdmin.email = email.toLowerCase();
      existingAdmin.passwordHash = passwordHash;
      await existingAdmin.save();
      console.log(`[Success] Updated existing administrator account: "${username}" (${email})`);
    } else {
      const newAdmin = await Admin.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash
      });
      console.log(`[Success] Created administrator account: "${newAdmin.username}" (${newAdmin.email})`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`[Error] Failed to create administrator: ${error.message}`);
    process.exit(1);
  }
};

run();
