// "Email me" menu: Gmail / Outlook / default app / copy address.
// The trigger is a real mailto: link, so it still works without JavaScript.
(() => {
  const menus = document.querySelectorAll('[data-email-menu]');
  if (!menus.length) return;

  const close = (menu, { focusTrigger = false } = {}) => {
    const trigger = menu.querySelector('.email-menu__trigger');
    const panel = menu.querySelector('.email-menu__panel');
    if (panel.hidden) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focusTrigger) trigger.focus();
  };

  menus.forEach((menu) => {
    const trigger = menu.querySelector('.email-menu__trigger');
    const panel = menu.querySelector('.email-menu__panel');

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const opening = panel.hidden;
      menus.forEach((other) => other !== menu && close(other));
      panel.hidden = !opening;
      trigger.setAttribute('aria-expanded', String(opening));
      if (opening) panel.querySelector('.email-menu__item')?.focus();
    });

    // Picking an option closes the menu (links still open normally).
    panel.querySelectorAll('a.email-menu__item').forEach((link) => link.addEventListener('click', () => close(menu)));

    const copyButton = panel.querySelector('[data-copy]');
    copyButton?.addEventListener('click', async () => {
      const label = copyButton.querySelector('span');
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copy);
        label.textContent = 'Copied!';
      } catch {
        label.textContent = copyButton.dataset.copy; // clipboard blocked — show it so it can be selected
      }
      setTimeout(() => {
        label.textContent = 'Copy address';
        close(menu, { focusTrigger: true });
      }, 1400);
    });

    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close(menu, { focusTrigger: true });
    });
  });

  document.addEventListener('click', (event) => {
    menus.forEach((menu) => {
      if (!menu.contains(event.target)) close(menu);
    });
  });
})();
