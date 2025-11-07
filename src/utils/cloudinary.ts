import { Cloudinary } from '@cloudinary/url-gen';
import { quality } from '@cloudinary/url-gen/actions/delivery';
import { scale, fill } from '@cloudinary/url-gen/actions/resize';

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
export const getImageUrl = (publicId: string, options?: { width?: number; height?: number; quality?: number }) => {
  const { width, height, quality = 'auto' } = options || {};
  let transformation = cld.image(publicId);

  if (width || height) {
    transformation = transformation.resize(`w_${width},h_${height}`);
  }

  // Set quality and format optimization
  transformation = transformation.quality(quality).format('auto');

  return transformation.toURL();
};

// Upload preset name - create this in your Cloudinary Dashboard
// Settings -> Upload -> Upload Presets -> Add upload preset
export const UPLOAD_PRESET = 'gangajal_preset';

// Function to upload image to Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', 'dbz9tnzid');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/dbz9tnzid/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};