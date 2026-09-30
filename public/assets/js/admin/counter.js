const BUSY_NOTE = ' - this may look busy on the page';

export function updateCounter(input) {
  const counter = input.parentElement.querySelector('.counter');
  if (!counter) {
    return;
  }
  const recommended = Number(input.dataset.recommended);
  const length = input.value.length;
  const over = length > recommended;
  counter.textContent = `${length} / ${recommended}${over ? BUSY_NOTE : ''}`;
  counter.classList.toggle('over', over);
}
