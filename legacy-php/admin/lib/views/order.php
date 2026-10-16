<?php defined('ALOK_ADMIN') || exit; ?>
<?php
$self = u('order', ['id' => $o['id']]);
$meta = 'Received ' . AlokShop::fmt((int) $o['created_at'], 'l, d M Y, H:i:s') . ' · ' . ($o['mail_ok'] ?? 0 ? 'email sent' : 'email not sent') . ' · ' . ($o['gas_ok'] ?? 0 ? 'logged to Sheet' : 'not logged to Sheet');
?>
<?= page_head('Enquiry ' . $o['code'], [['Dashboard', u()], ['Orders', u('orders')], [$o['code'], null]], e($meta), '', ' ' . shop_badge($o['status'], ALOK_ORDER_LABELS, ALOK_ORDER_TONES)) ?>

<div class="detail">
  <div class="detail-main">
    <section class="card" aria-labelledby="h-items">
      <div class="card-head"><h2 class="card-title" id="h-items">Items</h2><span class="card-sub"><?= count($o['items']) ?> <?= count($o['items']) === 1 ? 'line' : 'lines' ?></span></div>
      <div class="table-wrap">
      <table class="table">
        <thead><tr><th scope="col">Product</th><th scope="col">Quantity</th><th scope="col">Unit price</th></tr></thead>
        <tbody>
        <?php foreach ($o['items'] as $it): ?>
          <tr>
            <td><span class="cell-main"><?= e($it['name']) ?></span><?php if ($it['variant'] !== ''): ?><span class="cell-sub"><?= e($it['variant']) ?></span><?php endif; ?></td>
            <td class="nowrap"><?= e(number_format((int) $it['qty'])) ?> <?= e($it['unit']) ?></td>
            <td class="nowrap"><?= $it['price'] !== null ? 'Rs. ' . e(number_format((float) $it['price'], 0)) : '—' ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
      </div>
      <?php if ($o['total'] !== null): ?><p class="meta">Estimated total: Rs. <?= e(number_format((float) $o['total'], 0)) ?> (catalogue prices, before taxes and freight)</p><?php endif; ?>
      <?php if (($o['note'] ?? '') !== ''): ?><p class="msg"><?= nl2br(e($o['note'])) ?></p><?php endif; ?>
    </section>

    <section class="card" aria-labelledby="h-stage">
      <div class="card-head"><h2 class="card-title" id="h-stage">Progress</h2><span class="card-sub"><?= e(ALOK_ORDER_LABELS[$o['status']] ?? $o['status']) ?></span></div>
      <ol class="timeline">
      <?php
      $flow = ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'dispatched', 'invoiced', 'closed'];
      $at = array_column($o['history'] ?? [], 'at', 'to');
      $curIdx = array_search($o['status'], $flow, true);
      foreach ($flow as $i => $st):
          $done = $curIdx !== false && $i <= $curIdx;
          $when = !$done ? 0 : ($st === 'pending' ? (int) $o['created_at'] : (int) ($at[$st] ?? 0));
      ?>
        <li><span class="tl-meta"><?= $when ? e(AlokShop::fmt($when)) : ($done ? '' : 'Not yet') ?></span><span class="tl-text"><?= $done ? '✔ ' : '○ ' ?><?= e(ALOK_ORDER_LABELS[$st]) ?></span></li>
      <?php endforeach; ?>
      <?php if ($o['status'] === 'cancelled'): ?><li><span class="tl-meta">Cancelled</span><span class="tl-text"><?= e($o['cancel_reason'] ?? '') ?></span></li><?php endif; ?>
      </ol>
      <?php if ($prev !== null): ?>
      <details class="step-back">
        <summary class="meta">Go back to "<?= e(ALOK_ORDER_LABELS[$prev]) ?>"</summary>
        <form method="post" action="<?= e($self) ?>" data-confirm="Move this order back to &quot;<?= e(ALOK_ORDER_LABELS[$prev]) ?>&quot;? The customer is not messaged.">
          <?= csrf_field() ?><input type="hidden" name="do" value="back">
          <div class="field"><label for="back-reason">Reason (optional)</label><input id="back-reason" name="reason" type="text" maxlength="300" placeholder="e.g. Moved by mistake"></div>
          <button class="btn btn-secondary" type="submit">Move back to "<?= e(ALOK_ORDER_LABELS[$prev]) ?>"</button>
        </form>
      </details>
      <?php endif; ?>
      <?php
      $facts = [];
      if (($o['quote_amount'] ?? null) !== null && $o['quote_amount'] !== '') $facts['Quote'] = 'Rs. ' . number_format((float) $o['quote_amount'], 0) . (($o['quote_note'] ?? '') !== '' ? ' · ' . $o['quote_note'] : '');
      if (($o['pay_amount'] ?? null) !== null && $o['pay_amount'] !== '') $facts['Payment'] = 'Rs. ' . number_format((float) $o['pay_amount'], 0) . ' · ' . ($o['pay_mode'] ?? '') . (($o['pay_ref'] ?? '') !== '' ? ' · ref ' . $o['pay_ref'] : '');
      if (($o['lr_no'] ?? '') !== '' || ($o['transporter'] ?? '') !== '') $facts['Dispatch'] = trim(($o['transporter'] ?? '') . ' · LR ' . ($o['lr_no'] ?? ''), ' ·');
      if (($o['invoice_no'] ?? '') !== '') $facts['GST invoice'] = $o['invoice_no'];
      if ($facts): ?>
      <dl class="dl"><?php foreach ($facts as $k => $v): ?><dt><?= e($k) ?></dt><dd><?= e($v) ?></dd><?php endforeach; ?></dl>
      <?php endif; ?>
    </section>

    <?php if ($next !== null && $o['status'] !== 'cancelled'): ?>
    <section class="card" aria-labelledby="h-next">
      <div class="card-head"><h2 class="card-title" id="h-next">Next step: <?= e(ALOK_ORDER_LABELS[$next]) ?></h2><span class="card-sub">Moves the order forward and logs it</span></div>
      <form method="post" action="<?= e($self) ?>">
        <?= csrf_field() ?><input type="hidden" name="do" value="advance">
        <?php if ($next === 'quoted'): ?>
          <div class="field"><label for="quote_amount">Quoted amount, Rs. (optional)</label><input id="quote_amount" name="quote_amount" type="number" min="0" step="0.01" inputmode="decimal"></div>
          <div class="field"><label for="quote_note">Quote note (optional)</label><input id="quote_note" name="quote_note" type="text" maxlength="300" placeholder="e.g. Valid for 7 days, freight extra"></div>
        <?php elseif ($next === 'paid'): ?>
          <div class="field"><label for="pay_amount">Amount received, Rs. *</label><input id="pay_amount" name="pay_amount" type="number" min="0" step="0.01" inputmode="decimal" required></div>
          <div class="field"><label for="pay_mode">Mode</label>
            <select id="pay_mode" name="pay_mode"><option>NEFT / RTGS</option><option>UPI</option><option>Cheque</option><option>Cash</option></select></div>
          <div class="field"><label for="pay_ref">UTR / reference (optional)</label><input id="pay_ref" name="pay_ref" type="text" maxlength="80"></div>
        <?php elseif ($next === 'dispatched'): ?>
          <div class="field"><label for="transporter">Transporter (optional)</label><input id="transporter" name="transporter" type="text" maxlength="80"></div>
          <div class="field"><label for="lr_no">LR / tracking no. (optional)</label><input id="lr_no" name="lr_no" type="text" maxlength="60"></div>
        <?php elseif ($next === 'invoiced'): ?>
          <p class="meta">A gapless GST invoice number (financial-year series) is generated when you continue.</p>
        <?php endif; ?>
        <div class="field"><label for="status-note">Internal note (optional)</label><textarea id="status-note" name="note" rows="2" maxlength="1000"></textarea></div>
        <button class="btn btn-primary" type="submit">Mark as "<?= e(ALOK_ORDER_LABELS[$next]) ?>"</button>
      </form>
      <details>
        <summary class="meta">Cancel this enquiry</summary>
        <form method="post" action="<?= e($self) ?>">
          <?= csrf_field() ?><input type="hidden" name="do" value="cancel">
          <div class="field"><label for="reason">Reason *</label><input id="reason" name="reason" type="text" maxlength="300" required></div>
          <button class="btn btn-secondary" type="submit">Cancel enquiry</button>
        </form>
      </details>
    </section>

    <section class="card" aria-labelledby="h-msg">
      <div class="card-head"><h2 class="card-title" id="h-msg">Message the customer</h2><span class="card-sub">Edit the text, then send it yourself from WhatsApp</span></div>
      <label for="wa-text" class="sr-only">Message</label>
      <textarea id="wa-text" rows="5" maxlength="1000"><?= e($waText) ?></textarea>
      <p class="actions">
        <a class="btn btn-wa" id="wa-open" data-wa-link="wa-text" href="<?= e('https://wa.me/' . $o['phone'] . '?text=' . rawurlencode($waText)) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>Open in WhatsApp</a>
        <?php if (($o['transporter'] ?? '') !== '' || ($o['lr_no'] ?? '') !== ''): ?>
        <button class="btn btn-secondary" type="button" data-append-to="wa-text" data-append="<?= e('Dispatch: ' . trim(($o['transporter'] ?? '') . ((($o['transporter'] ?? '') !== '' && ($o['lr_no'] ?? '') !== '') ? ', ' : '') . (($o['lr_no'] ?? '') !== '' ? 'LR ' . $o['lr_no'] : ''))) ?>">Add dispatch link</button>
        <?php endif; ?>
      </p>
      <?php if (!empty($o['wa_sends'])): ?>
      <details>
        <summary class="meta">WhatsApp history (<?= count($o['wa_sends']) ?>)</summary>
        <ol class="timeline">
          <?php foreach (array_slice(array_reverse($o['wa_sends']), 0, 8) as $w): ?>
            <li><span class="tl-meta"><?= e(AlokShop::fmt((int) ($w['at'] ?? 0))) ?> · <span class="tl-who"><?= e($w['by'] ?? '') ?></span> · <?= !empty($w['ok']) ? 'sent' : 'not sent' ?></span><span class="tl-text"><?= e($w['text'] ?? '') ?></span></li>
          <?php endforeach; ?>
        </ol>
      </details>
      <?php endif; ?>
    </section>

    <?php endif; ?>

    <section class="card" id="pdfs" aria-labelledby="h-pdfs">
      <div class="card-head"><h2 class="card-title" id="h-pdfs">Proforma &amp; GST invoices</h2><span class="card-sub">Generate, download, then send from WhatsApp</span></div>
      <?php if (!($o['pdfs'] ?? [])): ?>
        <p class="empty">No PDF has been generated for this order yet.</p>
      <?php else: ?>
      <ul class="pdf-list">
        <?php foreach (array_reverse($o['pdfs'], true) as $n => $p): ?>
        <li class="pdf-item">
          <div class="pdf-head">
            <span class="badge <?= ($p['type'] ?? '') === 'invoice' ? 'tone-brand' : 'tone-info' ?>"><?= ($p['type'] ?? '') === 'invoice' ? 'GST Invoice' : 'Proforma' ?></span>
            <strong class="pdf-no"><?= e($p['no'] ?? '') ?></strong>
          </div>
          <p class="meta"><?= e($p['date'] ?? '') ?> · generated for +<?= e($p['to'] ?? '') ?> · <?= e(AlokShop::fmt((int) ($p['created_at'] ?? $p['sent_at'] ?? 0))) ?></p>
          <p class="actions">
            <a class="btn btn-secondary btn-sm" href="<?= e(u('order_pdf', ['id' => $o['id'], 'n' => $n])) ?>" target="_blank" rel="noopener"><?= icon('eye') ?>View</a>
            <a class="btn btn-secondary btn-sm" href="<?= e(u('order_pdf', ['id' => $o['id'], 'n' => $n, 'dl' => 1])) ?>"><?= icon('download') ?>Download</a>
            <a class="btn btn-secondary btn-sm" href="<?= e($self . '&pdf=' . (int) $n . '#pdf-form') ?>"><?= icon('file') ?>Edit &amp; Regenerate</a>
            <a class="btn btn-wa btn-sm" href="<?= e('https://wa.me/' . ($p['to'] ?? $o['phone'])) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>Open WhatsApp chat</a>
            <?php if (isset($got) && (int) $got === (int) $n): ?><a hidden data-autodownload href="<?= e(u('order_pdf', ['id' => $o['id'], 'n' => $n, 'dl' => 1])) ?>">Download</a><?php endif; ?>
          </p>
        </li>
        <?php endforeach; ?>
      </ul>
      <?php endif; ?>

      <?php if ($pdfForm === null): ?>
      <p class="actions">
        <a class="btn btn-primary" href="<?= e($self . '&pdf=new#pdf-form') ?>"><?= icon('plus') ?>New proforma</a>
        <a class="btn btn-secondary" href="<?= e($self . '&pdf=inv#pdf-form') ?>"><?= icon('plus') ?>New GST invoice</a>
      </p>
      <?php else: ?>
      <?php
      $d = $pdfForm;
      $c = $d['customer'] ?? [];
      $t = $d['transport'] ?? [];
      $rows = $d['items'] ?? [];
      $rows[] = ['name' => '', 'hsn' => '', 'qty' => '', 'unit' => '', 'price' => null];
      $rows[] = ['name' => '', 'hsn' => '', 'qty' => '', 'unit' => '', 'price' => null];
      ?>
      <form class="pdf-form" id="pdf-form" method="post" action="<?= e($self) ?>#pdfs" data-pdf-form>
        <?= csrf_field() ?><input type="hidden" name="do" value="pdf_prepare">
        <h3 class="pdf-sec"><?= e($pdfTitle) ?></h3>

        <div class="pdf-grid">
          <div class="field"><label for="pf-type">Document</label>
            <select id="pf-type" name="type" data-pdf-type><option value="proforma"<?= ($d['type'] ?? '') === 'proforma' ? ' selected' : '' ?>>Proforma invoice</option><option value="invoice"<?= ($d['type'] ?? '') === 'invoice' ? ' selected' : '' ?>>GST invoice</option></select></div>
          <div class="field"><label for="pf-no">Document no.</label><input id="pf-no" name="doc_no" type="text" maxlength="40" value="<?= e($d['no'] ?? '') ?>" placeholder="Auto"></div>
          <div class="field"><label for="pf-date">Date</label><input id="pf-date" name="doc_date" type="text" maxlength="10" pattern="\d{2}-\d{2}-\d{4}" placeholder="DD-MM-YYYY" value="<?= e($d['date'] ?? '') ?>"></div>
          <div class="field" data-pdf-only="invoice"><label for="pf-mode">Sale type</label>
            <select id="pf-mode" name="mode"><?php foreach (['ut' => 'UT (UTGST + CGST)', 'intra' => 'Same state (SGST + CGST)', 'inter' => 'Other state (IGST)'] as $k => $l): ?><option value="<?= $k ?>"<?= ($d['mode'] ?? 'ut') === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?></select></div>
          <div class="field" data-pdf-only="invoice"><label for="pf-rate">GST %</label><input id="pf-rate" name="rate" type="number" min="0" max="40" step="0.5" value="<?= e((string) ($d['rate'] ?? 18)) ?>"></div>
        </div>

        <h3 class="pdf-sec">Bill to</h3>
        <div class="pdf-grid">
          <div class="field"><label for="pf-cname">Customer name</label><input id="pf-cname" name="c_name" type="text" maxlength="80" required value="<?= e($c['name'] ?? '') ?>"></div>
          <div class="field"><label for="pf-cphone">WhatsApp number</label><input id="pf-cphone" name="c_phone" type="tel" inputmode="tel" maxlength="30" required value="<?= e(preg_replace('/^\+?91(?=\d{10}$)/', '', (string) ($c['phone'] ?? ''))) ?>"></div>
          <div class="field"><label for="pf-cstate">State</label><input id="pf-cstate" name="c_state" type="text" maxlength="40" value="<?= e($c['state'] ?? '') ?>"></div>
          <div class="field" data-pdf-only="invoice"><label for="pf-cgstin">Party GSTIN</label><input id="pf-cgstin" name="c_gstin" type="text" maxlength="15" value="<?= e($c['gstin'] ?? '') ?>"></div>
          <div class="field pdf-wide"><label for="pf-caddr">Address</label><textarea id="pf-caddr" name="c_address" rows="2" maxlength="300"><?= e($c['address'] ?? '') ?></textarea></div>
        </div>

        <div data-pdf-only="invoice">
          <h3 class="pdf-sec">Transport</h3>
          <div class="pdf-grid">
            <div class="field"><label for="pf-ttr">Transporter</label><input id="pf-ttr" name="t_transporter" type="text" maxlength="60" value="<?= e($t['transporter'] ?? '') ?>"></div>
            <div class="field"><label for="pf-tgr">G.R. no.</label><input id="pf-tgr" name="t_gr_no" type="text" maxlength="40" value="<?= e($t['gr_no'] ?? '') ?>"></div>
            <div class="field"><label for="pf-tdt">G.R. date</label><input id="pf-tdt" name="t_gr_dt" type="text" maxlength="20" value="<?= e($t['gr_dt'] ?? '') ?>"></div>
          </div>
        </div>

        <h3 class="pdf-sec">Items <span class="meta">Leave the price blank to print "On request".</span></h3>
        <div class="pdf-lines">
        <?php foreach ($rows as $r): ?>
          <div class="pdf-line">
            <div class="pdf-desc"><input name="it_name[]" type="text" maxlength="160" placeholder="Description of goods" aria-label="Description" value="<?= e($r['name']) ?>"><span class="pdf-rm"></span></div>
            <input name="it_hsn[]" type="text" maxlength="12" placeholder="HSN" aria-label="HSN code" value="<?= e($r['hsn'] ?? '') ?>">
            <input name="it_qty[]" type="number" min="0" step="any" placeholder="Qty" aria-label="Quantity" value="<?= e((string) $r['qty']) ?>">
            <input name="it_unit[]" type="text" maxlength="12" placeholder="Unit" aria-label="Unit" value="<?= e($r['unit'] ?? '') ?>">
            <input name="it_price[]" type="number" min="0" step="0.01" placeholder="Price" aria-label="Price per unit" value="<?= isset($r['price']) && $r['price'] !== null ? e((string) $r['price']) : '' ?>">
          </div>
        <?php endforeach; ?>
        </div>

        <div class="field"><label for="pf-note">Note on the PDF (optional)</label><textarea id="pf-note" name="note" rows="2" maxlength="300"><?= e($d['note'] ?? '') ?></textarea></div>
        <p class="actions">
          <button class="btn btn-wa" type="submit"><?= icon('download') ?>Generate PDF &amp; Download</button>
          <a class="btn btn-secondary" href="<?= e('https://wa.me/' . ($c['phone'] ?? $o['phone'])) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>Open WhatsApp chat</a>
          <a class="btn btn-quiet" href="<?= e($self . '#pdfs') ?>">Cancel</a>
        </p>
      </form>
      <?php endif; ?>
    </section>

    <?php if ($next !== null && $o['status'] !== 'cancelled'): ?>

    <section class="card" aria-labelledby="h-notes">
      <div class="card-head"><h2 class="card-title" id="h-notes">Internal notes</h2><span class="card-sub">Never shown to the customer</span></div>
      <?php if (!($o['notes'] ?? [])): ?>
        <p class="empty">No notes yet.</p>
      <?php else: ?>
      <ol class="timeline">
        <?php foreach (array_reverse($o['notes']) as $n): ?>
          <li><span class="tl-meta"><?= e(AlokShop::fmt((int) ($n['at'] ?? 0))) ?> · <span class="tl-who"><?= e($n['by'] ?? '') ?></span></span><span class="tl-text"><?= nl2br(e($n['text'] ?? '')) ?></span></li>
        <?php endforeach; ?>
      </ol>
      <?php endif; ?>
      <form method="post" action="<?= e($self) ?>">
        <?= csrf_field() ?><input type="hidden" name="do" value="note">
        <div class="field">
          <label for="note">Add a note</label>
          <textarea id="note" name="note" rows="3" maxlength="1000" required></textarea>
        </div>
        <button class="btn btn-primary" type="submit"><?= icon('plus') ?>Save note</button>
      </form>
    </section>

    <section class="card" id="edit" aria-labelledby="h-edit">
      <div class="card-head"><h2 class="card-title" id="h-edit">Edit details</h2><span class="card-sub">Fix a typo, address or quantity. Logged in the notes.</span></div>
      <form method="post" action="<?= e($self) ?>">
        <?= csrf_field() ?><input type="hidden" name="do" value="edit">
        <div class="form-grid">
          <div class="field"><label for="ed-name">Customer name</label><input id="ed-name" name="name" type="text" maxlength="80" required value="<?= e($o['name']) ?>"></div>
          <div class="field"><label for="ed-phone">Mobile</label><input id="ed-phone" name="phone" type="tel" inputmode="tel" maxlength="30" required value="<?= e(preg_replace('/^91/', '', (string) $o['phone'])) ?>"></div>
          <div class="field field-wide"><label for="ed-address">Delivery address</label><textarea id="ed-address" name="address" rows="3" maxlength="300" required><?= e($o['address'] ?? '') ?></textarea></div>
          <div class="field field-wide"><label for="ed-note">Customer's note</label><textarea id="ed-note" name="order_note" rows="2" maxlength="600"><?= e($o['note'] ?? '') ?></textarea></div>
        </div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th scope="col">Product</th><th scope="col">Quantity <span class="meta">(0 removes the line)</span></th></tr></thead>
          <tbody>
          <?php foreach ($o['items'] as $i => $it): ?>
            <tr><td><span class="cell-main"><?= e($it['name']) ?></span></td><td><input type="number" name="qty[<?= (int) $i ?>]" min="0" max="100000" value="<?= (int) $it['qty'] ?>" aria-label="Quantity of <?= e($it['name']) ?>"></td></tr>
          <?php endforeach; ?>
          </tbody>
        </table></div>
        <button class="btn btn-primary" type="submit"><?= icon('check') ?>Save changes</button>
      </form>
    </section>

    <section class="card" aria-labelledby="h-danger">
      <div class="card-head"><h2 class="card-title" id="h-danger">Delete this order</h2></div>
      <p class="meta">Wrong or test order? Deleting removes it permanently. To keep a record instead, use "Cancel" above.</p>
      <a class="btn btn-danger" href="<?= e(u('order_delete', ['id' => $o['id']])) ?>"><?= icon('trash') ?>Delete order</a>
    </section>
    <?php endif; ?>
  </div>

  <div class="detail-side">
    <section class="card customer" aria-labelledby="h-who">
      <h2 class="sr-only" id="h-who">Customer</h2>
      <p class="customer-name"><?= e($o['name']) ?></p>
      <div class="reach">
        <a class="btn btn-primary" href="tel:+<?= e($o['phone']) ?>"><?= icon('phone') ?>Call +<?= e($o['phone']) ?></a>
        <a class="btn btn-wa" href="<?= e($wa) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>Open chat</a>
      </div>
      <dl class="dl">
        <dt>Mobile</dt><dd>+<?= e($o['phone']) ?> <?= ($o['verified'] ?? 1) ? '<span class="badge tone-ok">OTP verified</span>' : '<span class="badge tone-warn">Not verified</span>' ?></dd>
        <dt>Address</dt><dd><?= ($o['address'] ?? '') !== '' ? nl2br(e($o['address'])) : '—' ?></dd>
        <dt>Received</dt><dd><?= e(AlokShop::fmt((int) $o['created_at'], 'd M Y, H:i:s')) ?></dd>
        <dt>Last updated</dt><dd><?= e(AlokShop::fmt((int) $o['updated_at'], 'd M Y, H:i:s')) ?></dd>
        <dt>IP address</dt><dd><?= e($o['ip'] ?: '—') ?></dd>
      </dl>
    </section>
  </div>
</div>
