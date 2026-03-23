// Vercel serverless function entry point
import serverHandler from '../server.js';

export default async function handler(req, res) {
  await serverHandler(req, res);
}
