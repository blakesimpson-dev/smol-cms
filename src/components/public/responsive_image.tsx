import type {ImageValue} from '../../content/types';
import {imgUrl, srcset} from '../../lib/images';

interface ResponsiveImageProps {
  image: ImageValue;
  sizes?: string;
  priority?: boolean;
  maxWidth?: number;
  class?: string;
}

export function ResponsiveImage({
  image,
  sizes = '100vw',
  priority,
  maxWidth,
  class: className,
}: ResponsiveImageProps) {
  const width = Math.min(maxWidth ?? 1200, image.width || 1200);

  return (
    <img
      class={className}
      src={imgUrl(image.id, {width})}
      srcset={srcset(image, maxWidth)}
      sizes={sizes}
      alt={image.alt}
      width={image.width || undefined}
      height={image.height || undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
    />
  );
}
