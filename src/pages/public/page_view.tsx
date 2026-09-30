import type {SectionData} from '../../content/types';
import {About} from './about';
import {Gallery} from './gallery';
import {Home} from './home';

interface PageViewProps {
  pageKey: string;
  s: Record<string, SectionData>;
}

export function PageView({pageKey, s}: PageViewProps) {
  switch (pageKey) {
    case 'home':
      return <Home s={s} />;
    case 'gallery':
      return <Gallery s={s} />;
    case 'about':
      return <About s={s} />;
    default:
      throw new Error(`No view for page: ${pageKey}`);
  }
}
