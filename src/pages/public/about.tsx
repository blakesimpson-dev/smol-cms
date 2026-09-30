import type {SectionData} from '../../content/types';
import {ResponsiveImage} from '../../components/public/responsive_image';
import {Paragraphs} from '../../components/public/paragraphs';
import {Testimonials} from '../../components/public/testimonials';
import {img, list, str} from '../../lib/values';

export function About({s}: {s: Record<string, SectionData>}) {
  const about = s['about.main'];
  const photo = img(about.image);
  const testimonials = list(about.testimonials);

  return (
    <>
      <section class="section">
        <div class={photo ? 'container split' : 'container'}>
          <div>
            <h1>{str(about.heading)}</h1>
            <Paragraphs text={str(about.body)} />
          </div>
          {photo && (
            <ResponsiveImage
              class="about-photo"
              image={photo}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              maxWidth={1600}
            />
          )}
        </div>
      </section>
      {testimonials.length > 0 && (
        <section class="section alt">
          <div class="container">
            <h2>What people say</h2>
            <Testimonials items={testimonials} />
          </div>
        </section>
      )}
    </>
  );
}
