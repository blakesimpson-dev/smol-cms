import type {SectionData} from '../../schema';
import {
  CldImage,
  ContactForm,
  GalleryGrid,
  Paragraphs,
  img,
  imgs,
  list,
  str,
} from './components';

const FEATURED_LIMIT = 12;

interface PageProps {
  s: Record<string, SectionData>;
}

function Home({s}: PageProps) {
  const hero = s['home.hero'];
  const featured = s['home.featured'];
  const contact = s['home.contact'];
  const heroImage = img(hero.image);
  const featuredImages = imgs(s['gallery.main'].images)
    .filter(image => image.featured)
    .slice(0, FEATURED_LIMIT);

  return (
    <>
      <section class="hero">
        {heroImage && <CldImage image={heroImage} priority maxWidth={2400} />}
        <h1>{str(hero.heading)}</h1>
        <Paragraphs text={str(hero.intro)} />
      </section>
      {featuredImages.length > 0 && (
        <section id="work">
          {str(featured.heading) && <h2>{str(featured.heading)}</h2>}
          <GalleryGrid images={featuredImages} />
          <p>
            <a href="/gallery">View the full gallery →</a>
          </p>
        </section>
      )}
      <section id="contact">
        {str(contact.heading) && <h2>{str(contact.heading)}</h2>}
        <Paragraphs text={str(contact.intro)} />
        <ContactForm />
      </section>
    </>
  );
}

function Gallery({s}: PageProps) {
  const gallery = s['gallery.main'];

  return (
    <>
      <h1>{str(gallery.heading)}</h1>
      <Paragraphs text={str(gallery.intro)} />
      <GalleryGrid images={imgs(gallery.images)} captions />
    </>
  );
}

function About({s}: PageProps) {
  const about = s['about.main'];
  const photo = img(about.image);
  const testimonials = list(about.testimonials);

  return (
    <article>
      <h1>{str(about.heading)}</h1>
      {photo && (
        <CldImage
          image={photo}
          priority
          sizes="(min-width: 1024px) 800px, 100vw"
          maxWidth={1600}
        />
      )}
      <Paragraphs text={str(about.body)} />
      {testimonials.length > 0 && (
        <section class="testimonials">
          <h2>What people say</h2>
          {testimonials.map(t => (
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
        </section>
      )}
    </article>
  );
}

export function PageView({pageKey, s}: PageProps & {pageKey: string}) {
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

export function NotFound() {
  return (
    <article>
      <h1>Page not found</h1>
      <p>
        Sorry, that page doesn't exist. <a href="/">Go to the home page</a>.
      </p>
    </article>
  );
}
