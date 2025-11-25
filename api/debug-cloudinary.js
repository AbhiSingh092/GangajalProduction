
// Debug endpoint to check what's in Cloudinary
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUD_NAME } = process.env;
  
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUD_NAME) {
    return res.status(500).json({ 
      error: 'Missing Cloudinary credentials' 
    });
  }

  try {
    // Get all resources (no search filters)
    const listUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image`;
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    const response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ 
        error: 'Cloudinary list failed', 
        details: `HTTP ${response.status}: ${errorText}` 
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      total: data.resources?.length || 0,
      resources: data.resources?.map(r => ({
        public_id: r.public_id,
        folder: r.folder,
        tags: r.tags,
        created_at: r.created_at,
        secure_url: r.secure_url
      })) || []
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Debug check failed', 
      details: error.message 
    });
  }
}