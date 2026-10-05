<?php defined('ALOK_ADMIN') || exit; ?>
<?php
$pageHref = static fn(int $p): string => u('orders', array_filter(['status' => $status, 'q' => $q, 'page' => $p > 1 ? $p : null], static fn($v) => $v !== null && $v !== ''));
?>
<?= page_head('Orders', [['Dashboard', u()], ['Orders', null]], 'Orders placed from the website cart by signed-in customers, newest first.', '', ' <span class="meta">' . (int) $total . ' ' . ($total === 1 ? 'result' : 'results') . '</span>') ?>

<form class="card flush" method="get" action="index.php" role="search" aria-label="Filter orders">
  <input type="hidden" name="r" value="orders">
  <div class="toolbar">
    <div class="field field-wide">
      <label for="q">Search</label>
      <div class="search-box"><?= icon('search') ?><input id="q" name="q" type="search" value="<?= e($q) ?>" placeholder="Order ID, name or mobile" maxlength="100"></div>
    </div>
    <div class="field field-sm">
      <label for="status">Status</label>
      <select id="status" name="status" data-autosubmit>
        <option value="">All (<?= (int) $all ?>)</option>
        <?php foreach (ALOK_ORDER_LABELS as $k => $l): ?><option value="<?= e($k) ?>"<?= $status === $k ? ' selected' : '' ?>><?= e($l) ?> (<?= (int) ($counts[$k] ?? 0) ?>)</option><?php endforeach; ?>
      </select>
    </div>
    <div class="filter-actions">
      <button class="btn btn-primary" type="submit">Apply filters</button>
      <?php if ($status !== '' || $q !== ''): ?><a class="btn btn-quiet" href="<?= e(u('orders')) ?>">Clear all</a><?php endif; ?>
    </div>
  </div>
</form>

<?php if (!$rows): ?>
  <div class="card empty-state">
    <span class="empty-ico"><?= icon('box') ?></span>
    <p class="empty-title"><?= $all ? 'No orders match these filters' : 'No orders yet' ?></p>
    <p><?= $all ? 'Try removing a filter or searching for something broader.' : 'Orders appear here as soon as a customer places one from the cart.' ?></p>
  </div>
<?php else: ?>
<div class="card flush"><div class="table-wrap">
<table class="table stack">
  <thead><tr>
    <th scope="col">Placed</th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Items</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Open</span></th>
  </tr></thead>
  <tbody>
  <?php foreach ($rows as $o): $first = $o['items'][0]['name'] ?? ''; $more = count($o['items']) - 1; ?>
    <tr>
      <td data-label="Placed" class="nowrap"><?= e(AlokShop::fmt((int) $o['created_at'], 'd M, H:i')) ?></td>
      <td data-label="Order" class="nowrap"><span class="cell-main"><?= e($o['code']) ?></span></td>
      <td data-label="Customer"><span><span class="cell-main"><?= e($o['name']) ?></span><span class="cell-sub">+<?= e($o['phone']) ?></span></span></td>
      <td data-label="Items"><?= e(mb_strimwidth($first, 0, 48, '…')) ?><?= $more > 0 ? ' <span class="meta">+' . (int) $more . ' more</span>' : '' ?></td>
      <td data-label="Status"><?= shop_badge($o['status'], ALOK_ORDER_LABELS, ALOK_ORDER_TONES) ?></td>
      <td class="cell-go"><a class="btn btn-secondary btn-sm" href="<?= e(u('order', ['id' => $o['id']])) ?>">Open<span class="sr-only"> order <?= e($o['code']) ?></span></a></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
</div></div>
<?php require __DIR__ . '/_pager.php'; endif; ?>
