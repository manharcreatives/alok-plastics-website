<?php defined('ALOK_ADMIN') || exit; ?>
<?php
$self = u('application', ['id' => $a['id']]);
$meta = 'Received ' . AlokShop::fmt((int) $a['created_at'], 'l, d M Y, H:i:s') . ' · ' . ($a['mail_ok'] ?? 0 ? 'email sent' : 'email not sent') . ' · ' . ($a['gas_ok'] ?? 0 ? 'logged to Sheet' : 'not logged to Sheet');
?>
<?= page_head($a['name'], [['Dashboard', u()], ['Applications', u('applications')], ['#' . (int) $a['id'], null]], e($meta), '', ' ' . shop_badge($a['status'], ALOK_APPLICATION_LABELS, ALOK_APPLICATION_TONES)) ?>

<div class="detail">
  <div class="detail-main">
    <section class="card" aria-labelledby="h-app">
      <div class="card-head"><h2 class="card-title" id="h-app">Application</h2></div>
      <dl class="dl">
        <dt>Position</dt><dd><?= e($a['position']) ?></dd>
        <dt>Resume / LinkedIn</dt>
        <dd>
          <?php if ($a['resume_file'] !== ''): ?>
            <a href="<?= e(u('resume', ['id' => $a['id']])) ?>"><?= e($a['resume_name'] ?: 'Download resume') ?></a> <span class="meta">(<?= e(number_format(((int) $a['resume_size']) / 1024, 0)) ?> KB)</span>
          <?php endif; ?>
          <?php if ($a['resume_link'] !== ''): ?>
            <?= $a['resume_file'] !== '' ? '<br>' : '' ?><a href="<?= e($a['resume_link']) ?>" target="_blank" rel="noopener noreferrer nofollow"><?= e(mb_strimwidth($a['resume_link'], 0, 70, '…')) ?></a>
          <?php endif; ?>
          <?php if ($a['resume_file'] === '' && $a['resume_link'] === ''): ?>—<?php endif; ?>
        </dd>
      </dl>
      <?php if ($a['message'] !== ''): ?><p class="msg"><?= nl2br(e($a['message'])) ?></p><?php else: ?><p class="meta">No message.</p><?php endif; ?>
    </section>

    <section class="card" aria-labelledby="h-status">
      <div class="card-head"><h2 class="card-title" id="h-status">Status</h2></div>
      <form class="inline-form" method="post" action="<?= e($self) ?>">
        <?= csrf_field() ?><input type="hidden" name="do" value="status">
        <div class="field">
          <label class="sr-only" for="status">Status</label>
          <select id="status" name="status">
            <?php foreach (ALOK_APPLICATION_LABELS as $k => $l): ?><option value="<?= e($k) ?>"<?= $a['status'] === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
          </select>
        </div>
        <button class="btn btn-secondary" type="submit">Save status</button>
      </form>
    </section>

    <section class="card" aria-labelledby="h-notes">
      <div class="card-head"><h2 class="card-title" id="h-notes">Internal notes</h2></div>
      <?php if (!($a['notes'] ?? [])): ?>
        <p class="empty">No notes yet.</p>
      <?php else: ?>
      <ol class="timeline">
        <?php foreach (array_reverse($a['notes']) as $n): ?>
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
      <h2 class="sr-only" id="h-who">Applicant</h2>
      <p class="customer-name"><?= e($a['name']) ?></p>
      <div class="reach">
        <a class="btn btn-primary" href="tel:<?= e($a['phone']) ?>"><?= icon('phone') ?>Call <?= e($a['phone']) ?></a>
        <?php if ($wa !== ''): ?><a class="btn btn-wa" href="<?= e($wa) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>WhatsApp</a><?php endif; ?>
        <a class="btn btn-secondary" href="mailto:<?= e($a['email']) ?>"><?= icon('mail') ?>Email</a>
      </div>
      <dl class="dl">
        <dt>Phone</dt><dd><?= e($a['phone']) ?></dd>
        <dt>Email</dt><dd><?= e($a['email']) ?></dd>
        <dt>Submitted</dt><dd><?= e(AlokShop::fmt((int) $a['created_at'], 'd M Y, H:i:s')) ?></dd>
        <dt>IP address</dt><dd><?= e($a['ip'] ?: '—') ?></dd>
      </dl>
    </section>
  </div>
</div>
