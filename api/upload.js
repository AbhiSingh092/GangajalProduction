// Upload endpoint - returns upload signature for client-side Cloudinary upload
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Cloudinary credentials are available
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ 
        error: 'Server credentials not configured',
        details: 'Cloudinary API credentials are missing. Please add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to environment variables.' 
      });
    }

    const { category = 'uncategorized' } = req.body;
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create upload signature for Cloudinary
    const uploadParams = {
      timestamp: timestamp,
      tags: category,
      context: `category=${category}`,
    };

    // Generate signature
    const sortedParams = Object.keys(uploadParams)
      .sort()
      .map(key => `${key}=${uploadParams[key]}`)
      .join('&');
    
    const signature = crypto
      .createHash('sha1')
      .update(sortedParams + process.env.CLOUDINARY_API_SECRET)
      .digest('hex');

    // Return upload configuration for client-side upload
    return res.status(200).json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUD_NAME || 'dcsc5ij9o',
      tags: category,
      context: `category=${category}`,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME || 'dcsc5ij9o'}/image/upload`
    });

  } catch (error) {
    console.error('Upload signature generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate upload signature', 
      details: error.message 
    });
  }
}