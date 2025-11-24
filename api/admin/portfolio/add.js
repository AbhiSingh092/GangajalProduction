// Add new portfolio item endpoint - uses main portfolio.js
import { addPortfolioItem } from '../../portfolio.js';

// Simple token validation
const validateAdminToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === 'admin-token-secret';
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Validate admin token
    if (!validateAdminToken(req)) {
      return res.status(401).json({ error: 'Invalid or missing authorization token' });
    }

    // Parse request body manually for Vercel
    let body = {};
    try {
      if (req.body && typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else if (req.body && typeof req.body === 'object') {
        body = req.body;
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { title, category, imageUrl, description } = body;
    
    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: 'title, category, and imageUrl are required' });
    }

    const newItem = addPortfolioItem({
      title,
      category,
      imageUrl,
      description: description || ''
    });

    console.log('[Portfolio Add] Added new item:', newItem);
    return res.status(200).json(newItem);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}