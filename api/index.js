import app from '../server/index.js';

export default async function handler(req, res) {
  // Handle all API routes through the Express app
  return app(req, res);
}