// One view per page key in site.ts PAGES. Replace these with the real site's pages in a fork.
import type { FC } from "hono/jsx";
import type { SectionData } from "../../schema";
import { CldImage, Paragraphs, img, imgs, str } from "./components";

type PageProps = { s: Record<string, SectionData> };

const Home: FC<PageProps> = ({ s }) => {
  const hero = s["home.hero"];
  const gallery = s["home.gallery"];
  const heroImage = img(hero.image);
  const galleryImages = imgs(gallery.images);
  return (
    <>
      <section class="hero">
        {heroImage && <CldImage image={heroImage} priority maxWidth={2400} />}
        <h1>{str(hero.heading)}</h1>
        <Paragraphs text={str(hero.intro)} />
      </section>
      {galleryImages.length > 0 && (
        <section>
          {str(gallery.heading) && <h2>{str(gallery.heading)}</h2>}
          <div class="gallery">
            {galleryImages.map((image) => (
              <CldImage image={image} sizes="(min-width: 768px) 33vw, 100vw" maxWidth={1200} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

const About: FC<PageProps> = ({ s }) => {
  const about = s["about.main"];
  const photo = img(about.image);
  return (
    <article>
      <h1>{str(about.heading)}</h1>
      {photo && <CldImage image={photo} priority sizes="(min-width: 1024px) 800px, 100vw" maxWidth={1600} />}
      <Paragraphs text={str(about.body)} />
    </article>
  );
};

export const PAGE_VIEWS: Record<string, FC<PageProps>> = { home: Home, about: About };

export const NotFound: FC = () => (
  <article>
    <h1>Page not found</h1>
    <p>
      Sorry, that page doesn't exist. <a href="/">Go to the home page</a>.
    </p>
  </article>
);
