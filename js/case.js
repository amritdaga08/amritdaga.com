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
