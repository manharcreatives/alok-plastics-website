<?php defined('ALOK_ADMIN') || exit; ?>
<?php
$pageHref = static fn(int $p): string => u('customers', array_filter(['q' => $q, 'page' => $p > 1 ? $p : null], static fn($v) => $v !== null && $v !== ''));
?>
<?= page_head('Customers', [['Dashboard', u()], ['Customers', null]], 'People who verified their mobile number to place an order.', '', ' <span class="meta">' . (int) $total . ' ' . ($total === 1 ? 'result' : 'results') . '</span>') ?>

<form class="card flush" method="get" action="index.php" role="search" aria-label="Search customers">
  <input type="hidden" name="r" value="customers">
  <div class="toolbar">
    <div class="field field-wide">
      <label for="q">Search</label>
      <div class="search-box"><?= icon('search') ?><input id="q" name="q" type="search" value="<?= e($q) ?>" placeholder="Name or mobile" maxlength="100"></div>
    </div>
    <div class="filter-actions">
      <button class="btn btn-primary" type="submit">Search</button>
      <?php if ($q !== ''): ?><a class="btn btn-quiet" href="<?= e(u('customers')) ?>">Clear</a><?php endif; ?>
    </div>
  </div>
</form>

<?php if (!$rows): ?>
  <div class="card empty-state">
    <span class="empty-ico"><?= icon('inbox') ?></span>
    <p class="empty-title"><?= $q !== '' ? 'No customers match your search' : 'No customers yet' ?></p>
    <p>Customers appear here after they verify their mobile number in the cart.</p>
  </div>
<?php else: ?>
<div class="card flush"><div class="table-wrap">
<table class="table stack">
  <thead><tr><th scope="col">Name</th><th scope="col">Mobile</th><th scope="col">Orders</th><th scope="col">First seen</th><th scope="col">Last sign-in</th><th scope="col"><span class="sr-only">Orders</span></th></tr></thead>
  <tbody>
  <?php foreach ($rows as $c): ?>
    <tr>
      <td data-label="Name"><span class="cell-main"><?= e($c['name']) ?></span></td>
      <td data-label="Mobile" class="nowrap">+<?= e($c['phone']) ?></td>
      <td data-label="Orders"><?= (int) $c['orders'] ?></td>
      <td data-label="First seen" class="nowrap"><?= e(AlokShop::fmt((int) $c['created_at'], 'd M Y')) ?></td>
      <td data-label="Last sign-in" class="nowrap"><?= e(AlokShop::fmt((int) ($c['last_login'] ?? $c['created_at']), 'd M Y, H:i')) ?></td>
      <td class="cell-go"><?php if ($c['orders'] > 0): ?><a class="btn btn-secondary btn-sm" href="<?= e(u('orders', ['q' => $c['phone']])) ?>">View orders</a><?php endif; ?></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
</div></div>
<?php require __DIR__ . '/_pager.php'; endif; ?>
