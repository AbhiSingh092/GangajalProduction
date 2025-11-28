// Simple test to check if Cloudinary has any images at all
export default async function handler(req, res) {
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
  
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: 'Missing Cloudinary credentials' });
  }

  try {
    const listUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image?max_results=10`;
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    const response = await fetch(listUrl, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (!response.ok) {
      return res.status(500).json({ 
        error: 'Cloudinary API failed', 
        status: response.status 
      });
    }

    const data = await response.json();
    
    return res.json({
      success: true,
      totalImages: data.resources?.length || 0,
      recentImages: data.resources?.slice(0, 5).map(r => ({
        public_id: r.public_id,
        created_at: r.created_at,
        tags: r.tags,
        folder: r.folder
      })) || [],
      message: data.resources?.length > 0 ? 
        `Found ${data.resources.length} images in Cloudinary` : 
        'No images found in Cloudinary'
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    });
  }
}