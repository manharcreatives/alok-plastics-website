<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var list<array<string,mixed>> $entries */ ?>
<h1>Activity log</h1>
<p class="lead">Sign-ins and changes made in this panel, newest first (last 200). Network addresses are stored only as an anonymous code.</p>
<?php if (!$entries): ?>
  <p class="card empty">Nothing recorded yet.</p>
<?php else: ?>
<div class="card flush">
<table class="table stack">
  <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">What</th><th scope="col">Detail</th></tr></thead>
  <tbody>
  <?php foreach ($entries as $en): ?>
    <tr>
      <td data-label="When"><?= e(alok_date((int) ($en['ts'] ?? 0), 'd M Y, H:i:s')) ?></td>
      <td data-label="Who"><?= e($en['user'] ?? '') ?></td>
      <td data-label="What"><?= e(str_replace('_', ' ', (string) ($en['action'] ?? ''))) ?></td>
      <td data-label="Detail"><?= e(trim(($en['target'] ?? '') . ' ' . ($en['detail'] ?? ''))) ?></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
</div>
<?php endif; ?>
<p class="meta"><a href="<?= e(u('system')) ?>">System check</a></p>
