/* Product manager: progressive enhancement only. The form saves without this file. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  // Character counters (red when over the limit) and "Reset to default" buttons.
  document.querySelectorAll('[data-max]').forEach(function (inp) {
    var out = document.querySelector('.count-out[data-for="' + inp.id + '"]');
    var max = parseInt(inp.getAttribute('data-max'), 10);
    function upd() {
      if (out) {
        out.textContent = String(inp.value.length);
        out.classList.toggle('over', inp.value.length > max);
      }
      preview();
    }
    inp.addEventListener('input', upd);
  });
  document.querySelectorAll('[data-reset]').forEach(function (btn) {
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var inp = $(btn.getAttribute('data-reset'));
      if (!inp) return;
      inp.value = inp.tagName === 'SELECT' ? (inp.getAttribute('data-default') || '') : '';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.focus();
    });
  });

  // Google-style preview (text nodes only).
  var box = $('seo-preview');
  function val(id) { var el = $(id); return el ? el.value.trim() : ''; }
  function clip(s, n) { return s.length > n ? s.slice(0, n - 1).replace(/\s+$/, '') + '…' : s; }
  function preview() {
    if (!box) return;
    var t = val('f-seoTitle') || val('f-name') || box.getAttribute('data-name') || '';
    var d = val('f-seoDescription') || val('f-summary') || box.getAttribute('data-summary') || '';
    $('sp-title').textContent = clip(t, 60);
    $('sp-desc').textContent = clip(d, 160);
  }
  preview();

  // Image reordering buttons: swap rows, then renumber the position boxes.
  var list = $('imglist');
  function renumber() {
    if (!list) return;
    Array.prototype.forEach.call(list.children, function (li, i) {
      var pos = li.querySelector('input.pos');
      if (pos) pos.value = String(i + 1);
    });
  }
  if (list) {
    list.querySelectorAll('[data-move]').forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', function () {
        var li = b.closest('li');
        if (!li) return;
        if (b.getAttribute('data-move') === 'up' && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
        else if (b.getAttribute('data-move') === 'down' && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
        renumber();
        b.focus();
      });
    });
  }
})();
