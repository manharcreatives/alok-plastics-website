/* Alok Plastics admin — tiny progressive enhancements. Every screen works without this file. */
window.alokAdminInit = function () {
  'use strict';
  var fresh = function (el) { if (el.__alok) return false; el.__alok = true; return true; };

  // Selects marked data-autosubmit submit their form when changed. With the value "quiet" the form's
  // button is toned down (it stays as the no-JS fallback); filter selects keep their Apply button.
  document.querySelectorAll('select[data-autosubmit], input[type="checkbox"][data-autosubmit]').forEach(function (sel) {
    if (!fresh(sel)) return;
    var form = sel.form;
    if (!form) return;
    if (sel.type === 'checkbox') {
      var save = form.querySelector('button[type="submit"]');
      if (save) save.hidden = true;
    } else if (sel.getAttribute('data-autosubmit') === 'quiet') {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.classList.add('btn-quiet');
    }
    sel.addEventListener('change', function () {
      if (typeof form.requestSubmit === 'function') form.requestSubmit(); else form.submit();
    });
  });

  // Forms marked data-confirm ask before they send anything.
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    if (!fresh(form)) return;
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  // A button with data-append-to / data-append adds its text as a new line to that textarea.
  document.querySelectorAll('[data-append-to]').forEach(function (btn) {
    if (!fresh(btn)) return;
    btn.addEventListener('click', function () {
      var box = document.getElementById(btn.getAttribute('data-append-to'));
      var line = btn.getAttribute('data-append') || '';
      if (!box || !line || box.value.indexOf(line) !== -1) return;
      box.value = box.value.replace(/\s+$/, '') + (box.value.trim() ? '\n' : '') + line;
      box.focus();
    });
  });

  // "Open in WhatsApp" link follows the message textarea; the plain href already carries the starting text.
  document.querySelectorAll('a[data-wa-link]').forEach(function (a) {
    if (!fresh(a)) return;
    var box = document.getElementById(a.getAttribute('data-wa-link'));
    if (!box) return;
    var base = a.getAttribute('href').split('?')[0];
    var sync = function () { a.setAttribute('href', base + '?text=' + encodeURIComponent(box.value)); };
    box.addEventListener('input', sync);
    a.addEventListener('click', sync);
  });

  // A freshly generated PDF downloads itself once.
  document.querySelectorAll('a[data-autodownload]').forEach(function (a) { if (fresh(a)) a.click(); });

  // PDF form: GST-only fields follow the document type; item lines can be added and removed.
  document.querySelectorAll('form[data-pdf-form]').forEach(function (form) {
    if (!fresh(form)) return;
    var type = form.querySelector('[data-pdf-type]');
    var only = form.querySelectorAll('[data-pdf-only]');
    var sync = function () {
      only.forEach(function (el) { el.hidden = el.getAttribute('data-pdf-only') !== type.value; });
    };
    if (type) { type.addEventListener('change', sync); sync(); }

    var body = form.querySelector('.pdf-lines');
    if (!body) return;
    var wire = function (row) {
      var cell = row.querySelector('.pdf-rm');
      if (!cell || cell.firstChild) return;
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'btn btn-quiet btn-sm';
      x.setAttribute('aria-label', 'Remove this line');
      x.textContent = '\u00D7';
      x.addEventListener('click', function () {
        if (body.children.length > 1) row.remove();
        else row.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      });
      cell.appendChild(x);
    };
    Array.prototype.forEach.call(body.children, wire);
    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'btn btn-secondary btn-sm';
    add.textContent = 'Add line';
    add.addEventListener('click', function () {
      var row = body.lastElementChild.cloneNode(true);
      row.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      row.querySelector('.pdf-rm').textContent = '';
      body.appendChild(row);
      wire(row);
      row.querySelector('input').focus();
    });
    body.insertAdjacentElement('afterend', add);
  });

  // Flash messages can be dismissed; success notes fade out by themselves.
  document.querySelectorAll('.flash:not(.flash-float)').forEach(function (el) {
    if (!fresh(el)) return;
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
};

// The admin is a React app: screens swap without a page load, so enhancements are re-applied as the DOM changes.
(function () {
  var t;
  var run = function () { clearTimeout(t); t = setTimeout(window.alokAdminInit, 40); };
  var start = function () {
    window.alokAdminInit();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === "complete") setTimeout(start, 250); else window.addEventListener("load", function () { setTimeout(start, 250); });
})();
