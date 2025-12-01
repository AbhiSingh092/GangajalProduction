// Portfolio API - Uses Cloudinary as Database (PERMANENT STORAGE!)
// No more memory arrays - everything stored in Cloudinary metadata

const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;

// Helper function to fetch portfolio from Cloudinary
export const getPortfolioItems = async () => {
  try {
    console.log('[Portfolio] Environment check:', {
      hasApiKey: !!CLOUDINARY_API_KEY,
      hasApiSecret: !!CLOUDINARY_API_SECRET,
      hasCloudName: !!CLOUDINARY_CLOUD_NAME,
      cloudName: CLOUDINARY_CLOUD_NAME
    });
    
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
      console.error('[Portfolio] Missing Cloudinary credentials!');
      throw new Error('Cloudinary credentials not configured');
    }

    // Use direct Cloudinary list API for more reliable results
    const listUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image`;
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    console.log('[Cloudinary DB] Getting all images from Cloudinary...');
    
    let data = null;
    
    try {
      // Get all images with tags - use simple list API
      const response = await fetch(`${listUrl}?tags=true&context=true&max_results=500`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        data = await response.json();

        
        // Get ALL images from Cloudinary
        if (data.resources) {
          
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
        console.error(`[Cloudinary DB] List API failed: ${response.status}`);
        const errorText = await response.text();
        console.error('[Cloudinary DB] Error details:', errorText);
      }
    } catch (listError) {
      console.error('[Cloudinary DB] List API error:', listError.message);
    }

    if (!data || !data.resources || data.resources.length === 0) {
      console.log('[Cloudinary DB] No portfolio images found in Cloudinary');
      return [];
    }

    console.log(`[Cloudinary DB] Processing ${data.resources.length} images...`);

    // Transform Cloudinary data to portfolio format
    const portfolioItems = data.resources.map((resource, index) => {

      // Parse context for title and description
      let parsedContext = {};
      
      if (resource.context && typeof resource.context === 'string') {
        const contextPairs = resource.context.split('|');
        contextPairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            parsedContext[key.trim()] = value.trim();
          }
        });
      } else if (resource.context && typeof resource.context === 'object') {
        parsedContext = resource.context;
      }
      
      const title = parsedContext.title || resource.public_id.split('/').pop() || `Image ${index + 1}`;
      const description = parsedContext.description || '';
      
      // DEBUG: Show all tags and context for this image
      console.log(`[Portfolio] Image "${title}" - ALL TAGS:`, resource.tags);
      console.log(`[Portfolio] Image "${title}" - CONTEXT:`, resource.context);
      
      // Category detection - check ALL tags for category
      let category = 'product';
      
      if (resource.tags && resource.tags.length > 0) {
        console.log(`[Portfolio] Checking ALL tags for "${title}":`, resource.tags);
        
        // Check each tag for category
        for (const tag of resource.tags) {
          const tagLower = tag.toLowerCase();
          console.log(`[Portfolio] Checking tag: "${tagLower}"`);
          
          if (tagLower === 'commercial') {
            category = 'commercial';
            console.log(`[Portfolio] ✅ Found COMMERCIAL in tags!`);
            break;
          } else if (tagLower === 'travel') {
            category = 'travel';
            console.log(`[Portfolio] ✅ Found TRAVEL in tags!`);
            break;
          } else if (tagLower === 'fashion') {
            category = 'fashion';
            console.log(`[Portfolio] ✅ Found FASHION in tags!`);
            break;
          } else if (tagLower === 'event') {
            category = 'event';
            console.log(`[Portfolio] ✅ Found EVENT in tags!`);
            break;
          } else if (tagLower === 'product') {
            category = 'product';
            console.log(`[Portfolio] ✅ Found PRODUCT in tags!`);
            break;
          }
        }
        
        console.log(`[Portfolio] FINAL CATEGORY for "${title}": "${category}"`);
      }
      

      
      const uploadDate = parsedContext.uploadDate || resource.created_at;

      return {
        id: index + 1, // Numeric ID as expected by admin panel
        title,
        category,
        imageUrl: resource.secure_url,
        description,
        createdAt: uploadDate,
        public_id: resource.public_id, // Keep for delete operations
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
    const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
    
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary credentials not configured for delete operation');
    }

    console.log(`[Cloudinary DB] Attempting to delete: ${publicId}`);
    
    // Use form-data approach for Cloudinary delete (more reliable)
    const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`;
    
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