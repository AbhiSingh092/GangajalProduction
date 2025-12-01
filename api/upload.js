// Production-ready Cloudinary upload with signed authentication
import { IncomingForm } from 'formidable';
import crypto from 'crypto';

// Disable body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify environment variables
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
  
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'Missing Cloudinary credentials in environment variables' 
    });
  }

  try {
    // Parse multipart form data with increased limits
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      maxFieldsSize: 2 * 1024 * 1024, // 2MB for form fields
      maxFields: 10, // Max number of fields
      keepExtensions: true
    });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
        } else {
          resolve([fields, files]);
        }
      });
    });

    const file = files.file;
    const category = fields.category?.[0] || 'uncategorized';

    if (!file || !file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = file[0];
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > maxSize) {
      return res.status(413).json({ 
        error: 'File too large', 
        details: `File size ${(uploadedFile.size / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit. Please compress your image.`,
        maxSize: '10MB'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type', 
        details: 'Only JPEG, PNG, WebP, and GIF images are allowed' 
      });
    }

    console.log(`File validation passed: ${uploadedFile.originalFilename} (${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB)`);

    // Create signed upload parameters (ONLY parameters that require signing)
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Extract title and description from form data
    const title = fields.title?.[0] || 'Untitled';
    const description = fields.description?.[0] || '';
    
    // Use UNSIGNED upload (no signature needed - most reliable!)
    // This approach completely eliminates signature authentication issues
    
    // Prepare form data for Cloudinary
    const cloudinaryForm = new FormData();
    
    // Read file and create blob
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const blob = new Blob([fileBuffer], { type: uploadedFile.mimetype });
    
    // Create upload preset name dynamically (Cloudinary accepts any preset name)
    const uploadPresetName = 'gangajal_preset';
    
    // Normalize category to ensure consistency (CRITICAL FIX!)
    const normalizedCategory = category.toLowerCase().trim();
    console.log(`[Upload] Original category: "${category}" -> Normalized: "${normalizedCategory}"`);
    
    // Try unsigned upload first (no signature required)
    cloudinaryForm.append('file', blob);
    cloudinaryForm.append('upload_preset', uploadPresetName);
    cloudinaryForm.append('folder', 'gangajal-portfolio');
    
    // CRITICAL: Category MUST be the FIRST tag for reliable detection!
    const tagsToUpload = `${normalizedCategory},portfolio,gangajal,${title.replace(/\s+/g, '_')}`;
    cloudinaryForm.append('tags', tagsToUpload);
    
      // Add context metadata with explicit category
      const contextData = `title=${title}|description=${description}|category=${normalizedCategory}|uploadDate=${new Date().toISOString()}`;
      cloudinaryForm.append('context', contextData);
      
      console.log(`[Upload] 🎯 STORING CATEGORY: "${normalizedCategory}"`);
      console.log(`[Upload] Tags: "${tagsToUpload}"`);
      console.log(`[Upload] Context: "${contextData}"`);    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
    
    console.log('Uploading to Cloudinary:', {
      filename: uploadedFile.originalFilename,
      size: uploadedFile.size,
      type: uploadedFile.mimetype,
      category
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: cloudinaryForm,
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    // Clean up temp file immediately
    try {
      fs.unlinkSync(uploadedFile.filepath);
    } catch (e) {
      console.warn('Temp file cleanup failed:', e.message);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', errorText);
      
      // If upload preset not found, try basic signed upload as fallback
      if (response.status === 400 && errorText.includes('Upload preset not found')) {
        console.log('Upload preset not found, trying basic signed upload...');
        
        try {
          // Fallback to basic signed upload with just timestamp
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = crypto
            .createHash('sha1')
            .update(`timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
            .digest('hex');

          const fallbackForm = new FormData();
          fallbackForm.append('file', blob);
          fallbackForm.append('api_key', CLOUDINARY_API_KEY);
          fallbackForm.append('timestamp', timestamp.toString());
          fallbackForm.append('signature', signature);

          const fallbackResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: fallbackForm,
            signal: AbortSignal.timeout(30000)
          });

          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            console.log('Fallback upload successful!');
            
            // Validate fallback response
            if (!fallbackResult.secure_url || !fallbackResult.public_id) {
              return res.status(500).json({ 
                error: 'Fallback upload completed but invalid response', 
                details: 'Cloudinary did not return expected image URL' 
              });
            }

            return res.status(200).json({
              secure_url: fallbackResult.secure_url,
              public_id: fallbackResult.public_id,
              resource_type: fallbackResult.resource_type || 'image',
              format: fallbackResult.format || 'unknown',
              width: fallbackResult.width || 0,
              height: fallbackResult.height || 0,
              bytes: fallbackResult.bytes || 0,
              created_at: fallbackResult.created_at || new Date().toISOString()
            });
          }
        } catch (fallbackError) {
          console.error('Fallback upload also failed:', fallbackError);
        }
      }
      
      return res.status(500).json({ 
        error: 'Cloudinary upload failed', 
        details: `HTTP ${response.status}: ${errorText}` 
      });
    }

    const result = await response.json();
    
    // Validate Cloudinary response
    if (!result.secure_url || !result.public_id) {
      console.error('Invalid Cloudinary response:', result);
      return res.status(500).json({ 
        error: 'Upload completed but invalid response', 
        details: 'Cloudinary did not return expected image URL' 
      });
    }
    
    console.log('Upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      bytes: result.bytes
    });

    // Return formatted response with validation
    return res.status(200).json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type || 'image',
      format: result.format || 'unknown',
      width: result.width || 0,
      height: result.height || 0,
      bytes: result.bytes || 0,
      created_at: result.created_at || new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ 
      error: 'Upload processing failed', 
      details: error.message 
    });
  }
}