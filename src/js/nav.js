// Mobile nav toggle (hamburger shown below 900px).
(() => {
  const button = document.querySelector('.site-header__menu');
  const nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      button.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (nav.classList.contains('is-open') && !nav.contains(event.target) && !button.contains(event.target)) {
      setOpen(false);
    }
  });
})();
