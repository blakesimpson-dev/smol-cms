import type {SectionData} from '../../content/types';
import {ContactForm} from '../../components/public/contact_form';
import {GalleryGrid} from '../../components/public/gallery_grid';
import {Hero} from '../../components/public/hero';
import {Paragraphs} from '../../components/public/paragraphs';
import {img, imgs, str} from '../../lib/values';

const FEATURED_LIMIT = 12;

export function Home({s}: {s: Record<string, SectionData>}) {
  const hero = s['home.hero'];
  const featured = s['home.featured'];
  const contact = s['home.contact'];
  const featuredImages = imgs(s['gallery.main'].images)
    .filter(image => image.featured)
    .slice(0, FEATURED_LIMIT);

  return (
    <>
      <Hero
        heading={str(hero.heading)}
        intro={str(hero.intro)}
        button={str(hero.button)}
        image={img(hero.image)}
      />
      {featuredImages.length > 0 && (
        <section id="work" class="section">
          <div class="container">
            <h2>{str(featured.heading)}</h2>
            <GalleryGrid images={featuredImages} />
            <p>
              <a href="/gallery" role="button" class="outline">
                View the full gallery
              </a>
            </p>
          </div>
        </section>
      )}
      <section id="contact" class="section alt">
        <div class="container split">
          <div>
            <h2>{str(contact.heading)}</h2>
            <Paragraphs text={str(contact.intro)} />
          </div>
          <article>
            <ContactForm />
          </article>
        </div>
      </section>
    </>
  );
}
