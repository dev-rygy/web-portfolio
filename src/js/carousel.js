// Homepage project carousel.
// - Each clip plays up to its cap (home.json → carousel.maxSeconds, default 15 s), then advances and loops.
// - Each progress bar fills with the current clip's playback time; hover highlights, click jumps.
// - The pause button toggles playback; the carousel also pauses when off screen or the tab is hidden.
// - Only the current clip is loaded, so the page never downloads every video up front.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const dataEl = root.querySelector('.carousel__data');
    const clips = dataEl ? JSON.parse(dataEl.textContent) : [];
    const stage = root.querySelector('.carousel__stage');
    const video = stage?.querySelector('video');
    const bars = [...root.querySelectorAll('.carousel__bar')];
    const fills = bars.map((bar) => bar.querySelector('.carousel__fill'));
    const toggle = root.querySelector('.carousel__toggle');
    if (!clips.length || !video) return;

    let index = 0;
    let userPaused = reduceMotion;
    let onScreen = true;
    let frame = 0;

    const clipEnd = (clip) => {
      const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
      return Math.min(clip.start + clip.max, duration);
    };

    const progress = () => {
      const clip = clips[index];
      const length = clipEnd(clip) - clip.start;
      if (!Number.isFinite(length) || length <= 0) return 0;
      return Math.min(Math.max((video.currentTime - clip.start) / length, 0), 1);
    };

    const render = () => {
      fills.forEach((fill, i) => {
        fill.style.width = i === index ? `${progress() * 100}%` : '0%';
      });
    };

    const tick = () => {
      render();
      if (!video.paused && video.readyState > 0 && video.currentTime >= clipEnd(clips[index]) - 0.05) {
        next();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const shouldPlay = () => !userPaused && onScreen && !document.hidden;

    const play = () => {
      if (!shouldPlay()) return;
      video.play().catch(() => {});
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const pause = () => {
      video.pause();
      cancelAnimationFrame(frame);
      render();
    };

    const load = (i) => {
      index = (i + clips.length) % clips.length;
      const clip = clips[index];
      bars.forEach((bar, b) => bar.setAttribute('aria-current', String(b === index)));
      stage.classList.toggle('is-linked', Boolean(clip.url));
      stage.title = clip.url ? `View ${clip.title}` : '';

      if (video.getAttribute('src') !== clip.src) {
        stage.classList.add('is-loading');
        video.poster = clip.poster;
        video.src = clip.src;
      }
      const seek = () => {
        if (clip.start) video.currentTime = clip.start;
        stage.classList.remove('is-loading');
        render();
      };
      if (video.readyState >= 1) seek();
      else video.addEventListener('loadedmetadata', seek, { once: true });

      render();
      play();
    };

    const next = () => load(index + 1);

    const setPaused = (paused) => {
      userPaused = paused;
      toggle?.setAttribute('aria-pressed', String(paused));
      toggle?.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel');
      if (paused) pause();
      else play();
    };

    video.removeAttribute('autoplay');
    video.loop = false;
    video.addEventListener('ended', next);

    bars.forEach((bar, i) => bar.addEventListener('click', () => load(i)));
    toggle?.addEventListener('click', () => setPaused(!userPaused));
    stage.addEventListener('click', () => {
      const url = clips[index].url;
      if (url) window.location.href = url;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen) play();
          else pause();
        },
        { threshold: 0.2 },
      ).observe(root);
    }

    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

    setPaused(userPaused);
    load(0);
  });
})();
