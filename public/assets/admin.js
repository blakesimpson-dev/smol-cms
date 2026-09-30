// Image fields in the admin: upload via the Cloudinary Upload Widget, remove, and enforce the max count.
// Uses event delegation so it keeps working after htmx swaps a form.

const thumbUrl = (cloud, id) => `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_240,h_160,c_fill,g_auto/${id}`;

async function signature(callback, paramsToSign) {
  const res = await fetch("/admin/cloudinary-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paramsToSign),
  });
  if (res.status === 401) return (window.location.href = "/admin/login");
  if (!res.ok) return alert("Upload failed: " + ((await res.json().catch(() => ({}))).error ?? res.statusText));
  callback((await res.json()).signature);
}

function addImage(field, info) {
  const list = field.querySelector(".img-list");
  const multiple = field.dataset.multiple === "true";
  const max = Number(field.dataset.max) || Infinity;
  if (!multiple) list.replaceChildren();
  if (list.children.length >= max) return;

  const item = field.querySelector("template").content.firstElementChild.cloneNode(true);
  const set = (suffix, value) => (item.querySelector(`input[name$=".${suffix}"]`).value = value);
  set("id", info.public_id);
  set("width", info.width);
  set("height", info.height);
  item.querySelector("img").src = thumbUrl(document.body.dataset.cloud, info.public_id);
  list.append(item);
  item.querySelector('input[name$=".alt"]').focus();
}

function openUploader(field) {
  const { cloud, apiKey, folder } = document.body.dataset;
  const multiple = field.dataset.multiple === "true";
  const max = Number(field.dataset.max) || Infinity;
  const remaining = multiple ? max - field.querySelector(".img-list").children.length : 1;
  if (remaining <= 0) return alert(`You can add at most ${max} images. Remove one first.`);

  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: cloud,
      apiKey,
      folder,
      uploadSignature: signature,
      sources: ["local", "camera", "url"],
      multiple,
      maxFiles: Number.isFinite(remaining) ? remaining : undefined,
      resourceType: "image",
      clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif", "gif", "heic"],
      maxImageFileSize: 20_000_000,
    },
    (error, result) => {
      if (error) console.error(error);
      else if (result.event === "success") addImage(field, result.info);
    },
  );
  widget.open();
}

document.addEventListener("click", (e) => {
  const upload = e.target.closest("[data-upload]");
  if (upload) {
    if (!window.cloudinary) return alert("The uploader is still loading — try again in a moment.");
    openUploader(upload.closest("[data-image-field]"));
  }
  const remove = e.target.closest("[data-remove]");
  if (remove) remove.closest(".img-item").remove();
});
