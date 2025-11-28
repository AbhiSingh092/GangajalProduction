// Admin portfolio management - uses Cloudinary as database
import { getPortfolioItems, deletePortfolioItem } from '../portfolio.js';

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
  // Validate admin token for all requests
  if (!validateAdminToken(req)) {
    return res.status(401).json({ error: 'Invalid or missing authorization token' });
  }

  if (req.method === 'GET') {
    try {
      console.log('[Admin Portfolio] Loading portfolio items...');
      // Get all portfolio items from Cloudinary
      const items = await getPortfolioItems();
      console.log(`[Admin Portfolio] Retrieved ${items?.length || 0} items`);
      console.log('[Admin Portfolio] Items preview:', items?.slice(0, 2).map(item => ({
        title: item.title,
        category: item.category,
        hasImageUrl: !!item.imageUrl
      })));
      return res.status(200).json(items);
    } catch (error) {
      console.error('[Admin Portfolio] Error loading items:', error);
      console.error('[Admin Portfolio] Error details:', error.message);
      return res.status(500).json({ error: 'Failed to load portfolio items', details: error.message });
    }
  } 
  else if (req.method === 'DELETE') {
    try {
      // Parse request body for delete operation
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

      const { public_id } = body;
      
      if (!public_id) {
        return res.status(400).json({ error: 'public_id is required for deletion' });
      }

      const result = await deletePortfolioItem(public_id);
      console.log('[Admin Portfolio] Deleted item:', public_id);
      return res.status(200).json({ message: 'Item deleted successfully', result });
    } catch (error) {
      console.error('[Admin Portfolio] Error deleting item:', error);
      return res.status(500).json({ error: 'Failed to delete item' });
    }
  }
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}