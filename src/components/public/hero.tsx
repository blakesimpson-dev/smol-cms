import type {ImageValue} from '../../content/types';
import {Paragraphs} from './paragraphs';
import {ResponsiveImage} from './responsive_image';

interface HeroProps {
  heading: string;
  intro: string;
  button: string;
  image: ImageValue | null;
}

export function Hero({heading, intro, button, image}: HeroProps) {
  return (
    <section class="hero">
      {image && (
        <ResponsiveImage
          class="hero-bg"
          image={image}
          priority
          maxWidth={2400}
        />
      )}
      <div class="container hero-content">
        <h1>{heading}</h1>
        <Paragraphs text={intro} />
        {button && (
          <a href="#contact" role="button">
            {button}
          </a>
        )}
      </div>
    </section>
  );
}
