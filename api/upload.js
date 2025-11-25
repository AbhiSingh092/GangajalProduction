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
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUD_NAME } = process.env;
  
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUD_NAME) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'Missing Cloudinary credentials in environment variables' 
    });
  }

  try {
    // Parse multipart form data
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file;
    const category = fields.category?.[0] || 'uncategorized';

    if (!file || !file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = file[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type', 
        details: 'Only JPEG, PNG, WebP, and GIF images are allowed' 
      });
    }

    // Create signed upload parameters with metadata storage
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Extract title and description from form data
    const title = fields.title?.[0] || 'Untitled';
    const description = fields.description?.[0] || '';
    
    const uploadParams = {
      folder: 'gangajal-portfolio',
      tags: `${category},portfolio,${title.replace(/\s+/g, '_')}`,
      timestamp: timestamp,
      context: `title=${title}|description=${description}|category=${category}|uploadDate=${new Date().toISOString()}`,
    };

    // Generate signature using Cloudinary's exact algorithm
    const sortedParams = Object.keys(uploadParams)
      .sort()
      .map(key => `${key}=${uploadParams[key]}`)
      .join('&');
    
    const stringToSign = sortedParams + CLOUDINARY_API_SECRET;
    console.log('Uploading with metadata:', { title, description, category });
    console.log('String to sign:', stringToSign);
    
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    // Prepare form data for Cloudinary
    const cloudinaryForm = new FormData();
    
    // Read file and create blob
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const blob = new Blob([fileBuffer], { type: uploadedFile.mimetype });
    
    cloudinaryForm.append('file', blob);
    cloudinaryForm.append('api_key', CLOUDINARY_API_KEY);
    cloudinaryForm.append('folder', 'gangajal-portfolio');
    cloudinaryForm.append('tags', `${category},portfolio,${title.replace(/\s+/g, '_')}`);
    cloudinaryForm.append('context', `title=${title}|description=${description}|category=${category}|uploadDate=${new Date().toISOString()}`);
    cloudinaryForm.append('timestamp', timestamp.toString());
    cloudinaryForm.append('signature', signature);
    
    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
    
    console.log('Uploading to Cloudinary:', {
      filename: uploadedFile.originalFilename,
      size: uploadedFile.size,
      type: uploadedFile.mimetype,
      category
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: cloudinaryForm
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
      return res.status(500).json({ 
        error: 'Cloudinary upload failed', 
        details: `HTTP ${response.status}: ${errorText}` 
      });
    }

    const result = await response.json();
    
    console.log('Upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      bytes: result.bytes
    });

    // Return formatted response
    return res.status(200).json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      width: result.width || 0,
      height: result.height || 0,
      bytes: result.bytes,
      created_at: result.created_at
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ 
      error: 'Upload processing failed', 
      details: error.message 
    });
  }
}