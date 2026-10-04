/* Alok Plastics admin — tiny progressive enhancements. Every screen works without this file. */
(function () {
  'use strict';

  // Selects marked data-autosubmit submit their form when changed. With the value "quiet" the form's
  // button is toned down (it stays as the no-JS fallback); filter selects keep their Apply button.
  document.querySelectorAll('select[data-autosubmit]').forEach(function (sel) {
    var form = sel.form;
    if (!form) return;
    if (sel.getAttribute('data-autosubmit') === 'quiet') {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.classList.add('btn-quiet');
    }
    sel.addEventListener('change', function () {
      if (typeof form.requestSubmit === 'function') form.requestSubmit(); else form.submit();
    });
  });

  // Flash messages can be dismissed; success notes fade out by themselves.
  document.querySelectorAll('.flash:not(.flash-float)').forEach(function (el) {
    var gone = function () {
      el.classList.add('is-gone');
      setTimeout(function () { el.remove(); }, 280);
    };
    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'flash-dismiss';
    x.setAttribute('aria-label', 'Dismiss message');
    x.textContent = '\u00D7';
    x.addEventListener('click', gone);
    el.appendChild(x);
    if (el.classList.contains('flash-ok')) setTimeout(gone, 7000);
  });
})();
