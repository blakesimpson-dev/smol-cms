import type {ImageValue} from '../../content/types';
import {imgUrl, srcset} from '../../lib/images';
import {ResponsiveImage} from './responsive_image';

// Thumbnails are cropped to the grid's 4:3 cells by Cloudinary
const THUMB_ASPECT = 4 / 3;

// Rendered thumbnail widths for the default grid in public.css: 2 columns on
// phones, then 18rem-minimum columns inside Pico's container
const GRID_SIZES =
  '(min-width: 1280px) 380px, (min-width: 1024px) 300px, (min-width: 768px) 330px, 50vw';

interface GalleryGridProps {
  images: ImageValue[];
  // Override when a page changes the grid's columns
  sizes?: string;
  captions?: boolean;
}

// Each link opens the full image, so the grid works without JavaScript
export function GalleryGrid({
  images,
  sizes = GRID_SIZES,
  captions,
}: GalleryGridProps) {
  return (
    <>
      <div class="gallery" data-lightbox>
        {images.map(image => (
          <figure>
            <a
              href={imgUrl(image.id, {width: 2400})}
              data-caption={image.caption}
              data-srcset={srcset(image, 1600)}
            >
              <ResponsiveImage
                image={image}
                sizes={sizes}
                maxWidth={800}
                aspect={THUMB_ASPECT}
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
