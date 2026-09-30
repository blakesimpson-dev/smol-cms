// Event delegation keeps these working after htmx swaps a form
import {updateCounter} from './counter.js';
import {anyDirty, refresh, track} from './form_state.js';
import {addListItem, moveItem, removeItem} from './items.js';
import {pageOf, showPage} from './pager.js';
import {LOGGED_OUT, addFiles, upload} from './uploader.js';

function setUp(form) {
  for (const field of form.querySelectorAll('[data-image-field]')) {
    showPage(field, 1);
  }
  track(form);
}

document.addEventListener('click', e => {
  const button = e.target.closest('button');
  if (!button) {
    return;
  }
  const item = button.closest('[data-item]');

  if (button.matches('[data-upload]')) {
    button.parentElement.querySelector('input[type=file]').click();
  } else if (button.matches('[data-retry]')) {
    void upload(item);
  } else if (button.matches('[data-remove]')) {
    removeItem(item);
  } else if (button.matches('[data-move]')) {
    moveItem(item, button.dataset.move);
  } else if (button.matches('[data-add]')) {
    addListItem(button.closest('[data-list-field]'));
  } else if (button.matches('[data-page]')) {
    showPage(button.closest('fieldset'), Number(button.dataset.page));
  }
});

document.addEventListener('input', e => {
  if (e.target.matches('[data-recommended]')) {
    updateCounter(e.target);
  }
  const form = e.target.closest('[data-section-form]');
  if (form) {
    refresh(form);
  }
});

document.addEventListener('change', e => {
  if (e.target.matches('[data-image-field] input[type=file]')) {
    addFiles(e.target.closest('[data-image-field]'), [...e.target.files]);
    e.target.value = '';
  }
  const form = e.target.closest('[data-section-form]');
  if (form) {
    refresh(form);
  }
});

document.addEventListener('dragover', e => {
  const zone = e.target.closest('[data-drop-zone]');
  if (zone) {
    e.preventDefault();
    zone.classList.add('dragging');
  }
});

document.addEventListener('dragleave', e => {
  e.target.closest('[data-drop-zone]')?.classList.remove('dragging');
});

document.addEventListener('drop', e => {
  const zone = e.target.closest('[data-drop-zone]');
  if (zone) {
    e.preventDefault();
    zone.classList.remove('dragging');
    addFiles(zone.closest('[data-image-field]'), [...e.dataTransfer.files]);
  }
});

// The browser's own "Leave site? Changes you made may not be saved" prompt
window.addEventListener('beforeunload', e => {
  if (anyDirty()) {
    e.preventDefault();
    // Older Safari needs returnValue set as well
    e.returnValue = '';
  }
});

// The browser can't point at an invalid field on a hidden gallery page, so
// it would block the save without saying why. The first invalid field in each
// check is the one it reports, so its page is shown
let revealing = false;
document.addEventListener(
  'invalid',
  e => {
    if (revealing) {
      return;
    }
    revealing = true;
    queueMicrotask(() => {
      revealing = false;
    });
    const item = e.target.closest('[data-item]');
    if (item?.hidden) {
      showPage(item.closest('fieldset'), pageOf(item));
    }
  },
  true,
);

// htmx leaves the form as it is when a save fails, so say what happened
function showSaveError(form, message) {
  const note = document.createElement('del');
  note.textContent = message;
  form.querySelector('.form-footer [role=status]').replaceChildren(note);
  refresh(form);
}

document.addEventListener('htmx:responseError', e => {
  const form = e.detail.elt.closest('[data-section-form]');
  if (form) {
    showSaveError(
      form,
      e.detail.xhr.status === 401
        ? LOGGED_OUT
        : "Couldn't save, please try again",
    );
  }
});

document.addEventListener('htmx:sendError', e => {
  const form = e.detail.elt.closest('[data-section-form]');
  if (form) {
    showSaveError(form, "Couldn't save, check your connection and try again");
  }
});

// A saved form is swapped for a fresh copy from the server
document.addEventListener('htmx:load', e => {
  if (e.detail.elt.matches('[data-section-form]')) {
    setUp(e.detail.elt);
  }
});

for (const form of document.querySelectorAll('[data-section-form]')) {
  setUp(form);
}
