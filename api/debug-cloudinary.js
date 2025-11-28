// Debug endpoint to check what's in Cloudinary
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  console.log('[Debug Cloudinary] Endpoint called to check Cloudinary contents');

  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUD_NAME } = process.env;
  
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUD_NAME) {
    return res.status(500).json({ 
      error: 'Missing Cloudinary credentials' 
    });
  }

  try {
    // Get all resources with context data
    const listUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?context=true&tags=true&max_results=100`;
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
    
    // Analyze categories like portfolio.js does
    const categoryAnalysis = {
      product: [],
      fashion: [],
      event: [], 
      travel: [],
      commercial: [],
      uncategorized: []
    };
    
    const detailedResources = data.resources?.map((resource, index) => {
      const context = resource.context || {};
      const title = context.title || resource.public_id.split('/').pop() || `Image ${index + 1}`;
      
      // Same category detection logic as portfolio.js
      let category = 'uncategorized';
      
      if (context.category) {
        category = context.category.toLowerCase().trim();
      } else if (resource.tags && resource.tags.length > 0) {
        const validCategories = ['product', 'fashion', 'event', 'travel', 'commercial'];
        const foundCategory = resource.tags.find(tag => 
          validCategories.includes(tag.toLowerCase().trim())
        );
        if (foundCategory) {
          category = foundCategory.toLowerCase().trim();
        }
      }
      
      // Normalize category variations
      if (category.includes('travel') || category.includes('lifestyle')) {
        category = 'travel';
      }
      if (category.includes('commercial')) {
        category = 'commercial';
      }
      
      // Add to category analysis
      if (categoryAnalysis[category]) {
        categoryAnalysis[category].push(title);
      } else {
        categoryAnalysis.uncategorized.push(title);
      }
      
      return {
        public_id: resource.public_id,
        folder: resource.folder,
        tags: resource.tags,
        context: context,
        title: title,
        detectedCategory: category,
        created_at: resource.created_at,
        secure_url: resource.secure_url
      };
    }) || [];
    
    return res.status(200).json({
      total: data.resources?.length || 0,
      categoryBreakdown: Object.fromEntries(
        Object.entries(categoryAnalysis).map(([cat, items]) => [cat, items.length])
      ),
      categoryDetails: categoryAnalysis,
      resources: detailedResources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Debug check failed', 
      details: error.message 
    });
  }
}