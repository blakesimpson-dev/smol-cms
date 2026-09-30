import {TrashIcon} from '../icons';

interface ItemActionsProps {
  movable?: boolean;
  retry?: boolean;
}

export function ItemActions({movable, retry}: ItemActionsProps) {
  return (
    <div class="item-actions">
      {movable && (
        <>
          <button
            type="button"
            class="outline secondary"
            data-move="up"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            class="outline secondary"
            data-move="down"
            aria-label="Move down"
          >
            ↓
          </button>
        </>
      )}
      {retry && (
        <button type="button" class="outline" data-retry hidden>
          Retry
        </button>
      )}
      <button type="button" class="remove" data-remove aria-label="Remove">
        <TrashIcon />
      </button>
    </div>
  );
}
