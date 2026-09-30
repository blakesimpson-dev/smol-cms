import {refresh} from './form_state.js';
import {newItem, remaining} from './items.js';

const MAX_EDGE = 2560;
const JPEG_QUALITY = 0.85;
const RESIZABLE = /^image\/(jpeg|webp|heic|heif)$/;
const UPLOAD_TIMEOUT_MS = 120_000;
const THUMB_TRANSFORM = 'f_auto,q_auto,w_480,c_limit';
export const LOGGED_OUT =
  "You've been logged out. Log in again in a new tab, then try again";
const pending = new WeakMap();

// Phone photos are often 5-15 MB; downscaling here makes uploads fast on
// mobile data, applies EXIF rotation and drops location metadata
async function resize(file) {
  if (!RESIZABLE.test(file.type)) {
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
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
    });
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
    throw new Error(LOGGED_OUT);
  }
  const body = parseJson(await res.text());
  if (!res.ok) {
    throw new Error(
      body.error || `Couldn't start the upload (error ${res.status})`,
    );
  }

  return body;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
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
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      const body = parseJson(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
      } else {
        reject(
          new Error(body.error?.message || `Upload failed (${xhr.status})`),
        );
      }
    });
    xhr.addEventListener('error', () => {
      reject(new Error('Network error, check your connection'));
    });
    xhr.addEventListener('timeout', () => {
      reject(new Error('The upload timed out, check your connection'));
    });
    xhr.send(data);
  });
}

function setValue(item, suffix, value) {
  item.querySelector(`input[name$=".${suffix}"]`).value = value;
}

function applyResult(item, result) {
  setValue(item, 'id', result.public_id);
  setValue(item, 'width', result.width);
  setValue(item, 'height', result.height);
  const featured = item.querySelector('input[name$=".featured"]');
  if (featured) {
    featured.value = result.public_id;
  }

  // Swap the local preview for the hosted image and free the local copy
  const thumb = item.querySelector('.thumb');
  const preview = thumb.src;
  thumb.addEventListener(
    'load',
    () => {
      URL.revokeObjectURL(preview);
    },
    {once: true},
  );
  thumb.src = result.secure_url.replace(
    '/upload/',
    `/upload/${THUMB_TRANSFORM}/`,
  );
}

export async function upload(item) {
  const progress = item.querySelector('progress');
  const status = item.querySelector('.item-status');
  const retry = item.querySelector('[data-retry]');
  const form = item.closest('form');

  item.dataset.uploading = '';
  delete item.dataset.failed;
  retry.hidden = true;
  progress.hidden = false;
  progress.value = 0;
  status.textContent = 'Uploading…';
  refresh(form);

  try {
    const file = await resize(pending.get(item));
    const request = await getUploadRequest();
    const result = await send(request, file, percent => {
      progress.value = percent;
    });
    applyResult(item, result);
    pending.delete(item);
    status.textContent = '';
    item.querySelector('input[name$=".alt"]').focus();
  } catch (err) {
    item.dataset.failed = '';
    status.textContent = `${err.message}. Tap Retry or remove it.`;
    retry.hidden = false;
  } finally {
    delete item.dataset.uploading;
    progress.hidden = true;
    refresh(form);
  }
}

export function addFiles(field, files) {
  const multiple = field.dataset.multiple === 'true';
  const images = files.filter(file => file.type.startsWith('image/'));
  if (images.length === 0) {
    return;
  }
  if (!multiple) {
    field.querySelector('.item-list').replaceChildren();
  }
  const room = multiple ? remaining(field) : 1;
  if (images.length > room) {
    alert(
      room > 0
        ? `Only ${room} more image(s) can be added here, so the rest were skipped.`
        : 'This gallery is full. Remove an image first.',
    );
  }
  for (const file of images.slice(0, Math.max(0, room))) {
    const item = newItem(field);
    item.querySelector('.thumb').src = URL.createObjectURL(file);
    pending.set(item, file);
    void upload(item);
  }
}
