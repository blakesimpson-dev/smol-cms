import type {ImageValue} from '../../content/types';
import {imgUrl} from '../../lib/images';
import {ItemActions} from './item_actions';

export interface ImageItemProps {
  name: string;
  image?: Partial<ImageValue>;
  multiple: boolean;
  captions?: boolean;
  featured?: boolean;
}

export function ImageItem({
  name,
  image,
  multiple,
  captions,
  featured,
}: ImageItemProps) {
  // Single images get a large preview; gallery rows stay compact
  const [width, height] = multiple ? [240, 160] : [480, 270];

  return (
    <div class={multiple ? 'item img-item' : 'item img-item single'} data-item>
      <img
        class="thumb"
        src={
          image?.id
            ? imgUrl(image.id, {width: width * 2, height: height * 2})
            : ''
        }
        alt=""
        width={width}
        height={height}
      />
      <div class="item-fields">
        <input type="hidden" name={`${name}.id`} value={image?.id ?? ''} />
        <input
          type="hidden"
          name={`${name}.width`}
          value={String(image?.width ?? '')}
        />
        <input
          type="hidden"
          name={`${name}.height`}
          value={String(image?.height ?? '')}
        />
        <input
          name={`${name}.alt`}
          value={image?.alt ?? ''}
          placeholder="Describe the image (alt text)"
          aria-label="Alt text"
          required
          maxlength={300}
        />
        {captions && (
          <input
            name={`${name}.caption`}
            value={image?.caption ?? ''}
            placeholder="Caption (optional)"
            aria-label="Caption"
            maxlength={300}
          />
        )}
        {featured && (
          <label class="check">
            <input
              type="checkbox"
              name={`${name}.featured`}
              value={image?.id ?? ''}
              checked={image?.featured}
            />
            Show on home page
          </label>
        )}
        <progress hidden max={100} value={0}></progress>
        <small class="item-status" role="status"></small>
      </div>
      <ItemActions movable={multiple} retry />
    </div>
  );
}
