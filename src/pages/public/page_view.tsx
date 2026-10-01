import type {Page, SectionData} from '../../content/types';
import {pageCount} from '../../lib/pagination';
import {imgs} from '../../lib/values';
import {About} from './about';
import {GALLERY_PAGE_SIZE, Gallery} from './gallery';
import {Home} from './home';

interface PageViewProps {
  page: Page;
  // Which page of a paginated view, from `?page=`
  pageNumber: number;
  s: Record<string, SectionData>;
}

// How many `?page=` pages a view has; views that don't paginate have one
export function viewPageCount(
  pageKey: string,
  s: Record<string, SectionData>,
): number {
  switch (pageKey) {
    case 'gallery':
      return pageCount(
        imgs(s['gallery.main'].images).length,
        GALLERY_PAGE_SIZE,
      );
    default:
      return 1;
  }
}

export function PageView({page, pageNumber, s}: PageViewProps) {
  switch (page.key) {
    case 'home':
      return <Home s={s} />;
    case 'gallery':
      return <Gallery s={s} path={page.path} page={pageNumber} />;
    case 'about':
      return <About s={s} />;
    default:
      throw new Error(`No view for page: ${page.key}`);
  }
}
