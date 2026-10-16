<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var list<array<string,mixed>> $entries @var string $q @var string $fAction @var string $fUser @var string $fFrom @var string $fTo @var list<string> $actionTypes @var list<string> $userNames @var bool $hasFilter */ ?>
<?= page_head('Activity log', [['Dashboard', u()], ['Activity log', null]], 'Sign-ins and changes made in this panel, newest first. Network addresses are stored only as an anonymous code.') ?>

<form class="audit-filter" method="get" action="<?= e(u('audit')) ?>">
  <div class="af-row">
    <div class="af-field">
      <label for="af-q">Search</label>
      <input id="af-q" type="search" name="q" value="<?= e($q) ?>" placeholder="Action, user, detail…" maxlength="80">
    </div>
    <div class="af-field">
      <label for="af-action">Action type</label>
      <select id="af-action" name="action">
        <option value="">All actions</option>
        <?php foreach ($actionTypes as $at): ?><option value="<?= e($at) ?>"<?= $fAction === $at ? ' selected' : '' ?>><?= e(str_replace('_', ' ', $at)) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="af-field">
      <label for="af-user">User</label>
      <select id="af-user" name="user">
        <option value="">All users</option>
        <?php foreach ($userNames as $un): ?><option value="<?= e(strtolower($un)) ?>"<?= $fUser === strtolower($un) ? ' selected' : '' ?>><?= e($un) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="af-field">
      <label for="af-from">From</label>
      <input id="af-from" type="date" name="from" value="<?= e($fFrom) ?>">
    </div>
    <div class="af-field">
      <label for="af-to">To</label>
      <input id="af-to" type="date" name="to" value="<?= e($fTo) ?>">
    </div>
    <div class="af-btns">
      <button class="btn btn-secondary" type="submit">Filter</button>
      <?php if ($hasFilter): ?><a class="btn btn-quiet" href="<?= e(u('audit')) ?>">Clear</a><?php endif; ?>
    </div>
  </div>
</form>

<?php if ($hasFilter && !$entries): ?>
  <div class="card empty-state">
    <span class="empty-ico"><?= icon('clock') ?></span>
    <p class="empty-title">No matching entries</p>
    <p>Try different filters or <a href="<?= e(u('audit')) ?>">clear all filters</a>.</p>
  </div>
<?php elseif (!$entries): ?>
  <div class="card empty-state">
    <span class="empty-ico"><?= icon('clock') ?></span>
    <p class="empty-title">Nothing recorded yet</p>
    <p>Sign-ins, status changes, notes and exports will appear here.</p>
  </div>
<?php else: ?>
<?php if ($hasFilter): ?><p class="meta audit-count"><?= count($entries) ?> matching entr<?= count($entries) === 1 ? 'y' : 'ies' ?>.</p><?php else: ?><p class="meta audit-count">Showing the last <?= count($entries) ?> entries.</p><?php endif; ?>
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
      <span class="tl-act">
        <?php if ($hasFilter && $fAction === ''): ?>
          <a class="tl-filter-link" href="<?= e(u('audit', array_filter(['q' => $q, 'action' => $act, 'user' => $fUser, 'from' => $fFrom, 'to' => $fTo]))) ?>"><?= e(str_replace('_', ' ', $act)) ?></a>
        <?php else: ?>
          <?= e(str_replace('_', ' ', $act)) ?>
        <?php endif; ?>
      </span>
      <?php if ($detail !== ''): ?><span class="tl-detail"><?= e($detail) ?></span><?php endif; ?>
    </li>
<?php endforeach; if ($open) echo '</ol>'; ?>
</div>
<?php endif; ?>
