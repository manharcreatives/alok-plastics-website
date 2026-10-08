<?php defined('ALOK_ADMIN') || exit; ?>
<?php
/** @var list<array> $open @var list<array> $submitted */
$ago = static function (int $ts): string {
    $d = max(0, time() - $ts);
    if ($d < 60) return 'just now';
    if ($d < 3600) return (int) ($d / 60) . ' min ago';
    if ($d < 86400) return (int) ($d / 3600) . ' h ago';
    return (int) ($d / 86400) . ' d ago';
};
$units = static fn(array $c): int => array_sum(array_map(static fn($l) => (int) $l['qty'], $c['lines'] ?? []));
$availLabel = ['in-stock' => 'In stock', 'out-of-stock' => 'Out of stock', 'on-request' => 'On request'];
?>
<?= page_head('Live carts', [['Dashboard', u()], ['Live carts', null]], 'What visitors have in their cart right now. This page refreshes itself every few seconds.', '', ' <span class="meta">' . count($open) . ' open</span>') ?>

<?php if (!$open): ?>
  <div class="card empty-state">
    <span class="empty-ico"><?= icon('cart') ?></span>
    <p class="empty-title">No open carts</p>
    <p>Carts appear here the moment a visitor adds a product on the website.</p>
  </div>
<?php endif; ?>

<?php foreach ($open as $c):
    $stale = (int) $c['updated_at'] < time() - 86400;
    $known = ($c['name'] ?? '') !== '';
    $wa = ($c['phone'] ?? '') !== '' ? 'https://wa.me/' . $c['phone'] . '?text=' . rawurlencode('Hello ' . $c['name'] . ', this is Alok Plastics. We noticed items in your cart. Can we help you with a quote?') : '';
?>
<section class="card" aria-label="Cart of <?= e($known ? $c['name'] : 'a visitor') ?>">
  <div class="card-head">
    <h2 class="card-title"><?= $known ? e($c['name']) . ' <span class="meta">+' . e($c['phone']) . '</span>' : 'Visitor not signed in yet' ?></h2>
    <span class="card-sub"><?= (int) count($c['lines']) ?> <?= count($c['lines']) === 1 ? 'product' : 'products' ?> · <?= (int) $units($c) ?> units · updated <?= e($ago((int) $c['updated_at'])) ?><?= $stale ? ' · <span class="badge tone-muted">Abandoned</span>' : '' ?></span>
  </div>
  <div class="table-wrap">
  <table class="table">
    <thead><tr><th scope="col">Product</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col">Availability</th></tr></thead>
    <tbody>
    <?php foreach ($c['lines'] as $l): ?>
      <tr>
        <td><span class="cell-main"><?= e($l['name']) ?></span><?php if (($l['sku'] ?? '') !== ''): ?><span class="cell-sub"><?= e($l['sku']) ?></span><?php endif; ?></td>
        <td class="nowrap"><?= e(number_format((int) $l['qty'])) ?></td>
        <td class="nowrap"><?= $l['price'] !== null ? 'Rs. ' . e(number_format((float) $l['price'], 0)) : 'On request' ?></td>
        <td class="nowrap"><?= e($availLabel[$l['availability'] ?? 'on-request'] ?? 'On request') ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
  <p class="meta">Started <?= e(AlokShop::fmt((int) ($c['started_at'] ?? $c['created_at']), 'd M Y, H:i')) ?><?= $known ? '' : ' · the customer will appear here once they verify their mobile number' ?></p>
  <?php if ($wa !== ''): ?><p><a class="btn btn-wa" href="<?= e($wa) ?>" target="_blank" rel="noopener noreferrer"><?= icon('chat') ?>WhatsApp follow-up</a></p><?php endif; ?>
</section>
<?php endforeach; ?>

<?php if ($submitted): ?>
<section class="card" aria-labelledby="h-done">
  <div class="card-head"><h2 class="card-title" id="h-done">Recently turned into enquiries</h2></div>
  <div class="table-wrap"><table class="table">
    <thead><tr><th scope="col">Customer</th><th scope="col">Products</th><th scope="col">Enquiry</th></tr></thead>
    <tbody>
    <?php foreach ($submitted as $c): ?>
      <tr>
        <td><span class="cell-main"><?= e($c['name'] ?: 'Visitor') ?></span><span class="cell-sub"><?= ($c['phone'] ?? '') !== '' ? '+' . e($c['phone']) : '' ?></span></td>
        <td><?= (int) count($c['lines']) ?> · <?= (int) $units($c) ?> units</td>
        <td class="nowrap"><?= e($c['order_code'] ?? '') ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
</section>
<?php endif; ?>
