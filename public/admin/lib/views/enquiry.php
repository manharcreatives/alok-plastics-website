<?php defined('ALOK_ADMIN') || exit; ?>
<?php
/** @var array $r @var array $links @var list<string> $people */
$self = u('enquiry', ['id' => $r['id']]);
$details = [
    'Name' => $r['name'], 'Company' => $r['company'], 'Phone' => $r['phone'], 'Email' => $r['email'],
    'City' => $r['city'], 'State' => $r['state'], 'GSTIN' => $r['gstin'],
    'Buyer type' => ALOK_BUYER_TYPES[$r['buyer_type']] ?? $r['buyer_type'],
];
?>
<p class="crumb"><a href="<?= e(u('enquiries')) ?>">← All enquiries</a></p>
<div class="row-between">
  <h1>Enquiry #<?= (int) $r['id'] ?> <?= status_badge($r['status']) ?><?php if ($r['archived']): ?> <span class="badge badge-archived">Archived</span><?php endif; ?></h1>
</div>
<p class="meta">Received <?= e(alok_date($r['created_at'], 'l, d M Y, H:i')) ?> · from <?= e($r['source'] ?: 'unknown page') ?><?= $r['mail_ok'] ? '' : ' · email notification failed' ?></p>

<section class="card" aria-labelledby="h-reply">
  <h2 id="h-reply">Reply</h2>
  <div class="actions">
    <?php if ($links['tel']): ?><a class="btn btn-primary" href="<?= e($links['tel']) ?>">Call <?= e($r['phone']) ?></a><?php endif; ?>
    <?php if ($links['wa']): ?><a class="btn btn-secondary" href="<?= e($links['wa']) ?>" target="_blank" rel="noopener noreferrer">WhatsApp</a><?php endif; ?>
    <?php if ($links['mail']): ?><a class="btn btn-secondary" href="<?= e($links['mail']) ?>">Email</a><?php endif; ?>
  </div>
  <p class="meta">Opens your phone, WhatsApp or mail app with a short greeting filled in. A 10-digit Indian mobile number is dialled as +91; check the number if the customer is abroad.</p>
</section>

<div class="grid2">
  <section class="card" aria-labelledby="h-who">
    <h2 id="h-who">Who</h2>
    <dl class="dl">
      <?php foreach ($details as $label => $val): if ($val === '') continue; ?>
        <dt><?= e($label) ?></dt><dd><?= e($val) ?></dd>
      <?php endforeach; ?>
    </dl>
  </section>

  <section class="card" aria-labelledby="h-what">
    <h2 id="h-what">What they need</h2>
    <dl class="dl">
      <dt>Product(s)</dt><dd><?= e($r['product'] ?: '—') ?></dd>
      <?php if ($r['quantity'] > 0): ?><dt>Quantity</dt><dd><?= e(number_format($r['quantity'])) ?> <?= e($r['unit']) ?></dd><?php endif; ?>
    </dl>
    <?php if ($r['message'] !== ''): ?>
      <h3>Message</h3>
      <p class="msg"><?= nl2br(e($r['message'])) ?></p>
    <?php else: ?>
      <p class="meta">No additional message.</p>
    <?php endif; ?>
  </section>
</div>

<section class="card" aria-labelledby="h-track">
  <h2 id="h-track">Follow-up</h2>
  <form class="inline-form" method="post" action="<?= e($self) ?>">
    <?= csrf_field() ?><input type="hidden" name="do" value="status">
    <div class="field">
      <label for="status">Status</label>
      <select id="status" name="status" data-autosubmit>
        <?php foreach (ALOK_STATUS_LABELS as $k => $l): ?><option value="<?= e($k) ?>"<?= $r['status'] === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
      </select>
    </div>
    <button class="btn btn-secondary" type="submit">Update status</button>
  </form>

  <form class="inline-form" method="post" action="<?= e($self) ?>">
    <?= csrf_field() ?><input type="hidden" name="do" value="assign">
    <div class="field">
      <label for="assigned_to">Assigned to</label>
      <select id="assigned_to" name="assigned_to" data-autosubmit>
        <option value="">Nobody</option>
        <?php foreach ($people as $p): ?><option value="<?= e($p) ?>"<?= $r['assigned_to'] === $p ? ' selected' : '' ?>><?= e($p) ?></option><?php endforeach; ?>
      </select>
    </div>
    <button class="btn btn-secondary" type="submit">Assign</button>
  </form>
</section>

<section class="card" aria-labelledby="h-notes">
  <h2 id="h-notes">Internal notes</h2>
  <p class="meta">Only people with admin access see these. They are never shown to the customer.</p>
  <?php if (!$r['notes']): ?>
    <p class="empty">No notes yet.</p>
  <?php else: ?>
  <ul class="notes">
    <?php foreach (array_reverse($r['notes']) as $n): ?>
      <li><span class="meta"><?= e(alok_date((int) ($n['at'] ?? 0))) ?> · <?= e($n['by'] ?? '') ?></span><br><?= nl2br(e($n['text'] ?? '')) ?></li>
    <?php endforeach; ?>
  </ul>
  <?php endif; ?>
  <form method="post" action="<?= e($self) ?>">
    <?= csrf_field() ?><input type="hidden" name="do" value="note">
    <div class="field">
      <label for="note">Add a note</label>
      <textarea id="note" name="note" rows="3" maxlength="1000" required placeholder="e.g. Called, wants a quote for 5,000 pcs by month end"></textarea>
    </div>
    <button class="btn btn-primary" type="submit">Save note</button>
  </form>
</section>

<section class="card danger-zone" aria-labelledby="h-manage">
  <h2 id="h-manage">Tidy up</h2>
  <div class="actions">
    <form method="post" action="<?= e($self) ?>"><?= csrf_field() ?>
      <input type="hidden" name="do" value="<?= $r['archived'] ? 'unarchive' : 'archive' ?>">
      <button class="btn btn-secondary" type="submit"><?= $r['archived'] ? 'Restore from archive' : 'Archive' ?></button>
    </form>
    <a class="btn btn-danger" href="<?= e(u('enquiry_delete', ['id' => $r['id']])) ?>">Delete permanently…</a>
  </div>
  <p class="meta">Archiving hides it from the main list but keeps it. Deleting cannot be undone.</p>
</section>
