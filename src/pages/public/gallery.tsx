import type {SectionData} from '../../content/types';
import {GalleryGrid} from '../../components/public/gallery_grid';
import {Pager} from '../../components/public/pager';
import {Paragraphs} from '../../components/public/paragraphs';
import {paginate} from '../../lib/pagination';
import {imgs, str} from '../../lib/values';

// Six rows of three on desktop, nine rows of two on phones
export const GALLERY_PAGE_SIZE = 18;

interface GalleryProps {
  s: Record<string, SectionData>;
  path: string;
  page: number;
}

export function Gallery({s, path, page}: GalleryProps) {
  const gallery = s['gallery.main'];
  const paged = paginate(imgs(gallery.images), page, GALLERY_PAGE_SIZE);

  return (
    <section class="section">
      <div class="container">
        <h1>{str(gallery.heading)}</h1>
        {page === 1 && <Paragraphs text={str(gallery.intro)} />}
        <GalleryGrid images={paged.items} captions />
        <Pager path={path} page={paged.page} pages={paged.pages} />
      </div>
    </section>
  );
}
