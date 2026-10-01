<?php defined('ALOK_ADMIN') || exit; ?>
<?php
/** @var array $f @var array $rows @var int $total @var int $pages @var list<string> $products */
$qs = static fn(array $o = []): string => 'index.php?r=enquiries' . (($s = alok_filter_qs($f, $o)) !== '' ? '&' . $s : '');
$sortLink = static function (string $key, string $label) use ($f, $qs): string {
    $next = $f['sort'] === $key && $f['dir'] === 'desc' ? 'asc' : 'desc';
    return '<a href="' . e($qs(['sort' => $key, 'dir' => $next, 'page' => 1])) . '">' . e($label)
        . ($f['sort'] === $key ? ($f['dir'] === 'asc' ? ' ↑' : ' ↓') : '') . '</a>';
};
$ariaSort = static fn(string $key): string => $f['sort'] === $key ? ($f['dir'] === 'asc' ? 'ascending' : 'descending') : 'none';
$active = array_filter([$f['q'], $f['status'], $f['buyer'], $f['product'], $f['from'], $f['to'], $f['view'] !== 'active' ? $f['view'] : '']);
$exportQs = alok_filter_qs($f, ['page' => 1]);
?>
<div class="row-between">
  <h1>Enquiries <span class="meta">(<?= (int) $total ?>)</span></h1>
  <a class="btn btn-secondary" href="<?= e('index.php?r=export' . ($exportQs !== '' ? '&' . $exportQs : '')) ?>">Download CSV</a>
</div>

<form class="filters card" method="get" action="index.php" role="search" aria-label="Filter enquiries">
  <input type="hidden" name="r" value="enquiries">
  <div class="field field-wide">
    <label for="q">Search</label>
    <input id="q" name="q" type="search" value="<?= e($f['q']) ?>" placeholder="Name, company, phone, city, product, note" maxlength="100">
  </div>
  <div class="field">
    <label for="status">Status</label>
    <select id="status" name="status">
      <option value="">All</option>
      <?php foreach (ALOK_STATUS_LABELS as $k => $l): ?><option value="<?= e($k) ?>"<?= $f['status'] === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field">
    <label for="buyer">Buyer type</label>
    <select id="buyer" name="buyer">
      <option value="">All</option>
      <?php foreach (ALOK_BUYER_TYPES as $k => $l): ?><option value="<?= e($k) ?>"<?= $f['buyer'] === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field">
    <label for="product">Product</label>
    <input id="product" name="product" type="text" list="product-list" value="<?= e($f['product']) ?>" maxlength="120" placeholder="Any">
    <datalist id="product-list"><?php foreach ($products as $p): ?><option value="<?= e($p) ?>"><?php endforeach; ?></datalist>
  </div>
  <div class="field">
    <label for="from">From</label>
    <input id="from" name="from" type="date" value="<?= e($f['from']) ?>">
  </div>
  <div class="field">
    <label for="to">To</label>
    <input id="to" name="to" type="date" value="<?= e($f['to']) ?>">
  </div>
  <div class="field">
    <label for="view">Show</label>
    <select id="view" name="view">
      <option value="active"<?= $f['view'] === 'active' ? ' selected' : '' ?>>Active</option>
      <option value="archived"<?= $f['view'] === 'archived' ? ' selected' : '' ?>>Archived</option>
      <option value="all"<?= $f['view'] === 'all' ? ' selected' : '' ?>>Everything</option>
    </select>
  </div>
  <div class="filter-actions">
    <button class="btn btn-primary" type="submit">Apply</button>
    <?php if ($active): ?><a class="btn btn-quiet" href="<?= e(u('enquiries')) ?>">Clear filters</a><?php endif; ?>
  </div>
</form>

<?php if (!$rows): ?>
  <p class="card empty"><?= $active ? 'No enquiries match these filters.' : 'No enquiries yet. Each valid website submission lands here as well as in your email.' ?></p>
<?php else: ?>
<div class="card flush">
<table class="table stack">
  <thead><tr>
    <th scope="col" aria-sort="<?= $ariaSort('date') ?>"><?= $sortLink('date', 'Received') ?></th>
    <th scope="col" aria-sort="<?= $ariaSort('name') ?>"><?= $sortLink('name', 'Name') ?></th>
    <th scope="col" aria-sort="<?= $ariaSort('company') ?>"><?= $sortLink('company', 'Company') ?></th>
    <th scope="col" aria-sort="<?= $ariaSort('product') ?>"><?= $sortLink('product', 'Product') ?></th>
    <th scope="col" aria-sort="<?= $ariaSort('status') ?>"><?= $sortLink('status', 'Status') ?></th>
    <th scope="col"><span class="sr-only">Open</span></th>
  </tr></thead>
  <tbody>
  <?php foreach ($rows as $r): ?>
    <tr class="<?= !$r['seen'] ? 'unread' : '' ?>">
      <td data-label="Received"><span><?= !$r['seen'] ? '<span class="dot" title="Unread"></span><span class="sr-only">Unread. </span>' : '' ?><?= e(alok_date($r['created_at'], 'd M, H:i')) ?></span></td>
      <td data-label="Name"><b><?= e($r['name']) ?></b><br><span class="meta"><?= e($r['phone']) ?></span></td>
      <td data-label="Company"><?= e($r['company']) ?><?php if ($r['city']): ?><br><span class="meta"><?= e($r['city']) ?></span><?php endif; ?></td>
      <td data-label="Product"><?= e(mb_strimwidth($r['product'] ?: '—', 0, 70, '…')) ?></td>
      <td data-label="Status"><?= status_badge($r['status']) ?><?php if ($r['archived']): ?> <span class="badge badge-archived">Archived</span><?php endif; ?></td>
      <td class="cell-go"><a class="btn btn-secondary btn-sm" href="<?= e(u('enquiry', ['id' => $r['id']])) ?>">Open<span class="sr-only"> enquiry <?= (int) $r['id'] ?> from <?= e($r['name']) ?></span></a></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
</div>
<?php if ($pages > 1): ?>
<nav class="pager" aria-label="Pages">
  <?php if ($f['page'] > 1): ?><a class="btn btn-secondary" href="<?= e($qs(['page' => $f['page'] - 1])) ?>" rel="prev">Previous</a><?php else: ?><span></span><?php endif; ?>
  <span class="meta">Page <?= (int) $f['page'] ?> of <?= (int) $pages ?></span>
  <?php if ($f['page'] < $pages): ?><a class="btn btn-secondary" href="<?= e($qs(['page' => $f['page'] + 1])) ?>" rel="next">Next</a><?php else: ?><span></span><?php endif; ?>
</nav>
<?php endif; endif; ?>
