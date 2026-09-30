// Save stays disabled ("Up to date") until the form differs from how it
// loaded, so reverting a change disables it again
const initial = new WeakMap();

function snapshot(form) {
  return new URLSearchParams(new FormData(form)).toString();
}

export function isDirty(form) {
  if (form.dataset.unsaved !== undefined) {
    return true;
  }

  return initial.has(form) && snapshot(form) !== initial.get(form);
}

export function refresh(form) {
  const submit = form.querySelector('button[type=submit]');
  const uploading = form.querySelector('[data-uploading]') !== null;
  const failed = form.querySelector('[data-failed]') !== null;
  const dirty = isDirty(form);
  if (dirty) {
    // After an edit, "Saved ✓" no longer describes the form
    delete form.dataset.saved;
  }

  submit.disabled = !dirty || uploading || failed;
  submit.classList.toggle('clean', !dirty);
  submit.setAttribute('aria-busy', String(uploading));
  if (uploading) {
    submit.textContent = 'Uploading…';
  } else if (dirty) {
    submit.textContent = 'Save';
  } else {
    submit.textContent =
      form.dataset.saved === undefined ? 'Up to date' : 'Saved ✓';
  }
}

export function track(form) {
  initial.set(form, snapshot(form));
  refresh(form);
}

export function anyDirty() {
  return [...document.querySelectorAll('[data-section-form]')].some(isDirty);
}
