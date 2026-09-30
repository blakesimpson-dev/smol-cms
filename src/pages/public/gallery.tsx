import type {SectionData} from '../../content/types';
import {GalleryGrid} from '../../components/public/gallery_grid';
import {Paragraphs} from '../../components/public/paragraphs';
import {imgs, str} from '../../lib/values';

export function Gallery({s}: {s: Record<string, SectionData>}) {
  const gallery = s['gallery.main'];

  return (
    <section class="section">
      <div class="container">
        <h1>{str(gallery.heading)}</h1>
        <Paragraphs text={str(gallery.intro)} />
        <GalleryGrid images={imgs(gallery.images)} captions />
      </div>
    </section>
  );
}
