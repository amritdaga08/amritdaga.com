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

/* before / after compare */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('.ba'), function (ba) {
    var r = ba.querySelector('.ba-range'), touched = false;
    function set(v) { ba.style.setProperty('--pos', v + '%'); ba.style.setProperty('--pos-n', v / 100); }
    r.addEventListener('input', function () { touched = true; set(r.value); });
    set(r.value);
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || touched) return; io.disconnect();
      var t0 = performance.now(), path = [50, 18, 82, 50], seg = 700;
      (function step(now) {
        if (touched) return;
        var k = (now - t0) / seg, i = Math.floor(k);
        if (i >= path.length - 1) { set(50); r.value = 50; return; }
        var f = k - i, e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2, v = path[i] + (path[i + 1] - path[i]) * e;
        set(v.toFixed(1)); r.value = v; requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.6 });
    io.observe(ba);
  });
})();

/* video-synced step thread + time bars */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.vsteps'), function (ol) {
    var demo = ol.closest('.demo'), v = demo && demo.querySelector('video'); if (!v) return;
    var lis = Array.prototype.slice.call(ol.children), ts = lis.map(function (li) { return parseFloat(li.getAttribute('data-t')); });
    function sync() {
      var t = v.currentTime, i = 0; for (var k = 0; k < ts.length; k++) if (t >= ts[k]) i = k;
      lis.forEach(function (li, k) { li.classList.toggle('done', k < i); li.classList.toggle('now', k === i); });
      var seg = i < ts.length - 1 ? Math.min(1, (t - ts[i]) / (ts[i + 1] - ts[i])) : 0;
      ol.style.setProperty('--p', ((i + seg) / (ts.length - 1)).toFixed(3));
    }
    var raf = null; function loop() { sync(); raf = v.paused ? null : requestAnimationFrame(loop); }
    v.addEventListener('play', function () { if (!raf) loop(); });
    v.addEventListener('seeked', sync); v.addEventListener('timeupdate', sync);
    lis.forEach(function (li, k) { li.style.cursor = 'pointer'; li.addEventListener('click', function () { v.currentTime = ts[k] + 0.05; sync(); }); });
    sync();
  });
  var bars = document.querySelectorAll('.tbar'); if (!bars.length || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-bars');
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.6 });
  Array.prototype.forEach.call(bars, function (b) { io.observe(b); });
})();

/* Naturalé: line rotator demo */
(function () {
  var rot = document.getElementById('ds-rot'), rip = document.getElementById('ds-rip');
  if (!rot || !rip || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var P = [['design with', 'Figma'], ['scope with', 'Confluence'], ['document with', 'Notion'], ['code with', 'Visual Studio']], i = 0, line = rot.parentNode;
  setInterval(function () {
    if (document.hidden) return;
    i = (i + 1) % P.length; line.classList.remove('in'); line.classList.add('out');
    setTimeout(function () {
      rot.innerHTML = P[i][0] + ' <span class="tool">' + P[i][1] + '</span>';
      Array.prototype.forEach.call(rip.children, function (d, k) { d.classList.toggle('on', k === i); });
      line.classList.remove('out'); void line.offsetWidth; line.classList.add('in');
    }, 260);
  }, 2800);
})();

/* Naturalé: slider fill, tooltip on tap, tab bar */
(function () {
  var sl = document.getElementById('ds-sl'), o = document.getElementById('ds-sl-o');
  if (sl) { var f = function () { var p = (sl.value - sl.min) / (sl.max - sl.min) * 100; sl.style.setProperty('--v', p + '%'); if (o) o.textContent = (+sl.value).toFixed(1) + 's'; }; sl.addEventListener('input', f); f(); }
  Array.prototype.forEach.call(document.querySelectorAll('.tip-btn'), function (b) { b.addEventListener('click', function () { b.parentNode.classList.toggle('show'); }); b.addEventListener('blur', function () { b.parentNode.classList.remove('show'); }); });
  Array.prototype.forEach.call(document.querySelectorAll('.tabbar-demo'), function (bar) { bar.addEventListener('click', function (e) { var t = e.target.closest('button'); if (!t) return; Array.prototype.forEach.call(bar.children, function (x) { x.classList.toggle('on', x === t); x.setAttribute('aria-pressed', x === t); }); }); });
  Array.prototype.forEach.call(document.querySelectorAll('.pager'), function (pg) { var d = pg.querySelectorAll('.ripples i'), s = pg.querySelector('.pg span'), i = 1, n = 6; function r() { s.textContent = (i + 1) + ' of ' + n; Array.prototype.forEach.call(d, function (x, k) { x.classList.toggle('on', k === Math.min(3, Math.round(i * 3 / (n - 1)))); }); } var b = pg.querySelectorAll('.pg button'); b[0].addEventListener('click', function () { i = Math.max(0, i - 1); r(); }); b[1].addEventListener('click', function () { i = Math.min(n - 1, i + 1); r(); }); r(); });
  Array.prototype.forEach.call(document.querySelectorAll('a[href="#nav-demo"]'), function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
})();

/* Naturalé v3: scale tabs, theme switch demo, quick nav spy */
(function () {
  var seg = document.querySelector('.sc-seg');
  if (seg) {
    var drop = seg.querySelector('.drop'), tabs = seg.querySelectorAll('[role="tab"]'), tt;
    function place(b) { drop.classList.add('moving'); drop.style.left = b.offsetLeft + 'px'; drop.style.width = b.offsetWidth + 'px'; drop.style.opacity = '1'; clearTimeout(tt); tt = setTimeout(function () { drop.classList.remove('moving'); }, 450); }
    function sel(b, focus) { Array.prototype.forEach.call(tabs, function (t) { var on = t === b; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !on; }); place(b); if (focus) b.focus(); }
    Array.prototype.forEach.call(tabs, function (t, i) { t.addEventListener('click', function () { sel(t); }); t.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); sel(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true); } }); });
    var init = function () { place(seg.querySelector('[aria-selected="true"]')); }; init(); window.addEventListener('resize', init); if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  }
  var real = document.getElementById('theme');
  Array.prototype.forEach.call(document.querySelectorAll('.theme-demo'), function (d) {
    function sync() { var dark = real ? real.getAttribute('data-mode') === 'dark' : false; d.setAttribute('data-mode', dark ? 'dark' : 'light'); d.querySelector('.d-light').setAttribute('aria-checked', !dark); d.querySelector('.d-dark').setAttribute('aria-checked', dark); }
    d.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || !real) return; d.classList.add('moving'); setTimeout(function () { d.classList.remove('moving'); }, 600); (real.querySelector(b.classList.contains('d-dark') ? '.t-dark' : '.t-light')).click(); setTimeout(sync, 20); });
    if (real) new MutationObserver(sync).observe(real, { attributes: true }); sync();
  });
  var qn = document.querySelector('.qnav'); if (!qn) return;
  var links = qn.querySelectorAll('a'), targets = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); }), tick = false;
  function spy() { var y = innerHeight * .4, hit = -1; targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < y) hit = i; }); Array.prototype.forEach.call(links, function (a, i) { a.classList.toggle('on', i === hit); if (i === hit) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
  addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; spy(); }); }, { passive: true }); spy();
})();

/* Naturalé: restaurant-style section menu, progress demo */
(function () {
  var m = document.getElementById('dsmenu'); if (!m) return;
  var btn = m.querySelector('.dm-btn'), pop = m.querySelector('.dm-pop'), links = pop.querySelectorAll('a');
  var targets = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
  var first = document.querySelector('#roots'), endEl = document.querySelector('.next') || document.querySelector('footer');
  function open(v) { pop.hidden = !v; btn.setAttribute('aria-expanded', v); if (v) { var on = pop.querySelector('a.on') || links[0]; on.focus({ preventScroll: true }); } }
  btn.addEventListener('click', function () { open(pop.hidden); });
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  pop.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    e.preventDefault(); open(false);
    var t = document.querySelector(a.getAttribute('href')); if (!t) return;
    var y = t.getBoundingClientRect().top + scrollY - 90;
    if (calm) { scrollTo(0, y); return; }
    var from = scrollY, dist = y - from, dur = Math.round(Math.min(1400, Math.max(700, Math.abs(dist) * .35)));
    btn.style.setProperty('--jd', dur + 'ms'); btn.classList.remove('jumping', 'landed'); void btn.offsetWidth; btn.classList.add('jumping');
    var html = document.documentElement, prev = html.style.scrollBehavior; html.style.scrollBehavior = 'auto';
    var t0 = performance.now(), ease = function (k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
    (function step(t) { var k = Math.min(1, (t - t0) / dur); scrollTo(0, from + dist * ease(k));
      if (k < 1) { requestAnimationFrame(step); return; }
      html.style.scrollBehavior = prev; btn.classList.remove('jumping'); history.replaceState(null, '', a.getAttribute('href')); })(t0);
  });
  document.addEventListener('click', function (e) { if (!m.contains(e.target) && !pop.hidden) open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { open(false); btn.focus(); } });
  var tick = false;
  function upd() {
    var y = innerHeight * .35, hit = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < y) hit = i; });
    Array.prototype.forEach.call(links, function (a, i) { a.classList.toggle('on', i === hit); });
    var past = first && first.getBoundingClientRect().top < innerHeight * .8, done = endEl && endEl.getBoundingClientRect().top < innerHeight;
    m.classList.toggle('show', !!past && !done); if (!(past && !done) && !pop.hidden) open(false);
  }
  addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; upd(); }); }, { passive: true }); upd();
  var pg = document.getElementById('ds-pg'), n = document.getElementById('ds-pg-n');
  if (pg && 'IntersectionObserver' in window && !(matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    pg.style.transition = 'width 1.4s cubic-bezier(.2,.8,.2,1)'; pg.style.width = '0%'; n.textContent = '0%';
    new IntersectionObserver(function (es, o) { if (!es[0].isIntersecting) return; o.disconnect(); pg.style.width = '60%'; var t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 1400); n.textContent = Math.round(60 * (1 - Math.pow(1 - k, 3))) + '%'; if (k < 1) requestAnimationFrame(f); })(t0); }).observe(pg);
  }
})();

/* Naturalé: journey thread draws itself; tap to replay */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.thread.anim'), function (t) {
    var tm;
    function reset() { t.classList.add('snap'); t.classList.remove('in'); void t.offsetWidth; t.classList.remove('snap'); }
    function play(delay) { clearTimeout(tm); reset(); tm = setTimeout(function () { t.classList.add('in'); }, delay || 80); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) play(250); else { clearTimeout(tm); reset(); } }, { threshold: .7 }).observe(t); else t.classList.add('in');
    t.addEventListener('click', function () { play(80); });
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(80); } });
  });
})();
(function () { var s = document.querySelector('.spc'); if (!s || !('IntersectionObserver' in window)) return; new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { s.classList.add('in'); o.disconnect(); } }, { threshold: .4 }).observe(s); })();
/* Shape centred text: longest line on top, each line below a little shorter.
   Only touches centred, block-level text of 2–5 lines. Falls back to text-wrap: balance. */
(function () {
  var SEL = 'h1,h2,h3,h4,p,blockquote,figcaption';
  var lastW = 0, timer;
  function lines(el) {
    var r = document.createRange(); r.selectNodeContents(el);
    var rows = [];
    Array.prototype.forEach.call(r.getClientRects(), function (q) {
      if (q.width < 1) return;
      var row = rows.find(function (x) { return Math.abs(x.mid - (q.top + q.bottom) / 2) < q.height / 2; });
      if (row) { row.l = Math.min(row.l, q.left); row.r = Math.max(row.r, q.right); }
      else rows.push({ mid: (q.top + q.bottom) / 2, l: q.left, r: q.right });
    });
    rows.sort(function (a, b) { return a.mid - b.mid; });
    return rows.map(function (x) { return x.r - x.l; });
  }
  function eligible(el) {
    if (el.closest('button,li,[hidden],.no-shape') || el.querySelector('br,img,svg,button')) return false;
    var cs = getComputedStyle(el);
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) if (getComputedStyle(c).display !== 'inline') return false;
    return cs.textAlign === 'center' && cs.display === 'block' && el.offsetWidth > 0 && el.textContent.trim().length > 12;
  }
  function reset(el) { el.style.paddingLeft = el.style.paddingRight = el.style.textWrap = ''; }
  // How far a lower line pokes out past the line above, as a share of the top line (0 = perfect shape).
  function bulge(w) { var s = 0; for (var i = 1; i < w.length; i++) s = Math.max(s, (w[i] - w[i - 1]) / w[0]); return s; }
  function shape(el) {
    reset(el);
    if (!eligible(el)) return;
    var cs = getComputedStyle(el), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
    var wb = lines(el);                          // what CSS balance gives
    el.style.textWrap = 'wrap';
    var n = lines(el).length;
    if (n < 2 || n > 5) { reset(el); return; }
    var cw = el.clientWidth - pl - pr, best = null, bestN = 9, near = null, nearS = bulge(wb);
    for (var d = 0; d < cw / 2; d += 4) {
      el.style.paddingLeft = (pl + d) + 'px'; el.style.paddingRight = (pr + d) + 'px';
      var w = lines(el), m = w.length;
      if (m > Math.min(n + 1, 5)) break;
      if (w[m - 1] < w[0] * 0.3) continue;       // no stranded last word
      var s = bulge(w);
      if (s <= 0.03 && m <= bestN) { best = d; bestN = m; }   // true shape: fewest lines, then tightest
      if (s < nearS) { near = d; nearS = s; }                 // otherwise: closest to it
    }
    if (best === null) best = near;
    if (best === null) { reset(el); return; }    // balance was already the best shape
    el.style.paddingLeft = (pl + best) + 'px'; el.style.paddingRight = (pr + best) + 'px';
  }
  function run() { lastW = innerWidth; document.querySelectorAll(SEL).forEach(shape); }
  window.shapeText = run;
  function start() { (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { requestAnimationFrame(run); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  addEventListener('resize', function () {
    if (innerWidth === lastW) return;
    clearTimeout(timer); timer = setTimeout(run, 150);
  });
})();
