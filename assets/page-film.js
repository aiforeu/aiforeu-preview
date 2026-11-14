/* AIFOREU subpages: the filmed stage at the top of a page.
   The clip loads and plays only while the stage is on screen; the still picture stays underneath.
   Once the stage has passed, the header gets its usual light bar back.
   Without this script the still picture is shown and the header keeps the stage's dark bar. */
(() => {
  'use strict';
  const stage = document.querySelector('[data-film-hero]');
  const header = document.querySelector('.global-header');
  if (stage && header) {
    let waiting = false;
    const paint = () => {
      waiting = false;
      header.toggleAttribute('data-solid', stage.getBoundingClientRect().bottom <= header.offsetHeight);
    };
    const schedule = () => { if (!waiting) { waiting = true; requestAnimationFrame(paint); } };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    paint();
  }

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData;
  const clips = [...document.querySelectorAll('video[data-film-clip]')];
  if (still || !clips.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) { target.pause(); continue; }
      if (!target.src) { target.preload = 'auto'; target.src = target.dataset.src; }
      target.play().catch(() => {});
    }
  }, { rootMargin: '20% 0px' });
  for (const clip of clips) {
    clip.addEventListener('playing', () => clip.setAttribute('data-playing', ''), { once: true });
    observer.observe(clip);
  }
})();
