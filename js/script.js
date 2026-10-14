/* ============================================================
   ROXUDEV — Aesthetic Studio
   File: js/script.js
   ============================================================ */
'use strict';

(function () {
  /* ============================================================
     KONFIGURASI
     ============================================================ */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LOADER_DURATION = prefersReducedMotion ? 0 : 3700; // ms
  const LOADER_FADE     = prefersReducedMotion ? 0 : 900;  // ms

  const loader = document.getElementById('loader');

  /* ============================================================
     LOADER
     ============================================================ */
  function finishLoading() {
    if (!loader || !loader.isConnected) return;

    loader.classList.add('hide');
    document.body.classList.remove('loading');

    try { initReveal(); } catch (err) { console.error(err); }

    window.setTimeout(() => loader.remove(), LOADER_FADE);
  }

  window.setTimeout(finishLoading, LOADER_DURATION);

  /* ============================================================
     TEMA GELAP / TERANG
     ============================================================ */
  const root        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('roxu-theme', next); } catch (e) { /* noop */ }
    });
  }

  /* ============================================================
     HAMBURGER MENU
     ============================================================ */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function setMenuState(open) {
    if (!mobileMenu || !hamburger) return;

    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function toggleMenu(force) {
    const open = typeof force === 'boolean'
      ? force
      : !mobileMenu.classList.contains('open');
    setMenuState(open);
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => toggleMenu());

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMenu(false);
      }
    });

    /* Debounce resize agar tidak spam */
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth > 760 && mobileMenu.classList.contains('open')) {
          toggleMenu(false);
        }
      }, 150);
    }, { passive: true });
  }

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    /* Fallback: jika IntersectionObserver tidak didukung */
    if (typeof IntersectionObserver !== 'function') {
      revealEls.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = (i * 0.06) + 's';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ============================================================
     3D TILT UNTUK IMAGE CARD
     ============================================================ */
  const imageCard = document.querySelector('.image-card');

  if (imageCard && !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const wrapper = imageCard.closest('.image-card-wrapper');

    if (wrapper) {
      let rafId = null;
      let targetRX = 0;
      let targetRY = 0;

      const applyTilt = () => {
        rafId = null;
        imageCard.style.transform =
          `rotateX(${targetRX}deg) rotateY(${targetRY}deg) scale(1.02)`;
      };

      wrapper.addEventListener('mousemove', (e) => {
        const rect    = wrapper.getBoundingClientRect();
        const centerX = rect.width  / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        targetRX = ((y - centerY) / centerY) * -10;
        targetRY = ((x - centerX) / centerX) *  10;

        if (rafId === null) {
          rafId = window.requestAnimationFrame(applyTilt);
        }
      }, { passive: true });

      wrapper.addEventListener('mouseleave', () => {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        imageCard.style.transform = 'rotateX(0) rotateY(0) scale(1)';
      });
    }
  }
})();
