/* Alok Plastics admin — tiny progressive enhancements. Every screen works without this file. */
(function () {
  'use strict';

  // Status / assignee selects submit their form when changed (the button stays as the no-JS fallback).
  document.querySelectorAll('select[data-autosubmit]').forEach(function (sel) {
    var form = sel.form;
    if (!form) return;
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.classList.add('btn-quiet');
    sel.addEventListener('change', function () {
      if (typeof form.requestSubmit === 'function') form.requestSubmit(); else form.submit();
    });
  });

  // Opening hours: a ticked "Closed" disables that day's time inputs.
  document.querySelectorAll('input[data-closes]').forEach(function (cb) {
    var day = cb.getAttribute('data-closes');
    var open = document.getElementById('open_' + day);
    var close = document.getElementById('close_' + day);
    function sync() {
      if (open) open.disabled = cb.checked;
      if (close) close.disabled = cb.checked;
    }
    cb.addEventListener('change', sync);
    sync();
  });

  // Live character counter for the banner text.
  document.querySelectorAll('input[data-counter]').forEach(function (inp) {
    var out = document.getElementById(inp.getAttribute('data-counter'));
    if (!out) return;
    function upd() { out.textContent = String(inp.value.length); }
    inp.addEventListener('input', upd);
    upd();
  });
})();
