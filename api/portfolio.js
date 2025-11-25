// Portfolio API - Uses Cloudinary as Database (PERMANENT STORAGE!)
// No more memory arrays - everything stored in Cloudinary metadata

const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUD_NAME } = process.env;

// Helper function to fetch portfolio from Cloudinary
export const getPortfolioItems = async () => {
  try {
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUD_NAME) {
      console.log('Using sample data - Cloudinary credentials not configured');
      return [
        {
          id: 1,
          title: 'Sample Wedding Photography',
          category: 'event', 
          imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop',
          description: 'Beautiful wedding moments captured',
          createdAt: new Date().toISOString()
        }
      ];
    }

    // Search Cloudinary for portfolio images with multiple fallback strategies
    const searchUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`;
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    console.log('[Cloudinary DB] Searching for images...');
    
    // Try multiple search expressions to find images
    const searchExpressions = [
      'folder:gangajal-portfolio', // Exact folder match
      'tags:portfolio',            // By portfolio tag
      'tags:gangajal',            // By any gangajal tag
      'resource_type:image'        // All images as fallback
    ];

    let data = null;
    let searchUsed = '';

    for (const expression of searchExpressions) {
      try {
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            expression: expression,
            with_field: ['context', 'tags'],
            max_results: 100,
            sort_by: [{ created_at: 'desc' }]
          })
        });

        if (response.ok) {
          const searchData = await response.json();
          console.log(`[Cloudinary DB] Search "${expression}" found ${searchData.resources?.length || 0} items`);
          
          if (searchData.resources && searchData.resources.length > 0) {
            data = searchData;
            searchUsed = expression;
            break;
          }
        } else {
          console.log(`[Cloudinary DB] Search "${expression}" failed: ${response.status}`);
        }
      } catch (searchError) {
        console.log(`[Cloudinary DB] Search "${expression}" error:`, searchError.message);
      }
    }

    if (!data || !data.resources) {
      console.log('[Cloudinary DB] No images found with any search method');
      throw new Error('No portfolio images found in Cloudinary');
    }

    console.log(`[Cloudinary DB] Using search: "${searchUsed}" - Found ${data.resources.length} images`);
    
    // Transform Cloudinary data to portfolio format
    const portfolioItems = data.resources.map((resource, index) => {
      console.log(`[Cloudinary DB] Processing image ${index + 1}:`, {
        public_id: resource.public_id,
        tags: resource.tags,
        context: resource.context
      });

      // Parse context metadata
      const context = resource.context || {};
      const title = context.title || resource.public_id.split('/').pop() || `Image ${index + 1}`;
      const description = context.description || '';
      const category = context.category || (resource.tags?.find(tag => tag !== 'portfolio') || 'uncategorized');
      const uploadDate = context.uploadDate || resource.created_at;

      return {
        id: resource.asset_id || resource.public_id.split('/').pop(),
        title,
        category,
        imageUrl: resource.secure_url,
        description,
        createdAt: uploadDate,
        public_id: resource.public_id,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes
      };
    });

    console.log(`[Cloudinary DB] Successfully loaded ${portfolioItems.length} portfolio items`);
    return portfolioItems;

  } catch (error) {
    console.error('[Cloudinary DB] Error fetching portfolio:', error);
    // Return sample data on error
    return [
      {
        id: 'sample-1',
        title: 'Sample Wedding Photography',
        category: 'event', 
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop',
        description: 'Beautiful wedding moments captured',
        createdAt: new Date().toISOString()
      }
    ];
  }
};

// Delete function using Cloudinary API
export const deletePortfolioItem = async (publicId) => {
  try {
    const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    const response = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_id: publicId
      })
    });

    const result = await response.json();
    console.log(`[Cloudinary DB] Deleted item: ${publicId}`, result);
    return result;

  } catch (error) {
    console.error('[Cloudinary DB] Error deleting:', error);
    throw error;
  }
};

// API endpoint handler
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const portfolioData = await getPortfolioItems();
      console.log('[/api/portfolio] Returning', portfolioData.length, 'items from Cloudinary');
      return res.status(200).json(portfolioData);
    } catch (error) {
      console.error('[/api/portfolio] Error:', error);
      return res.status(500).json({ error: 'Failed to load portfolio from Cloudinary' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}