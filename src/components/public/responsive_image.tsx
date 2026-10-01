import type {ImageValue} from '../../content/types';
import {heightFor, imgUrl, srcset} from '../../lib/images';

interface ResponsiveImageProps {
  image: ImageValue;
  sizes?: string;
  priority?: boolean;
  maxWidth?: number;
  // Width / height to crop to, e.g. 4 / 3; omit to keep the original shape
  aspect?: number;
  class?: string;
}

export function ResponsiveImage({
  image,
  sizes = '100vw',
  priority,
  maxWidth,
  aspect,
  class: className,
}: ResponsiveImageProps) {
  const width = Math.min(maxWidth ?? 1200, image.width || 1200);
  const ratio =
    aspect ?? (image.width && image.height ? image.width / image.height : 0);

  return (
    <img
      class={className}
      src={imgUrl(image.id, {width, height: heightFor(width, aspect)})}
      srcset={srcset(image, maxWidth, aspect)}
      sizes={sizes}
      alt={image.alt}
      width={width}
      height={ratio ? Math.round(width / ratio) : undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
    />
  );
}
