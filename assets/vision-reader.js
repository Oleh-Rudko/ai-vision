/* Progressive reading controls; original guide nodes are kept intact and in order. */
(function () {
  'use strict';
  const root = document.documentElement;
  const language = (root.lang || 'uk').split('-')[0];
  const locales = {
    uk: {
      highlight: 'Виділити деталі запиту', copy: 'Скопіювати запит', copied: 'Скопійовано',
      copiedAnnouncement: 'Запит скопійовано', copyFailed: 'Не вдалося скопіювати',
      copyFailedRetry: 'Не вдалося скопіювати. Спробувати ще раз', copyFailedAnnouncement: 'Не вдалося скопіювати запит',
      systemLabel: 'Складові системи роботи', systemNames: ['Контекст', 'Цілі', 'План', 'Налаштування', 'Інструкції', 'Агенти'],
      examplesLabel: 'Навчальні приклади', tabs: ['Мета', 'Обмеження', 'Напрямок', 'Усі приклади'],
      phrases: [
        ['з машиною', '100 метрів', 'хочу її помити'],
        ['в Україні', 'до 50 000 грн', 'документами, великими таблицями, багатьма вкладками браузера та відеодзвінками', 'вага до 1,5 кг', 'Ігри та монтаж відео не потрібні', 'спочатку запитай'],
        ['ще не визначився з напрямком', 'Працюю у продажах', 'дві години на день', 'за шість місяців', 'Спочатку постав мені запитання', 'практичну задачу для кожного']
      ],
      tripLabel: 'Спосіб дістатися автомийки', walk: 'Пішки', drive: 'Автомобілем',
      walkResult: 'Людина дійшла до автомийки, але автомобіль залишився на початку шляху.',
      driveResult: 'Автомобіль доставлено на автомийку.', distance: '100 м', origin: 'Автомобіль', destination: 'Автомийка'
    },
    en: {
      highlight: 'Highlight request details', copy: 'Copy prompt', copied: 'Copied',
      copiedAnnouncement: 'Prompt copied', copyFailed: 'Could not copy',
      copyFailedRetry: 'Could not copy. Try again', copyFailedAnnouncement: 'Could not copy prompt',
      systemLabel: 'Parts of the working system', systemNames: ['Context', 'Goals', 'Plan', 'Settings', 'Instructions', 'Agents'],
      examplesLabel: 'Learning examples', tabs: ['Goal', 'Constraints', 'Direction', 'All examples'],
      phrases: [
        ['My car and I', '100 meters', 'I want to wash it'],
        ['in Ukraine', 'up to UAH 50,000', 'documents, large spreadsheets, many browser tabs, and video calls', 'weight of no more than 1.5 kg', 'I do not need gaming or video editing', 'ask first'],
        ['have not chosen a field yet', 'I work in sales', 'two hours a day', 'in six months', 'First, ask', 'a small practical task for each']
      ],
      tripLabel: 'Way to reach the car wash', walk: 'Walk', drive: 'Drive',
      walkResult: 'The person reached the car wash, but the car stayed at the starting point.',
      driveResult: 'The car was delivered to the car wash.', distance: '100 m', origin: 'Car', destination: 'Car wash'
    },
    ru: {
      highlight: 'Выделить детали запроса', copy: 'Скопировать запрос', copied: 'Скопировано',
      copiedAnnouncement: 'Запрос скопирован', copyFailed: 'Не удалось скопировать',
      copyFailedRetry: 'Не удалось скопировать. Попробовать ещё раз', copyFailedAnnouncement: 'Не удалось скопировать запрос',
      systemLabel: 'Составляющие системы работы', systemNames: ['Контекст', 'Цели', 'План', 'Настройки', 'Инструкции', 'Агенты'],
      examplesLabel: 'Учебные примеры', tabs: ['Цель', 'Ограничения', 'Направление', 'Все примеры'],
      phrases: [
        ['с машиной', '100 метрах', 'хочу её помыть'],
        ['в Украине', 'до 50 000 грн', 'документами, большими таблицами, множеством вкладок браузера и видеозвонками', 'вес до 1,5 кг', 'Игры и монтаж видео не нужны', 'сначала спроси'],
        ['ещё не определился с направлением', 'Работаю в продажах', 'два часа в день', 'за шесть месяцев', 'Сначала задай мне вопросы', 'практическую задачу для каждого']
      ],
      tripLabel: 'Способ добраться до автомойки', walk: 'Пешком', drive: 'На машине',
      walkResult: 'Человек дошёл до автомойки, но автомобиль остался в начале пути.',
      driveResult: 'Автомобиль доставлен на автомойку.', distance: '100 м', origin: 'Автомобиль', destination: 'Автомойка'
    }
  };
  const locale = locales[language] || locales.en;
  const icons = {
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/>',
    highlighter: '<path d="m9 11-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
    car: '<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8M7 14h.01M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2M19 18v2"/>',
    footprints: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0ZM20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0ZM16 17h4M4 13h4"/>',
    rows: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18"/>',
    context: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h6"/>',
    goal: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    plan: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    instructions: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    agents: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-4h14v4M12 12V8"/>'
  };
  function icon(name) {
    // Lucide icons, covered by the license included in the HTML.
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + icons[name] + '</svg>';
  }
  function ui(element) { element.dataset.interface = ''; return element; }
  const announcement = ui(document.createElement('div'));
  announcement.className = 'reader-announcement';
  announcement.setAttribute('role', 'status');
  document.body.appendChild(announcement);
  function button(label, name) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'icon-button';
    element.setAttribute('aria-label', label);
    element.title = label;
    element.innerHTML = icon(name);
    return element;
  }
  function notifyLayout() { window.dispatchEvent(new Event('vision:layout')); }
  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(text); return; } catch (error) { /* Use the local-file fallback below. */ }
    }
    const active = document.activeElement;
    const selection = window.getSelection();
    const ranges = [];
    for (let i = 0; i < selection.rangeCount; i++) ranges.push(selection.getRangeAt(i).cloneRange());
    const buffer = document.createElement('textarea');
    buffer.value = text;
    buffer.readOnly = true;
    buffer.setAttribute('aria-hidden', 'true');
    buffer.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(buffer);
    let copied = false;
    try { buffer.select(); copied = document.execCommand('copy'); }
    finally {
      buffer.remove();
      selection.removeAllRanges();
      ranges.forEach(function (range) { selection.addRange(range); });
      if (active && active.isConnected) active.focus({ preventScroll: true });
    }
    if (!copied) throw new Error('Clipboard unavailable');
  }
  function promptControls(host, source, allowCopy = true) {
    const text = source.textContent.trim();
    const controls = ui(document.createElement('span'));
    controls.className = 'prompt-actions';
    if (source.querySelector('mark')) {
      const details = button(locale.highlight, 'highlighter');
      details.setAttribute('aria-pressed', 'true');
      details.addEventListener('click', function () {
        const plain = host.classList.toggle('plain-prompt');
        details.setAttribute('aria-pressed', String(!plain));
      });
      controls.appendChild(details);
    }
    if (!allowCopy) {
      if (controls.childElementCount) host.appendChild(controls);
      return;
    }
    const copy = button(locale.copy, 'copy');
    let feedbackTimer = 0;
    copy.addEventListener('click', async function () {
      if (copy.getAttribute('aria-busy') === 'true') return;
      copy.setAttribute('aria-busy', 'true');
      announcement.textContent = '';
      clearTimeout(feedbackTimer);
      copy.innerHTML = icon('copy');
      delete copy.dataset.feedback;
      try {
        await copyText(text);
        copy.innerHTML = icon('check');
        copy.dataset.feedback = locale.copied;
        copy.setAttribute('aria-label', locale.copied);
        announcement.textContent = locale.copiedAnnouncement;
      } catch (error) {
        copy.innerHTML = icon('copy');
        copy.dataset.feedback = locale.copyFailed;
        copy.setAttribute('aria-label', locale.copyFailedRetry);
        announcement.textContent = locale.copyFailedAnnouncement;
      } finally {
        copy.removeAttribute('aria-busy');
        feedbackTimer = setTimeout(function () {
          copy.innerHTML = icon('copy');
          delete copy.dataset.feedback;
          copy.setAttribute('aria-label', locale.copy);
        }, 2200);
      }
    });
    controls.appendChild(copy);
    host.appendChild(controls);
  }
  function markPhrases(element, phrases) {
    const text = element.textContent;
    const ranges = phrases.map(function (phrase) { return { start: text.indexOf(phrase), end: text.indexOf(phrase) + phrase.length }; })
      .filter(function (range) { return range.start >= 0; }).sort(function (a, b) { return a.start - b.start; });
    const fragment = document.createDocumentFragment();
    let offset = 0;
    ranges.forEach(function (range) {
      if (range.start < offset) return;
      fragment.appendChild(document.createTextNode(text.slice(offset, range.start)));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(range.start, range.end);
      fragment.appendChild(mark);
      offset = range.end;
    });
    fragment.appendChild(document.createTextNode(text.slice(offset)));
    element.replaceChildren(fragment);
  }
  document.querySelectorAll('.prompt-item').forEach(function (item) { promptControls(item, item.querySelector('blockquote'), false); });
  document.querySelectorAll('#s7 .xlist li').forEach(function (item) { promptControls(item, item); });

  const system = document.getElementById('s6');
  const systemParts = Array.from(system.querySelectorAll('.subhead')).slice(0, 6);
  const route = ui(document.createElement('nav'));
  route.className = 'system-route';
  route.setAttribute('aria-label', locale.systemLabel);
  const systemNames = locale.systemNames;
  const systemIcons = ['context', 'goal', 'plan', 'settings', 'instructions', 'agents'];
  const routeLinks = systemParts.map(function (part, i) {
    part.id = 'system-' + (i + 1);
    const heading = part.querySelector('h3');
    const text = heading.textContent;
    const colon = text.indexOf(':');
    if (colon >= 0) {
      const title = document.createElement('span');
      title.className = 'system-title';
      title.textContent = text.slice(0, colon + 1);
      const description = document.createElement('span');
      description.className = 'system-description';
      description.textContent = text.slice(colon + 1);
      heading.replaceChildren(title, description);
    }
    const link = document.createElement('a');
    link.href = '#' + part.id;
    link.innerHTML = icon(systemIcons[i]);
    const label = document.createElement('span');
    label.textContent = systemNames[i];
    link.appendChild(label);
    route.appendChild(link);
    return link;
  });
  system.insertBefore(route, systemParts[0]);

  const examples = document.getElementById('s8');
  const cases = Array.from(examples.querySelectorAll('.subhead'));
  const caseNav = ui(document.createElement('div'));
  caseNav.className = 'case-nav';
  caseNav.setAttribute('role', 'tablist');
  caseNav.setAttribute('aria-label', locale.examplesLabel);
  const panel = document.createElement('div');
  panel.id = 'example-views';
  panel.className = 'case-panel';
  panel.setAttribute('role', 'tabpanel');
  panel.tabIndex = 0;
  const tabNames = locale.tabs;
  const tabs = tabNames.map(function (name, i) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = 'example-tab-' + i;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    if (i === 3) { tab.innerHTML = icon('rows'); tab.setAttribute('aria-label', name); tab.title = name; }
    else {
      const number = document.createElement('span');
      number.textContent = '0' + (i + 1);
      const label = document.createElement('span');
      label.textContent = name;
      tab.append(number, label);
    }
    tab.addEventListener('click', function () { selectCase(i); });
    tab.addEventListener('keydown', function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectCase(next);
      tabs[next].focus({ preventScroll: true });
    });
    caseNav.appendChild(tab);
    return tab;
  });
  function selectCase(index) {
    tabs.forEach(function (tab, i) { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    cases.forEach(function (item, i) { item.hidden = index !== 3 && index !== i; });
    panel.setAttribute('aria-labelledby', tabs[index].id);
    notifyLayout();
  }
  examples.insertBefore(caseNav, cases[0]);
  examples.insertBefore(panel, cases[0]);
  const phrases = locale.phrases;
  cases.forEach(function (item, i) {
    item.classList.add('case-study');
    item.id = 'case-' + (i + 1);
    item.querySelector('h3').id = item.id + '-title';
    item.setAttribute('role', 'region');
    item.setAttribute('aria-labelledby', item.id + '-title');
    const queries = Array.from(item.querySelectorAll('p')).filter(function (p) {
      const text = p.textContent.trim();
      return text.startsWith('«') || text.startsWith('"') || text.startsWith('“');
    });
    queries.forEach(function (query, j) {
      query.classList.add('case-query');
      if (j > 0) query.classList.add('refined');
      if (j > 0 || i === 0) markPhrases(query, phrases[i]);
      promptControls(query, query);
    });
    panel.appendChild(item);
  });
  selectCase(3);

  // This illustrates the existing car-wash example, without generating an AI answer.
  const trip = ui(document.createElement('div'));
  trip.className = 'context-trip';
  trip.dataset.mode = 'walk';
  const modes = document.createElement('div');
  modes.className = 'trip-modes';
  modes.setAttribute('role', 'group');
  modes.setAttribute('aria-label', locale.tripLabel);
  const tripModes = [['walk', locale.walk, 'footprints'], ['drive', locale.drive, 'car']];
  const tripButtons = tripModes.map(function ([mode, label, symbol]) {
    const control = button(label, symbol);
    const name = document.createElement('span');
    name.textContent = label;
    control.appendChild(name);
    control.setAttribute('aria-pressed', String(mode === 'walk'));
    control.addEventListener('click', function () {
      trip.dataset.mode = mode;
      tripButtons.forEach(function (item, i) { item.setAttribute('aria-pressed', String(tripModes[i][0] === mode)); });
      diagram.setAttribute('aria-label', mode === 'walk' ? locale.walkResult : locale.driveResult);
    });
    modes.appendChild(control);
    return control;
  });
  const diagram = document.createElement('div');
  diagram.className = 'trip-diagram';
  diagram.setAttribute('role', 'img');
  diagram.setAttribute('aria-label', locale.walkResult);
  const visual = document.createElement('div');
  visual.className = 'trip-visual';
  visual.setAttribute('aria-hidden', 'true');
  visual.innerHTML = '<span class="trip-distance">' + locale.distance + '</span><span class="trip-road"></span><span class="trip-car">' + icon('car') + '</span><span class="trip-walker">' + icon('footprints') + '</span><span class="trip-wash"></span><span class="trip-origin">' + locale.origin + '</span><span class="trip-destination">' + locale.destination + '</span>';
  diagram.appendChild(visual);
  trip.append(modes, diagram);
  const firstQuery = cases[0].querySelector('.case-query');
  firstQuery.after(trip);

  // New fragment links retain native URL/history behavior and move keyboard focus.
  route.addEventListener('click', function (event) {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  });
  function revealHashCase() {
    const target = document.getElementById(location.hash.slice(1));
    const study = target && target.closest('.case-study');
    if (study) {
      if (study.hidden) selectCase(cases.indexOf(study));
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', revealHashCase);
  let scheduled = false;
  function updateSystem() {
    scheduled = false;
    let current = -1;
    systemParts.forEach(function (part, i) { if (part.getBoundingClientRect().top <= 160) current = i; });
    if (system.getBoundingClientRect().bottom < 0) current = -1;
    routeLinks.forEach(function (link, i) {
      if (i === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleSystem() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateSystem); } }
  window.addEventListener('scroll', scheduleSystem, { passive: true });
  window.addEventListener('resize', scheduleSystem);
  root.classList.add('editorial-ready');
  document.fonts.ready.then(function () { notifyLayout(); scheduleSystem(); revealHashCase(); });
  notifyLayout();
})();
