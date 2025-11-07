import { cld } from '../utils/cloudinary';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { quality, format } from '@cloudinary/url-gen/actions/delivery';

interface CloudinaryImageProps {
  src: string; // can be a Cloudinary publicId or a full Cloudinary URL
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Match the part after /upload/ optionally removing version and file extension
    const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?(?:$|[?])/);
    if (m && m[1]) return m[1];
  } catch (e) {
    // ignore
  }
  return null;
}

export default function CloudinaryImage({ 
  src,
  alt,
  width,
  height,
  className = ''
}: CloudinaryImageProps) {
  // If src is a full Cloudinary URL, try to extract a publicId for URL-gen optimizations
  const isUrl = src.startsWith('http');
  let imageUrl: string;

  if (isUrl && src.includes('res.cloudinary.com')) {
    const publicId = extractPublicIdFromUrl(src);
    if (publicId) {
      const img = cld.image(publicId).delivery(quality('auto')).delivery(format('auto'));
      if (width && height) {
        img.resize(fill().width(width).height(height));
      } else if (width) {
        img.resize(fill().width(width));
      } else if (height) {
        img.resize(fill().height(height));
      }
      imageUrl = img.toURL();
    } else {
      // Fallback to raw URL if parsing failed
      imageUrl = src;
    }
  } else if (!isUrl) {
    // treat src as a Cloudinary publicId
    const img = cld.image(src).delivery(quality('auto')).delivery(format('auto'));
    if (width && height) {
      img.resize(fill().width(width).height(height));
    } else if (width) {
      img.resize(fill().width(width));
    } else if (height) {
      img.resize(fill().height(height));
    }
    imageUrl = img.toURL();
  } else {
    // External non-cloudinary URL: use as-is
    imageUrl = src;
  }

  return (
    // eslint-disable-next-line jsx-a11y/img-redundant-alt
    <img src={imageUrl} alt={alt} className={className} loading="lazy" />
  );
}