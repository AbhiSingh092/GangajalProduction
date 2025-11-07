import { Cloudinary } from '@cloudinary/url-gen';
import { quality, format } from '@cloudinary/url-gen/actions/delivery';
import { fill } from '@cloudinary/url-gen/actions/resize';

// Initialize Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: 'dbz9tnzid'
  }
});

// Common image IDs
export const IMAGES = {
  MAIN: 'pmy0vynnyqjavbfvrror',
  // Add more image IDs as you upload them
};

// Function to get optimized image URL
export const getImageUrl = (
  publicId: string,
  options?: { width?: number; height?: number; quality?: number | 'auto' }
) => {
  const { width, height, quality: q = 'auto' } = options || {};
  const img = cld.image(publicId).delivery(quality(typeof q === 'number' ? q : 'auto')).delivery(format('auto'));

  if (width && height) {
    img.resize(fill().width(width).height(height));
  } else if (width) {
    img.resize(fill().width(width));
  } else if (height) {
    img.resize(fill().height(height));
  }

  return img.toURL();
};

// Upload preset name - create this in your Cloudinary Dashboard
// Settings -> Upload -> Upload Presets -> Add upload preset
export const UPLOAD_PRESET = 'gangajal_preset';

// Function to fetch images by category
export const fetchImagesByCategory = async (category: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dbz9tnzid/resources/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa('511716395751147:Znm9YeGv9f1z_VZwgc0rnTaycQ8')}`,
        },
        body: JSON.stringify({
          expression: `resource_type:image AND tags=${category}`,
          sort_by: [{ uploaded_at: 'desc' }],
          max_results: 500
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }

    const data = await response.json();
    return data.resources.map((resource: any) => resource.secure_url);
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

// Function to upload image to Cloudinary
interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadImage = async (file: File, category: string): Promise<UploadResult> => {
  console.log('Starting upload for file:', file.name);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', 'dbz9tnzid');
  // Add category as a tag
  formData.append('tags', category);
  // Add category to context metadata
  formData.append('context', `category=${category}`);

  try {
    console.log('Sending request to Cloudinary...');
    const response = await fetch(`https://api.cloudinary.com/v1_1/dbz9tnzid/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Upload failed:', response.status, errorData);
      throw new Error(`Upload failed: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};