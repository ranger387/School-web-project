const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

(() => {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();

(() => {
  const root = document.documentElement;
  const btn = $('#themeToggle');
  if (!btn) return;

  const saved = localStorage.getItem('theme') || 'auto';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = localStorage.getItem('theme') || 'auto';
    const next =
      current === 'auto' ? 'dark' :
      current === 'dark' ? 'light' :
      'auto';
    applyTheme(next);
  });

  function applyTheme(mode) {
    root.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    btn.textContent =
      mode === 'dark' ? '🌙 Dark' :
      mode === 'light' ? '☀️ Light' :
      '🌓 Auto';
    btn.setAttribute('aria-label', `Theme: ${mode}`);
  }
})();

(() => {
  const wrap = $('.slideshow');
  if (!wrap) return;

  const slides = $$('.slide', wrap);
  const prev = $('.slide-nav.prev', wrap);
  const next = $('.slide-nav.next', wrap);
  const dotsWrap = $('.dots', wrap);
  if (!slides.length || !dotsWrap) return;

  let i = slides.findIndex(s => s.classList.contains('is-active'));
  if (i < 0) i = 0;

  slides.forEach((_, idx) => {
    const d = document.createElement('span');
    d.className = 'dot' + (idx === i ? ' is-active' : '');
    d.addEventListener('click', () => go(idx, true));
    dotsWrap.appendChild(d);
  });

  const dots = $$('.dot', wrap);

  prev?.addEventListener('click', () => go(i - 1, true));
  next?.addEventListener('click', () => go(i + 1, true));

  let timer;
  const START_MS = 4500;

  function start() {
    stop();
    timer = setInterval(() => go(i + 1), START_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
  }

  function go(n, user = false) {
    slides[i].classList.remove('is-active');
    dots[i].classList.remove('is-active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    dots[i].classList.add('is-active');
    if (user) start();
  }

  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', start);
  wrap.setAttribute('tabindex', '0');
  wrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(i - 1, true);
    if (e.key === 'ArrowRight') go(i + 1, true);
  });

  start();
})();

(() => {
  const gallery = $('.gallery');
  const modal = $('#modal');
  if (!gallery || !modal) return;

  const imgEl = $('.modal-img', modal);
  const capEl = $('.modal-cap', modal);
  const descEl = $('.modal-desc', modal);
  const btnClose = $('.modal-close', modal);
  const btnPrev = $('.modal-nav.prev', modal);
  const btnNext = $('.modal-nav.next', modal);

  const cards = $$('.card', gallery);
  if (!cards.length) return;

  let idx = 0;
  let lastFocus = null;

  cards.forEach((card, i) => {
    card.addEventListener('click', () => openModal(i));
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(i);
      }
    });
  });

  function openModal(i0) {
    idx = i0;
    lastFocus = document.activeElement;
    updateContent();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    btnClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    imgEl.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function go(n) {
    idx = (n + cards.length) % cards.length;
    updateContent();
  }

  function prev() {
    go(idx - 1);
  }

  function next() {
    go(idx + 1);
  }

  function updateContent() {
    const card = cards[idx];
    const img = $('img', card);
    const cap = $('figcaption', card);

    const titleText = cap?.textContent || img?.getAttribute('alt') || '';
    const descText = img?.getAttribute('data-desc') || '';

    imgEl.src = img?.getAttribute('src') || '';
    imgEl.alt = img?.getAttribute('alt') || '';
    capEl.textContent = titleText;
    descEl.textContent = descText;
  }

  btnClose?.addEventListener('click', closeModal);
  btnPrev?.addEventListener('click', prev);
  btnNext?.addEventListener('click', next);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', e => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();
