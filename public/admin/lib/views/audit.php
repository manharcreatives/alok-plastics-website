<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var list<array<string,mixed>> $entries */ ?>
<?= page_head('Activity log', [['Dashboard', u()], ['Activity log', null]], 'Sign-ins and changes made in this panel, newest first (last 200). Network addresses are stored only as an anonymous code.') ?>
<?php if (!$entries): ?>
  <div class="card empty-state">
    <span class="empty-ico"><?= icon('clock') ?></span>
    <p class="empty-title">Nothing recorded yet</p>
    <p>Sign-ins, status changes, notes and exports will appear here.</p>
  </div>
<?php else: ?>
<div class="card">
<?php $day = null; $open = false;
foreach ($entries as $en):
    $ts = (int) ($en['ts'] ?? 0);
    $d = alok_date($ts, 'l, d M Y');
    if ($d !== $day):
        if ($open) echo '</ol>';
        $day = $d; $open = true; ?>
  <h2 class="log-day"><?= e($d) ?></h2>
  <ol class="timeline">
<?php endif;
    $act = (string) ($en['action'] ?? '');
    $cls = str_contains($act, 'fail') || str_contains($act, 'block') || str_contains($act, 'reject') ? ' class="tl-fail"' : (in_array($act, ['login', 'logout'], true) ? ' class="tl-dim"' : '');
    $detail = trim(($en['target'] ?? '') . ' ' . ($en['detail'] ?? '')); ?>
    <li<?= $cls ?>>
      <span class="tl-meta"><?= e(alok_date($ts, 'H:i:s')) ?> · <span class="tl-who"><?= e($en['user'] ?? '') ?></span></span>
      <span class="tl-act"><?= e(str_replace('_', ' ', $act)) ?></span>
      <?php if ($detail !== ''): ?><span class="tl-detail"><?= e($detail) ?></span><?php endif; ?>
    </li>
<?php endforeach; if ($open) echo '</ol>'; ?>
</div>
<?php endif; ?>
