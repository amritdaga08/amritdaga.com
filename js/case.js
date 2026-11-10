(function () {
  var theme = document.getElementById('theme');
  if (theme) {
  var root = document.documentElement;
  var darkMq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var tLight = theme.querySelector('.t-light'), tDark = theme.querySelector('.t-dark');
  function isDark() { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : !!(darkMq && darkMq.matches); }
  function syncTheme() {
    var d = isDark();
    theme.setAttribute('data-mode', d ? 'dark' : 'light');
    tLight.setAttribute('aria-checked', d ? 'false' : 'true');
    tDark.setAttribute('aria-checked', d ? 'true' : 'false');
  }
  function setTheme(mode, btn) {
    if ((mode === 'dark') === isDark()) return;
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('ad-theme', mode); } catch (e) {}
    theme.classList.add('moving');
    btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
    setTimeout(function () { theme.classList.remove('moving'); btn.classList.remove('pop'); }, 750);
    syncTheme();
  }
  syncTheme();
  if (darkMq && darkMq.addEventListener) darkMq.addEventListener('change', syncTheme);
  tLight.addEventListener('click', function () { setTheme('light', tLight); });
  tDark.addEventListener('click', function () { setTheme('dark', tDark); });
  theme.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setTheme('light', tLight); tLight.focus(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setTheme('dark', tDark); tDark.focus(); }
  });
  }

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vids = document.querySelectorAll('video[data-auto]');
  if (!still && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.45 });
    Array.prototype.forEach.call(vids, function (v) { io.observe(v); });
  }
})();

/* tap to magnify */
(function () {
  var groups = document.querySelectorAll('.screens'); if (!groups.length) return;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var I = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var lb = document.createElement('div');
  lb.className = 'lightbox'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Enlarged screen');
  lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>'
    + '<button class="lb-btn lb-close" type="button" aria-label="Close">' + I('<path d="M6 6l12 12M18 6L6 18"/>') + '</button>'
    + '<button class="lb-btn lb-prev" type="button" aria-label="Previous screen">' + I('<path d="M15 6l-6 6 6 6"/>') + '</button>'
    + '<button class="lb-btn lb-next" type="button" aria-label="Next screen">' + I('<path d="M9 6l6 6-6 6"/>') + '</button>';
  document.body.appendChild(lb);
  var img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), list = [], idx = 0, last = null;
  function show(i, from) {
    idx = (i + list.length) % list.length;
    var src = list[idx].querySelector('img');
    img.src = src.currentSrc || src.src; img.alt = src.alt; cap.textContent = src.alt;
    if (still || !img.animate) return;
    if (from) {
      var a = from.getBoundingClientRect(); var b = img.getBoundingClientRect();
      if (b.width) img.animate([{ transform: 'translate(' + (a.left + a.width / 2 - b.left - b.width / 2) + 'px,' + (a.top + a.height / 2 - b.top - b.height / 2) + 'px) scale(' + (a.width / b.width) + ')' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    } else img.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  }
  function open(btn) {
    list = Array.prototype.slice.call(btn.closest('.screens').querySelectorAll('.zoom'));
    last = btn; lb.hidden = false; document.documentElement.style.overflow = 'hidden';
    var i = list.indexOf(btn); var src = btn.querySelector('img'); img.src = src.currentSrc || src.src;
    requestAnimationFrame(function () { show(i, btn); });
    lb.querySelector('.lb-close').focus();
  }
  function close() { lb.hidden = true; document.documentElement.style.overflow = ''; if (last) last.focus(); }
  document.addEventListener('click', function (e) { var b = e.target.closest('.zoom'); if (b) open(b); });
  lb.addEventListener('click', function (e) {
    if (e.target.closest('.lb-prev')) return show(idx - 1);
    if (e.target.closest('.lb-next')) return show(idx + 1);
    if (e.target.closest('.lb-close') || !e.target.closest('figure')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'Tab') { var f = lb.querySelectorAll('button'); if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); sx = null; }, { passive: true });
})();


/* watch prototype overlay (larger screens) */
(function () {
  var btns = document.querySelectorAll('[data-watch]'); if (!btns.length) return;
  var ov = document.createElement('div'); ov.className = 'watch-ov'; ov.hidden = true;
  ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Trim Workout prototype');
  ov.innerHTML = '<iframe title="Interactive Apple Watch prototype of Trim Workout"></iframe><button class="lb-btn lb-close" type="button" aria-label="Close prototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  document.body.appendChild(ov);
  var fr = ov.querySelector('iframe'), cl = ov.querySelector('.lb-close'), last = null;
  function open(b) { last = b; fr.src = b.getAttribute('data-watch'); ov.hidden = false; ov.classList.add('in'); document.documentElement.style.overflow = 'hidden'; cl.focus(); }
  function close() { ov.hidden = true; ov.classList.remove('in'); fr.src = 'about:blank'; document.documentElement.style.overflow = ''; if (last) last.focus(); }
  Array.prototype.forEach.call(btns, function (b) { b.addEventListener('click', function () { open(b); }); });
  ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.lb-close')) close(); });
  document.addEventListener('keydown', function (e) { if (!ov.hidden && e.key === 'Escape') close(); if (!ov.hidden && e.key === 'Tab') { e.preventDefault(); (document.activeElement === cl ? fr : cl).focus(); } });
})();


/* story thread: same scroll-drawn line as the Journey */
(function () {
  var log = document.querySelector('.log'); if (!log) return;
  var items = Array.prototype.slice.call(log.querySelectorAll('.beat'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, ys = [];
  function measure() {
    var top = log.getBoundingClientRect().top;
    ys = items.map(function (li) { var d = li.querySelector('.when'), r = d.getBoundingClientRect(), cs = getComputedStyle(d, '::after'); return li.getBoundingClientRect().top - top + parseFloat(cs.top) + 5.5; });
    log.style.setProperty('--l-top', ys[0] + 'px'); log.style.setProperty('--l-h', (ys[ys.length - 1] - ys[0]) + 'px'); update();
  }
  function update() {
    var top = log.getBoundingClientRect().top, mark = window.innerHeight * 0.6 - top, span = ys[ys.length - 1] - ys[0];
    log.style.setProperty('--p', (reduce ? 1 : Math.max(0, Math.min(1, (mark - ys[0]) / (span || 1)))).toFixed(4));
    items.forEach(function (li, i) { var on = reduce || mark >= ys[i] - 1; if (on && !li.classList.contains('lit')) { li.classList.add('lit', 'popped'); } else if (!on) li.classList.remove('lit', 'popped'); });
  }
  var t = false; window.addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(function () { t = false; update(); }); } }, { passive: true });
  window.addEventListener('resize', measure); if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  Array.prototype.forEach.call(log.querySelectorAll('img'), function (im) { if (!im.complete) im.addEventListener('load', measure); });
  measure();
})();
