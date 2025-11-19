// ========== Helpers ==========
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ========== Footer year ==========
(() => {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();

// ========== Theme toggle (auto → dark → light) ==========
(() => {
  const root = document.documentElement;
  const btn = $('#themeToggle');
  if (!btn) return;

  const saved = localStorage.getItem('theme') || 'auto';
  apply(saved);

  btn.addEventListener('click', () => {
    const current = localStorage.getItem('theme') || 'auto';
    const next = current === 'auto' ? 'dark' : current === 'dark' ? 'light' : 'auto';
    apply(next);
  });

  function apply(mode) {
    // html[data-theme="auto"|"dark"|"light"]; CSS handles auto via prefers-color-scheme
    root.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    btn.textContent =
      mode === 'dark' ? '🌙 Dark' :
      mode === 'light' ? '☀️ Light' : '🌓 Auto';
    btn.setAttribute('aria-label', `Theme: ${mode}`);
  }
})();

// ========== Slideshow (auto-advance, hover pause, dots, prev/next) ==========
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

  // create dots
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

  function start() { stop(); timer = setInterval(() => go(i + 1), START_MS); }
  function stop() { if (timer) clearInterval(timer); }

  function go(n, user = false) {
    slides[i].classList.remove('is-active');
    dots[i].classList.remove('is-active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    dots[i].classList.add('is-active');
    if (user) { start(); }
  }

  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', start);
  start();

  // Keyboard support when slideshow is focused
  wrap.setAttribute('tabindex', '0');
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(i - 1, true);
    if (e.key === 'ArrowRight') go(i + 1, true);
  });
})();

// ========== Gallery modal viewer (click card to open, arrows/ESC, prev/next) ==========
(() => {
  const gallery = $('.gallery');
  const modal = $('#modal');
  if (!gallery || !modal) return;

  const imgEl = $('.modal-img', modal);
  const capEl = $('.modal-cap', modal);
  const btnClose = $('.modal-close', modal);
  const btnPrev = $('.modal-nav.prev', modal);
  const btnNext = $('.modal-nav.next', modal);

  const cards = $$('.card', gallery);
  if (!cards.length) return;

  let idx = 0;
  let lastFocus = null;

  cards.forEach((card, i) => {
    card.addEventListener('click', () => open(i));
    // Make cards reachable by keyboard
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  function open(i0) {
    idx = i0;
    lastFocus = document.activeElement;
    updateContent();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    btnClose.focus();
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function close() {
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

  function prev() { go(idx - 1); }
  function next() { go(idx + 1); }

  function updateContent() {
    const card = cards[idx];
    const img = $('img', card);
    const cap = $('figcaption', card);
    imgEl.src = img?.getAttribute('src') || '';
    imgEl.alt = img?.getAttribute('alt') || '';
    capEl.textContent = cap?.textContent || '';
  }

  // Buttons
  btnClose?.addEventListener('click', close);
  btnPrev?.addEventListener('click', prev);
  btnNext?.addEventListener('click', next);

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();

// ========== Optional: Lazy helper (placeholder for future data-src swaps) ==========
(() => {
  if (!('IntersectionObserver' in window)) return;
  // If you later switch to <img loading="lazy" data-src="...">, you can
  // move URLs from data-src to src here when visible.
  // Keeping this scaffold for you if needed; currently not used.
})();
