import type {ListFieldDef, ListItem} from '../../content/types';
import {Help} from './help';
import {ItemActions} from './item_actions';
import {TextInput} from './text_input';

interface ListFieldProps {
  field: ListFieldDef;
  value: unknown;
  error?: string;
}

function ListItemRow({
  field,
  item,
}: {
  field: ListFieldDef;
  item?: Partial<ListItem>;
}) {
  return (
    <div class="item list-item" data-item>
      {field.fields.map(sub => (
        <TextInput
          field={sub}
          name={`${field.name}.${sub.name}`}
          value={item?.[sub.name]}
        />
      ))}
      <ItemActions movable />
    </div>
  );
}

export function ListField({field, value, error}: ListFieldProps) {
  const items = Array.isArray(value) ? (value as ListItem[]) : [];

  return (
    <fieldset
      data-list-field
      data-max={field.max ? String(field.max) : undefined}
    >
      <legend>
        {field.label}
        {field.required && ' *'}
      </legend>
      <div class="item-list">
        {items.map(item => (
          <ListItemRow field={field} item={item} />
        ))}
      </div>
      <template>
        <ListItemRow field={field} />
      </template>
      <button type="button" class="secondary" data-add>
        Add {field.itemLabel.toLowerCase()}
      </button>
      <Help text={field.help} error={error} />
    </fieldset>
  );
}
