const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`[Server] Express API server running on port ${env.PORT} (${env.NODE_ENV})`);
      console.log(`[Server] Health check: http://localhost:${env.PORT}/api/v1/health`);
    });
  } catch (err) {
    console.error(`[Server] Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Express server entry point
startServer();
