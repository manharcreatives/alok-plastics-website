<?php defined('ALOK_ADMIN') || exit; ?>
<?php
$self = u('order', ['id' => $o['id']]);
$meta = 'Placed ' . AlokShop::fmt((int) $o['created_at'], 'l, d M Y, H:i:s') . ' · ' . ($o['mail_ok'] ?? 0 ? 'email sent' : 'email not sent') . ' · ' . ($o['gas_ok'] ?? 0 ? 'logged to Sheet' : 'not logged to Sheet');
?>
<?= page_head('Order ' . $o['code'], [['Dashboard', u()], ['Orders', u('orders')], [$o['code'], null]], e($meta), '', ' ' . shop_badge($o['status'], ALOK_ORDER_LABELS, ALOK_ORDER_TONES)) ?>

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

    <section class="card" aria-labelledby="h-status">
      <div class="card-head"><h2 class="card-title" id="h-status">Update status</h2><span class="card-sub">Optionally add a note with the change</span></div>
      <form method="post" action="<?= e($self) ?>">
        <?= csrf_field() ?><input type="hidden" name="do" value="status">
        <div class="field">
          <label for="status">Status</label>
          <select id="status" name="status">
            <?php foreach (ALOK_ORDER_LABELS as $k => $l): ?><option value="<?= e($k) ?>"<?= $o['status'] === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
          </select>
        </div>
        <div class="field">
          <label for="status-note">Internal note (optional)</label>
          <textarea id="status-note" name="note" rows="2" maxlength="1000"></textarea>
        </div>
        <button class="btn btn-primary" type="submit">Save status</button>
      </form>
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
        <dt>Mobile</dt><dd>+<?= e($o['phone']) ?></dd>
        <dt>Placed</dt><dd><?= e(AlokShop::fmt((int) $o['created_at'], 'd M Y, H:i:s')) ?></dd>
        <dt>Last updated</dt><dd><?= e(AlokShop::fmt((int) $o['updated_at'], 'd M Y, H:i:s')) ?></dd>
        <dt>IP address</dt><dd><?= e($o['ip'] ?: '—') ?></dd>
      </dl>
    </section>
  </div>
</div>
