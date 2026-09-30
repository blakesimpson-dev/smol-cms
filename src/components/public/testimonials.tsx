import type {ListItem} from '../../content/types';
import {Paragraphs} from './paragraphs';

export function Testimonials({items}: {items: ListItem[]}) {
  return (
    <div class="testimonials">
      {items.map(t => (
        <blockquote>
          <Paragraphs text={t.quote} />
          <footer>
            <cite>{t.author}</cite>
            {t.date && (
              <>
                {', '}
                <time datetime={t.date}>{t.date.slice(0, 4)}</time>
              </>
            )}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
