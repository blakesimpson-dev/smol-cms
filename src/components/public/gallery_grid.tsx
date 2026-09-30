import type {ImageValue} from '../../content/types';
import {imgUrl} from '../../lib/images';
import {ResponsiveImage} from './responsive_image';

interface GalleryGridProps {
  images: ImageValue[];
  captions?: boolean;
}

// Each link opens the full image, so the grid works without JavaScript
export function GalleryGrid({images, captions}: GalleryGridProps) {
  return (
    <>
      <div class="gallery" data-lightbox>
        {images.map(image => (
          <figure>
            <a
              href={imgUrl(image.id, {width: 2400})}
              data-caption={image.caption}
            >
              <ResponsiveImage
                image={image}
                sizes="(min-width: 768px) 33vw, 100vw"
                maxWidth={1200}
              />
            </a>
            {captions && image.caption && (
              <figcaption>{image.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
      <script type="module" src="/assets/js/lightbox.js"></script>
    </>
  );
}
