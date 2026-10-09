<?php defined('ALOK_ADMIN') || exit; ?>
<?php
$pageHref = static fn(int $p): string => u('applications', array_filter(['status' => $status, 'q' => $q, 'page' => $p > 1 ? $p : null], static fn($v) => $v !== null && $v !== ''));
?>
<?= page_head('Applications', [['Dashboard', u()], ['Applications', null]], 'Career applications sent from the website, newest first.', '', ' <span class="meta">' . (int) $total . ' ' . ($total === 1 ? 'result' : 'results') . '</span>') ?>

<form class="card flush" method="get" action="index.php" role="search" aria-label="Filter applications">
  <input type="hidden" name="r" value="applications">
  <div class="toolbar">
    <div class="field field-wide">
      <label for="q">Search</label>
      <div class="search-box"><?= icon('search') ?><input id="q" name="q" type="search" value="<?= e($q) ?>" placeholder="Name, phone, email or position" maxlength="100"></div>
    </div>
    <div class="field field-sm">
      <label for="status">Status</label>
      <select id="status" name="status" data-autosubmit>
        <option value="">All</option>
        <?php foreach (ALOK_APPLICATION_LABELS as $k => $l): ?><option value="<?= e($k) ?>"<?= $status === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="filter-actions">
      <button class="btn btn-primary" type="submit">Apply filters</button>
      <?php if ($status !== '' || $q !== ''): ?><a class="btn btn-quiet" href="<?= e(u('applications')) ?>">Clear all</a><?php endif; ?>
    </div>
  </div>
</form>

<?php if (!$rows): ?>
  <div class="card empty-state">
    <span class="empty-ico"><?= icon('briefcase') ?></span>
    <p class="empty-title"><?= $all ? 'No applications match these filters' : 'No applications yet' ?></p>
    <p><?= $all ? 'Try removing a filter or searching for something broader.' : 'Applications appear here as well as in your email and Google Sheet.' ?></p>
  </div>
<?php else: ?>
<div class="card flush"><div class="table-wrap">
<table class="table stack">
  <thead><tr>
    <th scope="col">Received</th><th scope="col">Applicant</th><th scope="col">Position</th><th scope="col">Resume / LinkedIn</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Open</span></th>
  </tr></thead>
  <tbody>
  <?php foreach ($rows as $a): ?>
    <tr>
      <td data-label="Received" class="nowrap"><?= e(AlokShop::fmt((int) $a['created_at'], 'd M, H:i')) ?></td>
      <td data-label="Applicant"><span><span class="cell-main"><?= e($a['name']) ?></span><span class="cell-sub"><?= e($a['phone']) ?></span></span></td>
      <td data-label="Position"><?= e($a['position']) ?></td>
      <td data-label="Resume / LinkedIn"><?= $a['resume_file'] !== '' ? 'File' : ($a['resume_link'] !== '' ? 'LinkedIn' : '—') ?></td>
      <td data-label="Status"><?= shop_badge($a['status'], ALOK_APPLICATION_LABELS, ALOK_APPLICATION_TONES) ?></td>
      <td class="cell-go"><a class="btn btn-secondary btn-sm" href="<?= e(u('application', ['id' => $a['id']])) ?>">Open<span class="sr-only"> application from <?= e($a['name']) ?></span></a></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
</div></div>
<?php require __DIR__ . '/_pager.php'; endif; ?>
