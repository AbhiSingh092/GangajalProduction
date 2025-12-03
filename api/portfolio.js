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
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    console.log('[Cloudinary DB] Getting all media (images + videos) from Cloudinary...');
    
    let allResources = [];
    
    try {
      // Get IMAGES
      const imageUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image`;
      const imageResponse = await fetch(`${imageUrl}?tags=true&context=true&max_results=500`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        allResources = [...imageData.resources];
        console.log(`[Cloudinary DB] Found ${imageData.resources.length} images`);
      }

      // Get VIDEOS
      const videoUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/video`;
      const videoResponse = await fetch(`${videoUrl}?tags=true&context=true&max_results=500`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        allResources = [...allResources, ...videoData.resources];
        console.log(`[Cloudinary DB] Found ${videoData.resources.length} videos`);
      }

      const data = { resources: allResources };

      if (data.resources && data.resources.length > 0) {

        console.log(`[Cloudinary DB] Total media items: ${data.resources.length}`);
        
        // Debug recent uploads
        const recentUploads = data.resources.filter(r => {
          const uploadTime = new Date(r.created_at);
          const now = new Date();
          const diffHours = (now.getTime() - uploadTime.getTime()) / (1000 * 60 * 60);
          return diffHours < 24; // Last 24 hours
        });
        
        if (recentUploads.length > 0) {
          console.log(`[Cloudinary DB] 🕒 ${recentUploads.length} uploads in last 24h:`,
            recentUploads.map(r => ({ 
              public_id: r.public_id, 
              resource_type: r.resource_type,
              tags: r.tags,
              folder: r.folder,
              created_at: r.created_at
            }))
          );
        }
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

      // Parse context (title, description, category)
      let parsedContext = {};
      if (resource.context) {
        if (typeof resource.context === 'string') {
          resource.context.split('|').forEach(pair => {
            const idx = pair.indexOf('=');
            if (idx > 0) {
              parsedContext[pair.substring(0, idx).trim()] = pair.substring(idx + 1).trim();
            }
          });
        } else if (resource.context?.custom) {
          parsedContext = { ...resource.context.custom };
        } else if (typeof resource.context === 'object') {
          parsedContext = { ...resource.context };
        }
      }
      
      const title = parsedContext.title || resource.public_id?.split('/')?.pop() || `Image ${index + 1}`;
      const description = parsedContext.description || '';
      
      // DEBUG: Log raw resource data for troubleshooting
      console.log(`[Portfolio] Processing: ${title}`, {
        folder: resource.folder,
        tags: resource.tags,
        context: parsedContext,
        public_id: resource.public_id,
        resource_type: resource.resource_type
      });
      
      // ENHANCED CATEGORY DETECTION - Check context FIRST (most reliable from our upload)
      let category = 'product'; // default
      const validCategories = ['commercial', 'travel', 'fashion', 'event', 'product'];
      
      // Method 1: Context category (MOST RELIABLE - directly from our upload)
      if (parsedContext.category) {
        const contextCat = parsedContext.category.toLowerCase().trim();
        if (validCategories.includes(contextCat)) {
          category = contextCat;
          console.log(`[Portfolio] ✅ Category from context: ${category}`);
        }
      }
      
      // Method 2: Folder path (gangajal-portfolio/commercial)
      if (category === 'product' && resource.folder) {
        const folderLower = resource.folder.toLowerCase();
        for (const cat of validCategories) {
          if (folderLower.includes(cat)) {
            category = cat;
            console.log(`[Portfolio] ✅ Category from folder: ${category}`);
            break;
          }
        }
      }
      
      // Method 3: First tag
      if (category === 'product' && resource.tags) {
        const tags = Array.isArray(resource.tags) ? resource.tags : resource.tags.split(',');
        if (tags.length > 0) {
          const firstTag = tags[0].toString().toLowerCase().trim();
          if (validCategories.includes(firstTag)) {
            category = firstTag;
            console.log(`[Portfolio] ✅ Category from tag: ${category}`);
          }
        }
      }
      
      // Method 4: public_id contains category
      if (category === 'product' && resource.public_id) {
        const idLower = resource.public_id.toLowerCase();
        for (const cat of validCategories) {
          if (idLower.includes(cat)) {
            category = cat;
            console.log(`[Portfolio] ✅ Category from public_id: ${category}`);
            break;
          }
        }
      }
      
      console.log(`[Portfolio] Final category for "${title}": ${category}`);
      
      const uploadDate = parsedContext.uploadDate || resource.created_at;
      const resourceType = resource.resource_type || 'image';

      return {
        id: index + 1, // Numeric ID as expected by admin panel
        title,
        category,
        imageUrl: resource.secure_url,
        description,
        createdAt: uploadDate,
        public_id: resource.public_id, // Keep for delete operations
        resource_type: resourceType,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        duration: resource.duration, // for videos
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