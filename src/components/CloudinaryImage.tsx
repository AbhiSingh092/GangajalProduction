import { cld } from '../utils/cloudinary';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { quality, format } from '@cloudinary/url-gen/actions/delivery';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function CloudinaryImage({ 
  publicId, 
  alt, 
  width, 
  height, 
  className = '' 
}: CloudinaryImageProps) {
  const image = cld
    .image(publicId)
    .delivery(quality('auto'))
    .delivery(format('auto'));

  if (width && height) {
    image.resize(fill().width(width).height(height));
  } else if (width) {
    image.resize(fill().width(width));
  } else if (height) {
    image.resize(fill().height(height));
  }

  return (
    <img
      src={image.toURL()}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}