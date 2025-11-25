// Add portfolio item endpoint - metadata now stored directly in Cloudinary during upload
// This endpoint is simplified since upload.js handles everything

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

    // Since metadata is now stored in Cloudinary during upload,
    // we just return success - the image is already in the portfolio
    const responseItem = {
      title,
      category, 
      imageUrl,
      description: description || '',
      message: 'Item added successfully to Cloudinary portfolio'
    };

    console.log('[Portfolio Add] Confirmed item in Cloudinary:', responseItem);
    return res.status(200).json(responseItem);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}