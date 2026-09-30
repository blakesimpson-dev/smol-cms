// Links to another page close the menu by navigating; same-page anchors
// (e.g. /#contact on the home page) need closing here
const menu = document.getElementById('site-menu');

menu?.addEventListener('click', e => {
  if (e.target.closest('a')) {
    menu.hidePopover();
  }
});
