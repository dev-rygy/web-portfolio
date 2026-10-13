// Technical features with media: when the text runs far past its media, the media floats so the text
// (and any code blocks) can use the full width under it. Short sections keep the two-column layout.
(() => {
  // Wrap once the empty space under the media, beside the text, is at least this many times the media's height.
  const WRAP_RATIO = 1.2;

  const mains = [...document.querySelectorAll('.feature__main')].filter((main) => main.querySelector(':scope > .feature__media'));
  if (!mains.length) return;

  // Always measured side by side, so wrapping can never change its own decision.
  const layout = (main) => {
    const text = main.querySelector(':scope > .feature__text');
    const media = main.querySelector(':scope > .feature__media');
    main.classList.remove('feature__main--wrap');
    const sideBySide = media.offsetLeft > text.offsetLeft; // false when stacked on narrow screens or in a hidden tab
    const space = text.offsetHeight - media.offsetHeight;
    main.classList.toggle('feature__main--wrap', sideBySide && space >= media.offsetHeight * WRAP_RATIO);
  };

  mains.forEach(layout);
  if (!('ResizeObserver' in window)) return;

  // Re-check when a tab panel opens, the window resizes, or fonts and media finish loading.
  const queued = new Set();
  const flush = () => {
    queued.forEach(layout);
    queued.clear();
  };
  const observer = new ResizeObserver((entries) => {
    if (!queued.size) requestAnimationFrame(flush);
    for (const entry of entries) queued.add(entry.target.closest('.feature__main'));
  });
  for (const main of mains) {
    observer.observe(main);
    observer.observe(main.querySelector(':scope > .feature__media'));
  }
})();
