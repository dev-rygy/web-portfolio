// Header: typewriter name (once per visit) + blinking cursor + animated noise over the motion graphic.
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Typewriter ----------------------------------------------------------
  const nameEl = document.querySelector('[data-typewriter]');
  const cursor = document.querySelector('.site-header__cursor');

  const startBlinking = () => {
    if (!reduceMotion) cursor?.classList.add('is-blinking');
  };

  const markTyped = () => {
    try {
      sessionStorage.setItem('rc-typed', '1');
    } catch {
      /* storage blocked — animation will simply replay */
    }
  };

  if (nameEl && root.classList.contains('will-type')) {
    const fullName = nameEl.textContent;
    nameEl.textContent = '';
    nameEl.style.visibility = 'visible';
    root.classList.remove('will-type');

    let i = 0;
    const typeNext = () => {
      nameEl.textContent = fullName.slice(0, ++i);
      if (i < fullName.length) {
        // Slight variation so it feels like real typing.
        setTimeout(typeNext, 65 + Math.random() * 70);
      } else {
        markTyped();
        startBlinking();
      }
    };
    setTimeout(typeNext, 350);
  } else {
    startBlinking();
  }

  // ---- Multi-colored noise overlay -----------------------------------------
  if (reduceMotion) document.querySelector('.site-header__video')?.pause();

  const canvas = document.querySelector('.site-header__noise');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  const image = ctx.createImageData(width, height);
  const data = image.data;

  const drawNoise = () => {
    for (let p = 0; p < data.length; p += 4) {
      data[p] = Math.random() * 255;
      data[p + 1] = Math.random() * 255;
      data[p + 2] = Math.random() * 255;
      data[p + 3] = Math.random() * 120;
    }
    ctx.putImageData(image, 0, 0);
  };

  drawNoise();
  if (reduceMotion) return;

  // ~12 fps is plenty for film-grain style noise and keeps CPU use low.
  let last = 0;
  let running = true;
  const loop = (time) => {
    if (!running) return;
    if (time - last > 80) {
      drawNoise();
      last = time;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });
})();
