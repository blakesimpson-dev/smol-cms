const SWIPE_DISTANCE = 50;
const TEMPLATE = `
  <figure><img alt="" sizes="100vw" /><figcaption></figcaption></figure>
  <button type="button" class="prev" aria-label="Previous image">‹</button>
  <button type="button" class="next" aria-label="Next image">›</button>
  <button type="button" class="close" aria-label="Close">×</button>`;

let dialog, image, caption, links, index, touchX;

function show(i) {
  index = (i + links.length) % links.length;
  const link = links[index];
  const thumb = link.querySelector('img');
  image.srcset = thumb.srcset;
  image.src = link.href;
  image.alt = thumb.alt;
  caption.textContent = link.dataset.caption || '';
  dialog.classList.toggle('single', links.length === 1);
}

function onKeydown(e) {
  if (e.key === 'ArrowLeft') {
    show(index - 1);
  } else if (e.key === 'ArrowRight') {
    show(index + 1);
  }
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > SWIPE_DISTANCE) {
    show(dx > 0 ? index - 1 : index + 1);
  }
}

function build() {
  dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.innerHTML = TEMPLATE;
  image = dialog.querySelector('img');
  caption = dialog.querySelector('figcaption');

  dialog.querySelector('.prev').addEventListener('click', () => {
    show(index - 1);
  });
  dialog.querySelector('.next').addEventListener('click', () => {
    show(index + 1);
  });
  dialog.querySelector('.close').addEventListener('click', () => {
    dialog.close();
  });
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener('keydown', onKeydown);
  dialog.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
  });
  dialog.addEventListener('touchend', onTouchEnd);
  document.body.append(dialog);
}

document.addEventListener('click', e => {
  const link = e.target.closest('[data-lightbox] a');
  if (!link || e.metaKey || e.ctrlKey) {
    return;
  }
  e.preventDefault();
  if (!dialog) {
    build();
  }
  links = [...link.closest('[data-lightbox]').querySelectorAll('a')];
  show(links.indexOf(link));
  dialog.showModal();
});
