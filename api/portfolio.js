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

    // Use direct Cloudinary list API for more reliable results
    const listUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image`;
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    console.log('[Cloudinary DB] Getting all images from Cloudinary...');
    
    let data = null;
    
    try {
      // Get all images with context and tags
      const response = await fetch(`${listUrl}?context=true&tags=true&max_results=500`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        data = await response.json();
        console.log(`[Cloudinary DB] ✅ Retrieved ${data.resources?.length || 0} total images`);
        
        // Filter for portfolio images (those with portfolio tags or in gangajal-portfolio folder)
        if (data.resources) {
          const portfolioImages = data.resources.filter(resource => {
            const hasPortfolioTag = resource.tags?.includes('portfolio') || resource.tags?.includes('gangajal');
            const inPortfolioFolder = resource.public_id?.includes('gangajal-portfolio');
            return hasPortfolioTag || inPortfolioFolder;
          });
          
          console.log(`[Cloudinary DB] 📁 Found ${portfolioImages.length} portfolio images`);
          data.resources = portfolioImages;
          
          // Debug recent uploads
          const recentUploads = portfolioImages.filter(r => {
            const uploadTime = new Date(r.created_at);
            const now = new Date();
            const diffHours = (now.getTime() - uploadTime.getTime()) / (1000 * 60 * 60);
            return diffHours < 24; // Last 24 hours
          });
          
          if (recentUploads.length > 0) {
            console.log(`[Cloudinary DB] 🕒 ${recentUploads.length} uploads in last 24h:`,
              recentUploads.map(r => ({ 
                public_id: r.public_id, 
                tags: r.tags,
                folder: r.folder,
                created_at: r.created_at
              }))
            );
          }
        }
      } else {
        console.error(`[Cloudinary DB] ❌ List API failed: ${response.status}`);
        const errorText = await response.text();
        console.error('[Cloudinary DB] Error details:', errorText);
      }
    } catch (listError) {
      console.error('[Cloudinary DB] List API error:', listError.message);
    }

    if (!data || !data.resources || data.resources.length === 0) {
      console.log('[Cloudinary DB] ⚠️  No portfolio images found in Cloudinary');
      console.log('[Cloudinary DB] This could mean:');
      console.log('- No images have been uploaded yet');
      console.log('- Images are missing portfolio/gangajal tags');
      console.log('- Images are not in gangajal-portfolio folder');
      return [];
    }

    console.log(`[Cloudinary DB] ✅ Found ${data.resources.length} portfolio images`);
    console.log(`[Cloudinary DB] Processing images into portfolio format...`);
    
    // Transform Cloudinary data to portfolio format
    const portfolioItems = data.resources.map((resource, index) => {
      console.log(`[Cloudinary DB] Processing image ${index + 1}:`, {
        public_id: resource.public_id,
        tags: resource.tags,
        context: resource.context
      });

      // Parse context metadata with enhanced category detection
      const context = resource.context || {};
      const title = context.title || resource.public_id.split('/').pop() || `Image ${index + 1}`;
      const description = context.description || '';
      
      // Robust category detection - check context first, then tags
      let category = 'uncategorized';
      
      // Primary: Check context category
      if (context.category) {
        category = context.category.toLowerCase().trim();
      }
      // Fallback: Check tags for valid categories
      else if (resource.tags && resource.tags.length > 0) {
        const validCategories = ['product', 'fashion', 'event', 'travel', 'commercial'];
        const foundCategory = resource.tags.find(tag => 
          validCategories.includes(tag.toLowerCase().trim())
        );
        if (foundCategory) {
          category = foundCategory.toLowerCase().trim();
        }
      }
      
      // Normalize category variations - more comprehensive
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes('travel') || categoryLower.includes('lifestyle')) {
        category = 'travel';
      } else if (categoryLower.includes('commercial') || categoryLower.includes('business')) {
        category = 'commercial';
      } else if (categoryLower.includes('product')) {
        category = 'product';
      } else if (categoryLower.includes('fashion') || categoryLower.includes('portrait')) {
        category = 'fashion';
      } else if (categoryLower.includes('event') || categoryLower.includes('wedding')) {
        category = 'event';
      }
      
      console.log(`[Cloudinary DB] Item ${index + 1} - "${title}":`, {
        public_id: resource.public_id,
        contextCategory: context.category,
        tags: resource.tags,
        finalCategory: category,
        isTargetCategory: (category === 'travel' || category === 'commercial') ? '🎯 YES' : 'no'
      });
      
      // SPECIAL DEBUG: Alert if travel/commercial items found
      if (category === 'travel' || category === 'commercial') {
        console.log(`🔥 FOUND ${category.toUpperCase()} ITEM:`, {
          title,
          imageUrl: resource.secure_url,
          willBeIncluded: 'YES - this should appear on website'
        });
      }
      
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
    // Check environment variables
    const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUD_NAME } = process.env;
    
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUD_NAME) {
      throw new Error('Cloudinary credentials not configured for delete operation');
    }

    console.log(`[Cloudinary DB] Attempting to delete: ${publicId}`);
    
    // Use form-data approach for Cloudinary delete (more reliable)
    const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', CLOUDINARY_API_KEY);
    
    // Generate timestamp and signature for delete
    const timestamp = Math.floor(Date.now() / 1000);
    formData.append('timestamp', timestamp.toString());
    
    // Create signature for delete operation
    const crypto = await import('crypto');
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
    formData.append('signature', signature);
    
    const response = await fetch(deleteUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Cloudinary DB] Delete failed: ${response.status}`, errorText);
      throw new Error(`Cloudinary delete failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Cloudinary DB] Delete result for ${publicId}:`, result);
    
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary delete unsuccessful: ${result.result}`);
    }
    
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