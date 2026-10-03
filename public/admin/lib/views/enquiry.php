<?php defined('ALOK_ADMIN') || exit; ?>
<?php
/** @var array $r @var array $links @var list<string> $people */
$self = u('enquiry', ['id' => $r['id']]);
$contact = [
    'Email' => $r['email'], 'City' => $r['city'], 'State' => $r['state'], 'GSTIN' => $r['gstin'],
    'Buyer type' => ALOK_BUYER_TYPES[$r['buyer_type']] ?? $r['buyer_type'],
];
$path = ['new', 'contacted', 'quoted', 'won'];
$cur = array_search($r['status'], $path, true); // false when "lost"
$meta = 'Received ' . alok_date($r['created_at'], 'l, d M Y, H:i') . ' · from ' . ($r['source'] ?: 'unknown page') . ($r['mail_ok'] ? '' : ' · email notification failed');
$badges = ' ' . status_badge($r['status']) . ($r['archived'] ? ' <span class="badge badge-archived">Archived</span>' : '');
?>
<?= page_head('Enquiry #' . (int) $r['id'], [['Dashboard', u()], ['Enquiries', u('enquiries')], ['#' . (int) $r['id'], null]], e($meta), '', $badges) ?>

<div class="detail">
  <div class="detail-main">

    <section class="card" aria-labelledby="h-track">
      <div class="card-head"><h2 class="card-title" id="h-track">Follow-up status</h2><span class="card-sub">Tap a step to move this enquiry</span></div>
      <form class="stepper-form" method="post" action="<?= e($self) ?>">
        <?= csrf_field() ?><input type="hidden" name="do" value="status">
        <ol class="stepper">
          <?php foreach ($path as $i => $k):
            $cls = $cur === false ? '' : ($i < $cur ? 'is-done' : ($i === $cur ? 'is-current' : '')); ?>
          <li class="<?= $cls ?>">
            <button class="step" type="submit" name="status" value="<?= e($k) ?>"<?= $cls === 'is-current' ? ' aria-current="step"' : '' ?>>
              <span class="step-dot"><?= $cls === 'is-done' ? icon('check') : ($i + 1) ?></span>
              <span><?= e(ALOK_STATUS_LABELS[$k]) ?></span>
            </button>
          </li>
          <?php endforeach; ?>
        </ol>
        <button class="btn btn-secondary btn-sm step-lost" type="submit" name="status" value="lost"<?= $r['status'] === 'lost' ? ' aria-current="step"' : '' ?>><?= $r['status'] === 'lost' ? 'Marked as lost' : 'Mark as lost' ?></button>
      </form>
    </section>

    <section class="card" aria-labelledby="h-what">
      <div class="card-head"><h2 class="card-title" id="h-what">What they need</h2></div>
      <dl class="dl">
        <dt>Product(s)</dt><dd><?= e($r['product'] ?: '—') ?></dd>
        <?php if ($r['quantity'] > 0): ?><dt>Quantity</dt><dd><?= e(number_format($r['quantity'])) ?> <?= e($r['unit']) ?></dd><?php endif; ?>
      </dl>
      <?php if ($r['message'] !== ''): ?>
        <h3 class="sr-only">Message</h3>
        <p class="msg"><?= nl2br(e($r['message'])) ?></p>
      <?php else: ?>
        <p class="meta">No additional message.</p>
      <?php endif; ?>
    </section>

    <section class="card" aria-labelledby="h-notes">
      <div class="card-head"><h2 class="card-title" id="h-notes">Internal notes</h2><span class="card-sub">Never shown to the customer</span></div>
      <?php if (!$r['notes']): ?>
        <p class="empty">No notes yet. Write down what was said so the next person knows.</p>
      <?php else: ?>
      <ol class="timeline">
        <?php foreach (array_reverse($r['notes']) as $n): ?>
          <li><span class="tl-meta"><?= e(alok_date((int) ($n['at'] ?? 0))) ?> · <span class="tl-who"><?= e($n['by'] ?? '') ?></span></span><span class="tl-text"><?= nl2br(e($n['text'] ?? '')) ?></span></li>
        <?php endforeach; ?>
      </ol>
      <?php endif; ?>
      <form method="post" action="<?= e($self) ?>">
        <?= csrf_field() ?><input type="hidden" name="do" value="note">
        <div class="field">
          <label for="note">Add a note</label>
          <textarea id="note" name="note" rows="3" maxlength="1000" required placeholder="e.g. Called, wants a quote for 5,000 pcs by month end"></textarea>
        </div>
        <button class="btn btn-primary" type="submit"><?= icon('plus') ?>Save note</button>
      </form>
    </section>
  </div>

  <div class="detail-side">
    <section class="card customer" aria-labelledby="h-who">
      <h2 class="sr-only" id="h-who">Customer</h2>
      <p class="customer-name"><?= e($r['name']) ?></p>
      <p class="customer-co"><?= e($r['company']) ?></p>
      <div class="reach">
        <?php if ($links['tel']): ?><a class="btn btn-primary" href="<?= e($links['tel']) ?>"><?= icon('phone') ?>Call <?= e($r['phone']) ?></a><?php endif; ?>
        <?php if ($links['wa']): ?><a class="btn btn-wa" href="<?= e($links['wa']) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>WhatsApp</a><?php endif; ?>
        <?php if ($links['mail']): ?><a class="btn btn-secondary" href="<?= e($links['mail']) ?>"><?= icon('mail') ?>Email</a><?php endif; ?>
      </div>
      <p class="help">Opens your phone, WhatsApp or mail app with a short greeting filled in. A 10-digit Indian mobile number is dialled as +91; check the number if the customer is abroad.</p>
      <dl class="dl">
        <?php if ($r['phone'] !== ''): ?><dt>Phone</dt><dd><?= e($r['phone']) ?></dd><?php endif; ?>
        <?php foreach ($contact as $label => $val): if ($val === '') continue; ?>
          <dt><?= e($label) ?></dt><dd><?= e($val) ?></dd>
        <?php endforeach; ?>
      </dl>
    </section>

    <section class="card" aria-labelledby="h-assign">
      <div class="card-head"><h2 class="card-title" id="h-assign">Assigned to</h2></div>
      <form class="inline-form" method="post" action="<?= e($self) ?>">
        <?= csrf_field() ?><input type="hidden" name="do" value="assign">
        <div class="field">
          <label class="sr-only" for="assigned_to">Assigned to</label>
          <select id="assigned_to" name="assigned_to" data-autosubmit="quiet">
            <option value="">Nobody</option>
            <?php foreach ($people as $p): ?><option value="<?= e($p) ?>"<?= $r['assigned_to'] === $p ? ' selected' : '' ?>><?= e($p) ?></option><?php endforeach; ?>
          </select>
        </div>
        <button class="btn btn-secondary" type="submit">Assign</button>
      </form>
    </section>

    <section class="card danger-zone" aria-labelledby="h-manage">
      <div class="card-head"><h2 class="card-title" id="h-manage">Tidy up</h2></div>
      <div class="actions">
        <form method="post" action="<?= e($self) ?>"><?= csrf_field() ?>
          <input type="hidden" name="do" value="<?= $r['archived'] ? 'unarchive' : 'archive' ?>">
          <button class="btn btn-secondary" type="submit"><?= $r['archived'] ? 'Restore from archive' : 'Archive' ?></button>
        </form>
        <a class="btn btn-danger" href="<?= e(u('enquiry_delete', ['id' => $r['id']])) ?>"><?= icon('trash') ?>Delete…</a>
      </div>
      <p class="help">Archiving hides it from the main list but keeps it. Deleting cannot be undone.</p>
    </section>
  </div>
</div>
