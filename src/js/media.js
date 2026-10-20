// Video thumbnails on cards: load and loop silently only while on screen.
(() => {
  const videos = document.querySelectorAll('video[data-autoplay]');
  if (!videos.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    // Show the poster / first frame only.
    videos.forEach((video) => {
      video.preload = 'metadata';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.preload !== 'auto') video.preload = 'auto';
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    },
    { rootMargin: '100px 0px', threshold: 0.25 },
  );

  videos.forEach((video) => observer.observe(video));
})();
