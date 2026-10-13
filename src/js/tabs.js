// Feature Tab Panel on project pages: one feature visible at a time (WAI-ARIA tabs pattern).
(() => {
  for (const root of document.querySelectorAll('[data-tabs]')) {
    const list = root.querySelector('[role="tablist"]');
    const tabs = [...list.querySelectorAll('[role="tab"]')];

    const select = (tab, focus = false) => {
      for (const t of tabs) {
        const selected = t === tab;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!selected && !panel.hidden) {
          // Stop anything playing in the panel being hidden (YouTube stops when its iframe reloads).
          panel.querySelectorAll('video:not([data-autoplay])').forEach((video) => video.pause());
          panel.querySelectorAll('iframe').forEach((iframe) => {
            iframe.src = iframe.src;
          });
        }
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        panel.hidden = !selected;
      }
      if (focus) tab.focus();
    };

    list.addEventListener('click', (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (tab && tab.getAttribute('aria-selected') !== 'true') select(tab);
    });

    list.addEventListener('keydown', (event) => {
      const i = tabs.indexOf(document.activeElement);
      const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (i < 0 || target === undefined) return;
      event.preventDefault();
      select(tabs[(target + tabs.length) % tabs.length], true);
    });

    // When tabs wrap, put a card-colored strip behind each extra row, as wide as the row above it,
    // so no page background shows between a tab and the panel.
    const layoutFills = () => {
      const origin = list.getBoundingClientRect();
      const rows = [];
      for (const tab of tabs) {
        const box = tab.getBoundingClientRect();
        const top = box.top - origin.top;
        const right = box.right - origin.left;
        const row = rows.at(-1);
        if (row && Math.abs(row.top - top) < 2) {
          row.right = Math.max(row.right, right);
          row.height = Math.max(row.height, box.height);
        } else {
          rows.push({ top, height: box.height, right });
        }
      }
      list.querySelectorAll('.feature-tabs__fill').forEach((fill) => fill.remove());
      rows.slice(1).forEach((row, i) => {
        const fill = document.createElement('span');
        fill.className = 'feature-tabs__fill';
        fill.setAttribute('aria-hidden', 'true');
        fill.style.cssText = `top:${row.top}px;height:${row.height}px;width:${rows[i].right}px`;
        list.append(fill);
      });
    };
    layoutFills();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(layoutFills);
      observer.observe(list);
      tabs.forEach((tab) => observer.observe(tab));
    }
  }
})();
