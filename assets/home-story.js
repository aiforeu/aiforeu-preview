/* AIFOREU homepage: a small opening film, the walk along five workplaces, the statement that lights up, the moving pictures.
   Without this script the workplaces follow one another down the page, the heading is fully lit and the pictures stay still. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);
  const header = document.querySelector('.global-header');
  const moving = !reduced.matches && !navigator.connection?.saveData;   // clips play at all
  const fetchClip = clip => { if (moving && clip && !clip.src) { clip.preload = 'auto'; clip.src = clip.dataset.src; } };

  // 1 · The small opening film and the words give way as the page moves on.
  const night = document.querySelector('[data-night]');
  let nightFrame = 0, nightEnd = 0;
  const paintNight = () => {
    nightFrame = 0;
    const out = reduced.matches ? 0 : clamp(scrollY / Math.max(1, night.offsetHeight * .9));
    night.style.setProperty('--night-out', out.toFixed(3));
  };

  // 2 · The walk. Scroll moves the row of workplaces sideways; the light is on the one in front of you.
  const walk = document.querySelector('[data-walk]');
  const stage = walk?.querySelector('.walk-stage');
  const scenes = walk ? [...walk.querySelectorAll('[data-walk-scene]')] : [];
  const rail = walk?.querySelector('[data-walk-rail]');
  const stops = rail ? [...rail.querySelectorAll('[data-walk-go]')] : [];
  const films = scenes.map(scene => scene.querySelector('video'));
  const last = scenes.length - 1;
  let pinned = false, start = 0, span = 1, tall = 0, current = null, goal = 0, frame = 0, before = 0, active = -1, ride = null;
  walk?.style.setProperty('--walk-steps', last);

  function measure() {
    if (night) nightEnd = night.offsetTop + night.offsetHeight;
    if (!walk) return;
    start = walk.getBoundingClientRect().top + scrollY;
    tall = stage.offsetHeight;
    span = Math.max(1, walk.offsetHeight - tall);
  }
  // Each workplace holds for a moment before the row moves on; in between the row follows the scroll almost evenly.
  function wanted() {
    const raw = clamp((scrollY - start) / span) * last, segment = Math.min(last - 1, Math.floor(raw));
    const part = clamp((raw - segment - .1) / .8);
    return segment + (part + ease(part)) / 2;
  }
  function apply(position) {
    walk.style.setProperty('--walk-p', position.toFixed(4));
    walk.style.setProperty('--walk-arrive', ease(clamp((scrollY - start + tall) / (tall * .8))).toFixed(3));
    const onScreen = scrollY > start - tall && scrollY < start + span + tall;
    scenes.forEach((scene, index) => {
      const off = index - position, distance = Math.min(1, Math.abs(off)), light = 1 - ease(clamp((distance - .16) / .8));
      scene.style.setProperty('--walk-off', off.toFixed(4));
      scene.style.setProperty('--walk-light', light.toFixed(3));
      scene.style.setProperty('--walk-read', (1 - ease(clamp((distance - .1) / .56))).toFixed(3));
      scene.toggleAttribute('data-walk-away', distance > .5);
      scene.toggleAttribute('data-walk-dark', light < .004);
      // A clip runs only while its desk has light.
      const film = films[index];
      if (!moving || !film) return;
      if (onScreen && light > .02) { fetchClip(film); if (film.paused) film.play().catch(() => {}); }
      else if (!film.paused) film.pause();
    });
    rail?.style.setProperty('--walk-progress', ((position + 1) / scenes.length).toFixed(4));
    const index = Math.round(position);
    if (index === active) return;
    active = index;
    stops.forEach((stop, i) => { if (i === index) stop.setAttribute('aria-current', 'step'); else stop.removeAttribute('aria-current'); });
    fetchClip(films[index + 1]);   // the next clip is ready before its desk arrives
  }
  function step(now) {
    frame = 0;
    const elapsed = before ? Math.min(64, now - before) : 16; before = now;
    if (ride) {
      // A chosen workplace: one even glide there, however many desks lie in between.
      const part = clamp((now - ride.since) / ride.length), glide = part < .5 ? 4 * part ** 3 : 1 - (-2 * part + 2) ** 3 / 2;
      current = ride.from + (ride.to - ride.from) * glide;
      if (part >= 1) { current = goal = ride.to; ride = null; }
    } else if (current === null) current = goal;
    else { current += (goal - current) * (1 - Math.exp(-elapsed / 80)); if (Math.abs(goal - current) < .0015) current = goal; }
    apply(current);
    if (ride || current !== goal) frame = requestAnimationFrame(step); else before = 0;
  }
  function follow() {
    if (!pinned || ride) return;
    goal = wanted();
    if (!frame) frame = requestAnimationFrame(step);
  }
  const letGo = () => { if (ride) { ride = null; follow(); } };   // the visitor scrolls on their own again
  function go(index, instant) {
    if (index < 0 || index > last) return;
    measure();
    if (!pinned) { scrollTo({ top: scenes[index].getBoundingClientRect().top + scrollY - (header?.offsetHeight || 0), behavior: 'instant' }); return; }
    const top = start + index / last * span, inFront = scrollY >= start - 2 && scrollY <= start + span + 2;
    if (instant || !inFront || current === null) { ride = null; scrollTo({ top, behavior: instant ? 'instant' : 'smooth' }); return; }
    // The page jumps to the workplace's place at once; the row itself glides there.
    ride = { from: current, to: index, since: performance.now(), length: 620 + 260 * Math.min(3, Math.abs(index - current)) };
    scrollTo({ top, behavior: 'instant' });
    if (!frame) frame = requestAnimationFrame(step);
  }
  function arrange() {
    if (!walk) return;
    pinned = !reduced.matches;
    walk.toggleAttribute('data-walk-pinned', pinned);
    if (rail) rail.hidden = !pinned;
    if (!pinned) {
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      for (const name of ['--walk-p', '--walk-arrive']) walk.style.removeProperty(name);
      scenes.forEach(scene => { for (const name of ['--walk-off', '--walk-light', '--walk-read']) scene.style.removeProperty(name); scene.removeAttribute('data-walk-away'); scene.removeAttribute('data-walk-dark'); });
      films.forEach(film => film?.pause());
      active = -1;
    }
    measure(); current = null; follow();
  }

  // The header has no bar of its own while the film and the travelling row are behind it.
  function paintHeader() {
    if (!header) return;
    const clear = pinned ? start + span + header.offsetHeight + 4 : nightEnd;
    header.toggleAttribute('data-solid', scrollY > clear - header.offsetHeight - 2);
  }
  function onScroll() {
    if (night && !nightFrame && scrollY < nightEnd) nightFrame = requestAnimationFrame(paintNight);
    follow(); paintHeader();
  }

  if (night || walk) {
    arrange(); paintHeader(); if (night) paintNight();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', () => { measure(); onScroll(); });
    addEventListener('load', () => { measure(); onScroll(); });
    reduced.addEventListener('change', () => { ride = null; arrange(); onScroll(); });
    for (const input of ['wheel', 'touchstart']) addEventListener(input, letGo, { passive: true });
    stops.forEach((stop, index) => stop.addEventListener('click', () => go(index)));
    document.querySelector('.night-start')?.addEventListener('click', event => { if (walk) { event.preventDefault(); go(0); } });
    // Arrow keys step along the row while it is in front of you.
    addEventListener('keydown', event => {
      if (!pinned || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) letGo(); return; }
      if (event.target.closest?.('input,textarea,select,[contenteditable],dialog[open]') || scrollY < start - 2 || scrollY > start + span + 2) return;
      event.preventDefault(); go((ride ? ride.to : Math.round(current ?? 0)) + (event.key === 'ArrowRight' ? 1 : -1));
    });
    // Keyboard: a link in a workplace that is not in front of you brings its workplace there.
    walk?.addEventListener('focusin', event => {
      const index = scenes.indexOf(event.target.closest?.('[data-walk-scene]'));
      if (pinned && index >= 0 && index !== active) go(index, true);
    });
  }

  // 3 · Words light up one after the other while the heading crosses the screen.
  const heading = document.querySelector('[data-story-words]');
  if (heading && !reduced.matches) {
    const words = [];
    const split = node => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === Node.ELEMENT_NODE) { split(child); continue; }
        if (child.nodeType !== Node.TEXT_NODE) continue;
        const pieces = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part.trim()) { pieces.append(part); continue; }
          const word = document.createElement('span');
          word.className = 'story-word'; word.textContent = part; words.push(word); pieces.append(word);
        }
        child.replaceWith(pieces);
      }
    };
    split(heading);
    let wordsFrame = 0;
    const paint = () => {
      wordsFrame = 0;
      const box = heading.getBoundingClientRect();
      // Starts as the heading enters from below, complete once it has reached the upper third.
      const read = clamp((innerHeight * .9 - box.top) / (innerHeight * .56));
      words.forEach((word, index) => { word.style.opacity = (.2 + .8 * clamp(read * (words.length + 1.5) - index)).toFixed(3); });
    };
    const schedule = () => { if (!wordsFrame) wordsFrame = requestAnimationFrame(paint); };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    paint();
  }

  // 4 · Clips load and play only while they are on screen; the still picture stays underneath.
  //     (The workplace clips are started and stopped by the walk above.)
  const clips = [...document.querySelectorAll('video[data-story-video]')];
  if (clips.length && 'IntersectionObserver' in window && moving) {
    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) { target.pause(); continue; }
        if (target.ended && !target.loop) continue;
        fetchClip(target);
        target.play().catch(() => {});
      }
    }, { rootMargin: '25% 0px' });
    for (const clip of clips) {
      clip.addEventListener('playing', () => clip.setAttribute('data-playing', ''), { once: true });
      if (!films.includes(clip)) observer.observe(clip);
    }
  }
})();
