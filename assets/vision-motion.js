/* Native DOM and CSS motion only. No canvas, WebGL or scroll interception. */
(function () {
  'use strict';
  const root = document.documentElement;
  const language = (root.lang || 'uk').split('-')[0];
  const labels = {
    uk: { reduced: 'Анімацію вимкнено в системі', play: 'Увімкнути анімацію', pause: 'Призупинити анімацію' },
    en: { reduced: 'Animation disabled by system settings', play: 'Play animation', pause: 'Pause animation' },
    ru: { reduced: 'Анимация отключена в настройках системы', play: 'Включить анимацию', pause: 'Приостановить анимацию' }
  }[language] || { reduced: 'Animation disabled by system settings', play: 'Play animation', pause: 'Pause animation' };
  const hero = document.getElementById('hero');
  const toggle = document.getElementById('sceneToggle');
  const field = hero.querySelector('.neural-field');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const printMedia = matchMedia('print');
  let paused = false;
  let printing = false;
  let heroVisible = true;
  let networkReady = false;
  let frameId = 0;
  let lastFrame = 0;

  try { paused = localStorage.getItem('ai-vision-motion') === 'paused'; } catch (error) {}

  function syncMotion() {
    const off = paused || reduced.matches || printing || printMedia.matches || document.hidden;
    root.classList.toggle('motion-off', off);
    toggle.dataset.paused = String(paused || reduced.matches);
    toggle.setAttribute('aria-pressed', String(paused || reduced.matches));
    toggle.setAttribute('aria-disabled', String(reduced.matches));
    const label = reduced.matches ? labels.reduced : paused ? labels.play : labels.pause;
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    setNetworkRunning(!off && heroVisible);
  }

  document.querySelector('.mast-actions').appendChild(toggle);
  toggle.addEventListener('click', function () {
    if (reduced.matches) return;
    paused = !paused;
    try { localStorage.setItem('ai-vision-motion', paused ? 'paused' : 'playing'); } catch (error) {}
    syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  printMedia.addEventListener('change', syncMotion);
  window.addEventListener('beforeprint', function () { printing = true; syncMotion(); });
  window.addEventListener('afterprint', function () { printing = false; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);

  const svgNamespace = 'http://www.w3.org/2000/svg';
  const network = document.createElementNS(svgNamespace, 'svg');
  const lineLayer = document.createElementNS(svgNamespace, 'g');
  const nodeLayer = document.createElementNS(svgNamespace, 'g');
  const maxLines = 110;
  const lineElements = [];
  const nodeElements = [];
  const particles = [];
  const pointer = { x: -1000, y: -1000 };
  let fieldWidth = 1;
  let fieldHeight = 1;
  let linkDistance = 120;

  network.setAttribute('preserveAspectRatio', 'none');
  network.setAttribute('focusable', 'false');
  network.append(lineLayer, nodeLayer);
  field.appendChild(network);

  for (let index = 0; index < maxLines; index++) {
    const line = document.createElementNS(svgNamespace, 'line');
    line.setAttribute('class', 'nn-line');
    line.style.display = 'none';
    lineLayer.appendChild(line);
    lineElements.push(line);
  }

  function randomGenerator(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function rebuildNetwork() {
    const bounds = field.getBoundingClientRect();
    fieldWidth = Math.max(1, Math.round(bounds.width));
    fieldHeight = Math.max(1, Math.round(bounds.height));
    linkDistance = 136;
    network.setAttribute('viewBox', '0 0 ' + fieldWidth + ' ' + fieldHeight);

    const count = Math.min(62, Math.max(18, Math.floor(fieldWidth * fieldHeight / 16000)));
    const random = randomGenerator(fieldWidth * 31 + fieldHeight * 17 + count);
    particles.length = 0;

    while (nodeElements.length < count) {
      const circle = document.createElementNS(svgNamespace, 'circle');
      circle.setAttribute('class', 'nn-node');
      nodeLayer.appendChild(circle);
      nodeElements.push(circle);
    }
    nodeElements.forEach(function (circle, index) {
      circle.style.display = index < count ? '' : 'none';
    });

    for (let index = 0; index < count; index++) {
      particles.push({
        x: random() * fieldWidth,
        y: random() * fieldHeight,
        vx: (random() - .5) * 38,
        vy: (random() - .5) * 38,
        radius: random() * 1.55 + .7,
        opacity: random() * .24 + .58
      });
    }
    drawNetwork();
  }

  function drawNetwork() {
    let lineIndex = 0;
    outer: for (let first = 0; first < particles.length; first++) {
      for (let second = first + 1; second < particles.length; second++) {
        const a = particles[first];
        const b = particles[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance >= linkDistance) continue;
        if (lineIndex >= maxLines) break outer;
        const line = lineElements[lineIndex++];
        line.style.display = '';
        line.setAttribute('x1', a.x.toFixed(1));
        line.setAttribute('y1', a.y.toFixed(1));
        line.setAttribute('x2', b.x.toFixed(1));
        line.setAttribute('y2', b.y.toFixed(1));
        line.setAttribute('stroke-opacity', ((1 - distance / linkDistance) * .46).toFixed(3));
      }
    }
    for (let index = lineIndex; index < lineElements.length; index++) lineElements[index].style.display = 'none';

    particles.forEach(function (particle, index) {
      const node = nodeElements[index];
      const nearPointer = Math.hypot(particle.x - pointer.x, particle.y - pointer.y) < 125;
      node.setAttribute('cx', particle.x.toFixed(1));
      node.setAttribute('cy', particle.y.toFixed(1));
      node.setAttribute('r', (particle.radius + (nearPointer ? .5 : 0)).toFixed(2));
      node.setAttribute('fill-opacity', (nearPointer ? .94 : particle.opacity).toFixed(2));
    });
  }

  function step(timestamp) {
    const elapsed = lastFrame ? Math.min(34, timestamp - lastFrame) : 16;
    const delta = elapsed / 1000;
    lastFrame = timestamp;

    particles.forEach(function (particle) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      if (particle.x < 0) { particle.x = 0; particle.vx = Math.abs(particle.vx); }
      if (particle.x > fieldWidth) { particle.x = fieldWidth; particle.vx = -Math.abs(particle.vx); }
      if (particle.y < 0) { particle.y = 0; particle.vy = Math.abs(particle.vy); }
      if (particle.y > fieldHeight) { particle.y = fieldHeight; particle.vy = -Math.abs(particle.vy); }

      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < 125) {
        const force = (1 - distance / 125) * 42 * delta;
        particle.x += dx / distance * force;
        particle.y += dy / distance * force;
      }
    });
    drawNetwork();
    frameId = requestAnimationFrame(step);
  }

  function setNetworkRunning(run) {
    if (!networkReady) return;
    if (run && !frameId) {
      lastFrame = 0;
      frameId = requestAnimationFrame(step);
    } else if (!run && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  hero.addEventListener('pointermove', function (event) {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const bounds = field.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  });
  hero.addEventListener('pointerleave', function () {
    pointer.x = -1000;
    pointer.y = -1000;
  });

  rebuildNetwork();
  networkReady = true;
  if ('ResizeObserver' in window) new ResizeObserver(rebuildNetwork).observe(field);
  else window.addEventListener('resize', rebuildNetwork);

  const title = hero.querySelector('.title');
  title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());

  document.querySelectorAll('.stagger > *').forEach(function (item, index) {
    item.style.setProperty('--stagger', index);
  });

  function syncReading(state) {
    root.classList.toggle('is-reading', Boolean(state && state.reading));
  }
  syncReading(window.visionReading);
  window.addEventListener('vision:reading', function (event) { syncReading(event.detail); });

  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        heroVisible = entry.isIntersecting;
        entry.target.classList.toggle('is-visible', heroVisible);
        syncMotion();
      });
    }, { threshold: .08 });
    heroObserver.observe(hero);

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('fx-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -7% 0px' });
    document.querySelectorAll('.reveal,.stagger').forEach(function (element) { revealObserver.observe(element); });
  } else {
    document.querySelectorAll('.reveal,.stagger').forEach(function (element) { element.classList.add('fx-in'); });
    hero.classList.add('is-visible');
  }

  root.classList.add('motion-ready');
  syncMotion();

  document.fonts.ready.then(function () {
    const target = document.getElementById(location.hash.slice(1));
    if (target && target.matches('.lvl')) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    window.dispatchEvent(new CustomEvent('vision:layout'));
  });
})();
