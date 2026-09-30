// Admin behaviour for image and list fields. Event delegation keeps it working
// after htmx swaps a form

const MAX_EDGE = 2560;
const JPEG_QUALITY = 0.85;
const pending = new WeakMap();

function form(el) {
  return el.closest('form');
}

function updateSubmitState(formEl) {
  const busy = formEl.querySelector('[data-uploading]') !== null;
  const failed = formEl.querySelector('[data-failed]') !== null;
  const submit = formEl.querySelector('button[type=submit]');
  submit.disabled = busy || failed;
  submit.setAttribute('aria-busy', String(busy));
}

function itemCount(field) {
  return field.querySelector('.item-list').children.length;
}

function remaining(field) {
  const max = Number(field.dataset.max) || Infinity;

  return max - itemCount(field);
}

function newItem(field) {
  const template = field.querySelector('template');
  const item = template.content.firstElementChild.cloneNode(true);
  field.querySelector('.item-list').append(item);

  return item;
}

function setValue(item, suffix, value) {
  item.querySelector(`input[name$=".${suffix}"]`).value = value;
}

// Phone photos are often 5-15 MB; downscaling here makes uploads fast on
// mobile data, applies EXIF rotation and drops location metadata
async function resize(file) {
  if (!/^image\/(jpeg|webp|heic|heif)$/.test(file.type)) {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext('2d')
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );
    if (!blob) {
      return file;
    }
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';

    return new File([blob], name, {type: 'image/jpeg'});
  } catch {
    // Browsers that can't decode the format upload the original
    return file;
  }
}

async function getUploadRequest() {
  const res = await fetch('/admin/upload-signature', {method: 'POST'});
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || res.statusText);
  }

  return body;
}

function send(request, file, onProgress) {
  return new Promise((resolve, reject) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(request.fields)) {
      data.append(key, value);
    }
    data.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', request.url);
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      let body = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // Handled below as a generic failure
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
      } else {
        reject(
          new Error(body.error?.message || `Upload failed (${xhr.status})`),
        );
      }
    });
    xhr.addEventListener('error', () =>
      reject(new Error('Network error — check your connection')),
    );
    xhr.send(data);
  });
}

async function upload(item) {
  const file = pending.get(item);
  const progress = item.querySelector('progress');
  const status = item.querySelector('.item-status');
  const retry = item.querySelector('[data-retry]');
  const formEl = form(item);

  item.dataset.uploading = '';
  delete item.dataset.failed;
  retry.hidden = true;
  progress.hidden = false;
  progress.value = 0;
  status.textContent = 'Uploading…';
  updateSubmitState(formEl);

  try {
    const resized = await resize(file);
    const request = await getUploadRequest();
    const result = await send(request, resized, percent => {
      progress.value = percent;
    });
    setValue(item, 'id', result.public_id);
    setValue(item, 'width', result.width);
    setValue(item, 'height', result.height);
    const featured = item.querySelector('input[name$=".featured"]');
    if (featured) {
      featured.value = result.public_id;
    }
    pending.delete(item);
    status.textContent = '';
    item.querySelector('input[name$=".alt"]').focus();
  } catch (err) {
    item.dataset.failed = '';
    status.textContent = err.message;
    retry.hidden = false;
  } finally {
    delete item.dataset.uploading;
    progress.hidden = true;
    updateSubmitState(formEl);
  }
}

function addFiles(field, files) {
  const multiple = field.dataset.multiple === 'true';
  if (!multiple) {
    field.querySelector('.item-list').replaceChildren();
  }
  const room = multiple ? remaining(field) : 1;
  if (files.length > room) {
    alert(
      room > 0
        ? `Only ${room} more image(s) can be added here, so the rest were skipped.`
        : 'This gallery is full. Remove an image first.',
    );
  }
  for (const file of files.slice(0, Math.max(0, room))) {
    const item = newItem(field);
    item.querySelector('.thumb').src = URL.createObjectURL(file);
    pending.set(item, file);
    void upload(item);
  }
}

function move(item, direction) {
  if (direction === 'up' && item.previousElementSibling) {
    item.previousElementSibling.before(item);
  } else if (direction === 'down' && item.nextElementSibling) {
    item.nextElementSibling.after(item);
  }
  item.querySelector(`[data-move="${direction}"]`).focus();
}

document.addEventListener('click', e => {
  const target = e.target.closest('button');
  if (!target) {
    return;
  }
  const item = target.closest('[data-item]');

  if (target.matches('[data-upload]')) {
    target.parentElement.querySelector('input[type=file]').click();
  } else if (target.matches('[data-retry]')) {
    void upload(item);
  } else if (target.matches('[data-remove]')) {
    const formEl = form(item);
    item.remove();
    updateSubmitState(formEl);
  } else if (target.matches('[data-move]')) {
    move(item, target.dataset.move);
  } else if (target.matches('[data-add]')) {
    const field = target.closest('[data-list-field]');
    if (remaining(field) <= 0) {
      alert('This list is full. Remove an item first.');
      return;
    }
    newItem(field).querySelector('input, textarea').focus();
  }
});

document.addEventListener('change', e => {
  if (e.target.matches('[data-image-field] input[type=file]')) {
    const field = e.target.closest('[data-image-field]');
    addFiles(field, [...e.target.files]);
    e.target.value = '';
  }
});
