// Homepage project carousel.
// - Each clip plays up to its cap (home.json → carousel.maxSeconds, default 15 s), then advances and loops.
// - Each progress bar fills with the current clip's playback time; hover highlights, click jumps.
// - The pause button toggles playback; the carousel also pauses when off screen or the tab is hidden.
// - Only the current clip is loaded, so the page never downloads every video up front.
// - The project title types itself in the top-left corner behind a terminal cursor, blinks for ~5 s, then
//   backspaces away. It is timed off the clip's playback, so it pauses, jumps and restarts with the video.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TYPE_DELAY = 0.4; // s of clip before the first letter
  const TYPE_MAX = 2; // s at most to type a title; long ones type faster so they still get a long hold
  const HOLD = 5; // s the full title stays up (less if the clip is too short to erase it in time)
  const ERASE_STEP = 0.04; // s per backspaced letter
  const ERASE_MAX = 1; // s at most to backspace a title
  const ERASE_MARGIN = 0.4; // s between the last backspace and the end of the clip
  const CURSOR_LINGER = 0.25; // s the cursor stays after the last letter is gone

  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const dataEl = root.querySelector('.carousel__data');
    const clips = dataEl ? JSON.parse(dataEl.textContent) : [];
    const stage = root.querySelector('.carousel__stage');
    const video = stage?.querySelector('video');
    const bars = [...root.querySelectorAll('.carousel__bar')];
    const fills = bars.map((bar) => bar.querySelector('.carousel__fill'));
    const toggle = root.querySelector('.carousel__toggle');
    const title = stage?.querySelector('.carousel__title');
    const titleText = title?.querySelector('.carousel__title-text');
    if (!clips.length || !video) return;

    let index = 0;
    let userPaused = reduceMotion;
    let onScreen = true;
    let frame = 0;
    let typed = []; // clip time at which each letter of the current title appears

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

    // Each letter lands 65–135 ms after the last, like the header name, so it feels typed by hand.
    const scheduleTitle = (text) => {
      const pace = Math.min(1, TYPE_MAX / (text.length * 0.1));
      let time = TYPE_DELAY;
      typed = [...text].map(() => (time += (0.065 + Math.random() * 0.07) * pace));
    };

    const renderTitle = () => {
      if (!title) return;
      const text = clips[index].title;
      let shown = text.length;
      let state = 'static';

      if (!reduceMotion) {
        const clip = clips[index];
        const time = video.currentTime - clip.start;
        const typedEnd = typed.at(-1) ?? TYPE_DELAY;
        const eraseStep = Math.min(ERASE_STEP, ERASE_MAX / text.length);
        const eraseTime = text.length * eraseStep;
        const room = clipEnd(clip) - clip.start - typedEnd - eraseTime - ERASE_MARGIN;
        const eraseStart = typedEnd + Math.max(0, Math.min(HOLD, room));

        if (time < typedEnd) {
          shown = typed.filter((at) => at <= time).length;
          state = 'typing';
        } else if (time < eraseStart) {
          state = 'holding';
        } else {
          shown = Math.max(0, text.length - Math.ceil((time - eraseStart) / eraseStep));
          state = time < eraseStart + eraseTime + CURSOR_LINGER ? 'erasing' : 'done';
        }
      }

      const visible = text.slice(0, shown);
      if (titleText.textContent !== visible) titleText.textContent = visible;
      if (title.dataset.state !== state) title.dataset.state = state;
    };

    const render = () => {
      fills.forEach((fill, i) => {
        fill.style.width = i === index ? `${progress() * 100}%` : '0%';
      });
      renderTitle();
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
      scheduleTitle(clip.title);

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
