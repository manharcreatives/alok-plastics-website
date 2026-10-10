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
          $when = $st === 'pending' ? (int) $o['created_at'] : (int) ($at[$st] ?? 0);
      ?>
        <li><span class="tl-meta"><?= $when ? e(AlokShop::fmt($when)) : ($done ? '' : 'Not yet') ?></span><span class="tl-text"><?= $done ? '✔ ' : '○ ' ?><?= e(ALOK_ORDER_LABELS[$st]) ?></span></li>
      <?php endforeach; ?>
      <?php if ($o['status'] === 'cancelled'): ?><li><span class="tl-meta">Cancelled</span><span class="tl-text"><?= e($o['cancel_reason'] ?? '') ?></span></li><?php endif; ?>
      </ol>
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
      <div class="card-head"><h2 class="card-title" id="h-msg">Message the customer</h2><span class="card-sub">Opens WhatsApp with this text ready; you press Send</span></div>
      <label for="wa-text" class="sr-only">Message</label>
      <textarea id="wa-text" rows="4" readonly><?= e($waText) ?></textarea>
      <p><a class="btn btn-wa" href="<?= e($wa) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>Send on WhatsApp</a></p>
    </section>

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
        <a class="btn btn-wa" href="<?= e($wa) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>WhatsApp</a>
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
