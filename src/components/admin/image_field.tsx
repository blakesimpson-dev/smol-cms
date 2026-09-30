import type {Field, ImageValue} from '../../content/types';
import {uploadsConfigured} from '../../lib/cloudinary';
import {Help} from './help';
import {ImageItem} from './image_item';

type ImageFieldDef = Extract<Field, {type: 'image' | 'images'}>;

interface ImageFieldProps {
  field: ImageFieldDef;
  value: unknown;
  error?: string;
}

function asImages(v: unknown): Array<Partial<ImageValue>> {
  if (Array.isArray(v)) {
    return v as Array<Partial<ImageValue>>;
  }

  return v && typeof v === 'object' ? [v] : [];
}

function DropZone({multiple}: {multiple: boolean}) {
  return (
    <div class="drop-zone" data-drop-zone>
      <input type="file" accept="image/*" multiple={multiple} hidden />
      <p class="drop-hint">
        {multiple ? 'Drag photos here' : 'Drag a photo here'}
        <small>or</small>
      </p>
      <button type="button" data-upload>
        {multiple ? 'Choose photos' : 'Choose a photo'}
      </button>
    </div>
  );
}

export function ImageField({field, value, error}: ImageFieldProps) {
  const multiple = field.type === 'images';
  const max = field.type === 'images' ? field.max : 1;
  const itemProps = {
    name: field.name,
    multiple,
    captions: field.captions,
    featured: field.type === 'images' && field.featured,
  };

  return (
    <fieldset
      data-image-field
      data-multiple={String(multiple)}
      data-max={max ? String(max) : undefined}
    >
      <legend>
        {field.label}
        {field.required && ' *'}
      </legend>
      {multiple && uploadsConfigured() && <DropZone multiple />}
      <div class="item-list">
        {asImages(value).map(image => (
          <ImageItem {...itemProps} image={image} />
        ))}
      </div>
      <template>
        <ImageItem {...itemProps} />
      </template>
      {!multiple && uploadsConfigured() && <DropZone multiple={false} />}
      {!uploadsConfigured() && (
        <small>
          Image uploads aren't configured (set the CLOUDINARY_* environment
          variables).
        </small>
      )}
      <Help text={field.help} error={error} />
    </fieldset>
  );
}
