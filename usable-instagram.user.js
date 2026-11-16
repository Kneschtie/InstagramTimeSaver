// ==UserScript==
// @name         Usable Instagram
// @namespace    usable-instagram
// @version      1.2
// @description  Blendet Reels, Entdecken und Vorschläge aus. Startseite zeigt nur Accounts, denen du folgst. Reels aus DMs funktionieren weiter.
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const SAFE_HOME = '/?variant=following';

  // 1) Gesperrte Seiten umleiten
  function checkUrl() {
    const p = location.pathname;
    const q = location.search;

    // Startseite -> nur "Folge ich" (chronologisch, keine Vorschläge)
    if (p === '/' && !q.includes('variant=following')) {
      location.replace(SAFE_HOME);
      return;
    }
    // Reels-Feed (/reels/...) und Entdecken (/explore/...) sperren.
    // Einzelne Reels (/reel/CODE/), z. B. aus DMs, bleiben erlaubt.
    if (p.startsWith('/reels') || p.startsWith('/explore')) {
      location.replace(SAFE_HOME);
    }
  }

  checkUrl();

  // 4) Auf einzelnen Reels: Scrollen/Wischen zum nächsten Reel verhindern
  const isReel = () => /^\/reels?\/[^/]+/.test(location.pathname) || location.pathname.startsWith('/reel/');
  let firstReel = null; // das Reel, das du bewusst geöffnet hast

  function reelGuard() {
    const p = location.pathname;
    if (p.startsWith('/reel/')) {
      const code = p.split('/')[2];
      if (!firstReel) firstReel = code;
      // Instagram hat zum nächsten Reel gewechselt -> zurück
      else if (code !== firstReel) history.back();
    } else {
      firstReel = null;
    }
    document.documentElement.classList.toggle('ig-no-scroll', p.startsWith('/reel/'));
  }

  // Reel-Ansicht erkennen: per URL ODER an einem geöffneten Overlay/Viewer mit Video
  // (aus DMs öffnet Instagram Reels oft als Overlay, ohne dass sich die URL ändert)
  function reelViewerOpen() {
    if (isReel()) return true;
    for (const d of document.querySelectorAll('[role="dialog"], [aria-modal="true"]')) {
      if (d.querySelector('video')) return true;
    }
    return false;
  }

  // Instagram scrollt Reels in einem eigenen Container mit "scroll-snap" –
  // nicht im Fenster. Deshalb jeden Scroll-Container mit Video einfrieren.
  function isReelScroller(el) {
    if (!el || el === document || el === document.documentElement || el === document.body) return reelViewerOpen();
    if (!el.querySelector || !el.querySelector('video')) return false;
    const snap = getComputedStyle(el).scrollSnapType;
    return reelViewerOpen() || (snap && snap !== 'none');
  }

  const frozen = new WeakMap();
  document.addEventListener('scroll', e => {
    const el = e.target === document ? document.scrollingElement : e.target;
    if (!isReelScroller(e.target === document ? document : el)) return;
    if (!frozen.has(el)) frozen.set(el, el.scrollTop);
    const top = frozen.get(el);
    if (el.scrollTop !== top) el.scrollTop = top;
  }, { capture: true, passive: true });

  function lockContainers() {
    // Alle Snap-Scroller mit Video sperren (das ist der Reel-Wischer)
    document.querySelectorAll('div, main, section').forEach(el => {
      if (el.dataset.igLocked) return;
      if (el.scrollHeight <= el.clientHeight + 5) return;
      const cs = getComputedStyle(el);
      if (!/(auto|scroll)/.test(cs.overflowY)) return;
      if (!isReelScroller(el)) return;
      el.dataset.igLocked = '1';
      el.style.setProperty('overflow', 'hidden', 'important');
      el.style.setProperty('touch-action', 'manipulation', 'important');
      el.style.setProperty('overscroll-behavior', 'none', 'important');
    });
  }

  const block = e => {
    if (!reelViewerOpen() && !(e.target.closest && e.target.closest('[data-ig-locked]'))) return;
    e.preventDefault();
    e.stopPropagation();
  };
  for (const ev of ['wheel', 'touchmove']) {
    window.addEventListener(ev, block, { passive: false, capture: true });
    document.addEventListener(ev, block, { passive: false, capture: true });
  }
  window.addEventListener('keydown', e => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'End', 'Home', 'j', 'k'].includes(e.key)) block(e);
  }, { capture: true });

  // Instagram ist eine Single-Page-App -> URL-Wechsel abfangen
  for (const fn of ['pushState', 'replaceState']) {
    const orig = history[fn];
    history[fn] = function () {
      const r = orig.apply(this, arguments);
      setTimeout(() => { checkUrl(); reelGuard(); }, 0);
      return r;
    };
  }
  window.addEventListener('popstate', () => { checkUrl(); reelGuard(); });
  reelGuard();

  // 2) Navigation zu Reels/Entdecken ausblenden
  const css = `
    a[href="/reels/"], a[href^="/reels/"],
    a[href="/explore/"], a[href^="/explore/"],
    a[href="/"]:not([href*="variant"]) svg[aria-label*="Reels"],
    svg[aria-label="Reels"], svg[aria-label="Entdecken"], svg[aria-label="Explore"]
    { display: none !important; }
    html.ig-no-scroll, html.ig-no-scroll body {
      overflow: hidden !important; overscroll-behavior: none !important; touch-action: manipulation !important;
    }
  `;
  function addCss() {
    if (document.getElementById('ig-minimal-css')) return;
    const s = document.createElement('style');
    s.id = 'ig-minimal-css';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }
  addCss();

  // 3) Icons ohne eigenes Link-Ziel + "Vorgeschlagen"-Blöcke entfernen
  const SUGGEST = /^(Vorgeschlagen|Vorschläge für dich|Suggested for you|Suggested posts|Vorgeschlagene Beiträge|Mehr Beiträge|More posts)/i;

  function clean() {
    addCss();
    lockContainers();
    document.documentElement.classList.toggle('ig-no-scroll', reelViewerOpen());

    // Navigations-Icons, deren Link wir nicht per CSS erwischen
    document.querySelectorAll('svg[aria-label="Reels"], svg[aria-label="Entdecken"], svg[aria-label="Explore"]').forEach(svg => {
      const link = svg.closest('a, [role="link"], [role="button"]');
      if (link) link.style.display = 'none';
    });

    // Vorschlags-Bereiche im Feed
    document.querySelectorAll('span, h2, h3, div[role="heading"]').forEach(el => {
      if (el.children.length === 0 && SUGGEST.test(el.textContent.trim())) {
        const box = el.closest('article') || el.closest('section') || el.parentElement?.parentElement?.parentElement;
        if (box && !box.closest('[role="dialog"]') && !location.pathname.startsWith('/direct')) {
          box.style.display = 'none';
        }
      }
    });
  }

  const start = () => {
    clean();
    let pending = false;
    new MutationObserver(() => {
      if (pending) return;
      pending = true;
      setTimeout(() => { pending = false; clean(); }, 150);
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
