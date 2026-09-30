import type {TextField} from '../../content/types';
import {Help} from './help';

interface TextInputProps {
  field: TextField;
  name: string;
  value: unknown;
  error?: string;
}

// Updated live by public/assets/js/admin/counter.js
function Counter({length, recommended}: {length: number; recommended: number}) {
  const over = length > recommended;

  return (
    <small class={over ? 'counter over' : 'counter'} aria-live="polite">
      {length} / {recommended}
      {over && ' — this may look busy on the page'}
    </small>
  );
}

export function TextInput({field, name, value, error}: TextInputProps) {
  const text = typeof value === 'string' ? value : '';
  const common = {
    name,
    required: field.required,
    maxlength: field.type === 'date' ? undefined : field.max,
    'data-recommended': field.recommended,
    'aria-invalid': error ? 'true' : undefined,
  };
  const size = field.recommended ?? field.max ?? 600;
  const rows = Math.min(12, Math.max(3, Math.round(size / 80)));

  return (
    <label>
      {field.label}
      {field.required && ' *'}
      {field.type === 'textarea' ? (
        <textarea {...common} rows={rows}>
          {text}
        </textarea>
      ) : (
        <input
          type={field.type === 'date' ? 'date' : 'text'}
          {...common}
          value={text}
        />
      )}
      {field.recommended && (
        <Counter length={text.length} recommended={field.recommended} />
      )}
      <Help text={field.help} error={error} />
    </label>
  );
}
