<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var list<array<string,mixed>> $rows @var int $total @var array<string,string> $f @var array<string,string> $groups @var int $hiddenCount
         @var array<string,int> $attnCount @var array<string,array<string,string>> $bulkIn @var array<string,array<string,string>> $bulkErr */
$keep = array_filter($f, static fn($v) => $v !== '');
$filtered = array_diff_key($keep, ['sort' => 1]) !== [];
$chip = static function (string $label, string $val, int $n) use ($f, $keep): string {
    $on = $f['attn'] === $val;
    $p = $keep;
    if ($val === '') { unset($p['attn']); } else { $p['attn'] = $val; }
    return '<a class="chip' . ($on ? ' is-on' : '') . '" href="' . e(u('products', $p)) . '"' . ($on ? ' aria-current="true"' : '') . '>' . e($label) . ($val !== '' ? ' (' . $n . ')' : '') . '</a>';
};
$sel = static function (string $name, array $opts, string $cur, string $any = ''): string {
    $h = '<select id="' . e($name) . '" name="' . e($name) . '">' . ($any !== '' ? '<option value="">' . e($any) . '</option>' : '');
    foreach ($opts as $v => $l) $h .= '<option value="' . e($v) . '"' . ((string) $cur === (string) $v ? ' selected' : '') . '>' . e($l) . '</option>';
    return $h . '</select>';
};
?>
<link rel="stylesheet" href="<?= e(asset('products.css')) ?>">
<div class="row-between">
  <h1>Products</h1>
  <p class="meta"><?= (int) $total ?> products · <?= (int) $hiddenCount ?> hidden from lists</p>
  <a class="btn btn-primary" href="<?= e(u('product', ['new' => 1])) ?>"><?= icon('plus') ?>Add product</a>
</div>
<p class="lead">Every product on the website. Add new products, or open one to change its group, name, description, price, availability, fitment, SEO tags and photos. Empty fields use the website’s built-in text; with no price, customers see “Price on request”.</p>

<form class="card filters pfilters" method="get" action="index.php">
  <input type="hidden" name="r" value="products">
  <div class="field field-wide">
    <label for="q">Search</label>
    <input id="q" name="q" type="search" maxlength="60" value="<?= e($f['q']) ?>" placeholder="Name, SKU, group, keyword or brand">
  </div>
  <div class="field">
    <label for="group">Group</label>
    <?= $sel('group', $groups, $f['group'], 'All groups') ?>
  </div>
  <div class="field">
    <label for="status">Status</label>
    <?= $sel('status', AlokProducts::STATUS, $f['status'], 'Any status') ?>
  </div>
  <div class="field">
    <label for="avail">Availability</label>
    <?= $sel('avail', AlokProducts::AVAILABILITY, $f['avail'], 'Any availability') ?>
  </div>
  <div class="field">
    <label for="vis">Hidden from lists</label>
    <?= $sel('vis', ['hidden' => 'Hidden only', 'shown' => 'Shown only'], $f['vis'], 'Hidden and shown') ?>
  </div>
  <div class="field">
    <label for="edited">Edited</label>
    <?= $sel('edited', ['yes' => 'Edited only', 'no' => 'Not edited'], $f['edited'], 'Edited or not') ?>
  </div>
  <div class="field">
    <label for="sort">Sort by</label>
    <?= $sel('sort', ['recent' => 'Recently edited', 'price-asc' => 'Price, low to high', 'price-desc' => 'Price, high to low'], $f['sort'], 'Name (A to Z)') ?>
  </div>
  <?php if ($f['attn'] !== ''): ?><input type="hidden" name="attn" value="<?= e($f['attn']) ?>"><?php endif; ?>
  <div class="filter-actions"><button class="btn btn-primary" type="submit">Filter</button><?php if ($filtered): ?><a class="btn btn-quiet" href="<?= e(u('products')) ?>">Clear</a><?php endif; ?></div>
</form>

<p class="pchips" role="group" aria-label="Needs attention">
  <?= $chip('All products', '', 0) ?>
  <?= $chip('Needs attention', 'any', $attnCount['any']) ?>
  <?= $chip('No image', 'img', $attnCount['img']) ?>
  <?= $chip('No price', 'price', $attnCount['price']) ?>
  <?= $chip('No description', 'desc', $attnCount['desc']) ?>
</p>

<?php if ($bulkErr): ?>
<div class="flash flash-err" role="alert"><b>Please fix <?= count($bulkErr) ?> product(s) below. Nothing was saved.</b></div>
<?php endif; ?>

<?php if (!$rows): ?>
  <p class="card empty">No product matches those filters.</p>
<?php else: ?>
<form method="post" action="<?= e(u('products')) ?>" class="pbulk" novalidate>
  <?= csrf_field() ?>
  <?php foreach ($keep as $k => $v): ?><input type="hidden" name="<?= e($k) ?>" value="<?= e($v) ?>"><?php endforeach; ?>
  <button class="sr-only" type="submit" name="do" value="bulk" tabindex="-1" aria-hidden="true">Save quick edits</button>
  <p class="meta">Quick edit: change price, availability or status on any row below, then use “Save quick edits”. Empty price = Price on request. Only products you changed are updated.</p>
  <ul class="plist">
    <?php foreach ($rows as $r): $c = $r['c']; $slug = $c['slug']; $e = $r['eff']; $thumb = $r['saved']['images'][0]['url'] ?? ($c['image']['src'] ?? '');
      $in = $bulkIn[$slug] ?? ['price' => $e['price'] === null ? '' : (string) $e['price'], 'availability' => $e['availability'], 'status' => $e['status']];
      $er = $bulkErr[$slug] ?? []; $sid = e(preg_replace('/[^a-z0-9-]/', '', $slug)); ?>
    <li class="card pcard<?= $r['hidden'] || $e['status'] !== 'active' ? ' is-hidden' : '' ?>">
      <a class="pthumb" href="<?= e(u('product', ['slug' => $slug])) ?>" tabindex="-1" aria-hidden="true">
        <?php if ($thumb !== ''): ?><img src="<?= e($thumb) ?>" alt="" width="72" height="72" loading="lazy"><?php else: ?><span class="pthumb-empty">No image</span><?php endif; ?>
      </a>
      <div class="pmain">
        <h2 class="ptitle"><a href="<?= e(u('product', ['slug' => $slug])) ?>"><?= e($r['name']) ?></a></h2>
        <p class="meta"><?= e($c['group']['name'] ?? 'No group yet') ?><?= ($r['saved']['material'] ?? $c['material']) !== '' ? ' · ' . e($r['saved']['material'] ?? $c['material']) : '' ?><?= ($r['saved']['sku'] ?? $c['sku']) !== '' ? ' · ' . e($r['saved']['sku'] ?? $c['sku']) : '' ?></p>
        <p class="pbadges">
          <?php if ($c['published']): ?>
            <span class="badge badge-won">On website</span>
            <?php if ($r['hidden']): ?><span class="badge badge-lost">Hidden from lists</span><?php endif; ?>
            <?php if (!empty($c['custom'])): ?><span class="badge tone-brand">Added in admin</span><?php endif; ?>
          <?php else: ?><span class="badge badge-quoted">Not on website yet</span><?php endif; ?>
          <?php if ($e['status'] !== 'active'): ?><span class="badge tone-warn"><?= e(AlokProducts::STATUS[$e['status']]) ?></span><?php endif; ?>
          <span class="badge <?= $e['availability'] === 'in-stock' ? 'tone-ok' : ($e['availability'] === 'out-of-stock' ? 'tone-warn' : 'tone-info') ?>"><?= e(AlokProducts::AVAILABILITY[$e['availability']]) ?><?= $e['stock'] !== null ? ' · ' . (int) $e['stock'] : '' ?></span>
          <?php if ($e['featured']): ?><span class="badge tone-brand">Featured</span><?php endif; ?>
          <?php if ($r['edited']): ?><span class="badge badge-new">Edited</span><?php endif; ?>
          <span class="pprice"><?= $e['price'] === null ? '<span class="muted">Price on request</span>' : e(AlokProducts::formatPrice($e['price'])) ?></span>
        </p>
        <?php if ($r['attn']['img'] || $r['attn']['price'] || $r['attn']['desc']): ?>
        <p class="meta pattn">Needs: <?= e(implode(', ', array_filter([$r['attn']['img'] ? 'image' : '', $r['attn']['price'] ? 'price' : '', $r['attn']['desc'] ? 'description' : '']))) ?></p>
        <?php endif; ?>
        <div class="pquick">
          <div class="field">
            <label for="p-<?= $sid ?>">Price (₹)</label>
            <input id="p-<?= $sid ?>" type="text" inputmode="decimal" name="pr[<?= e($slug) ?>]" maxlength="14" value="<?= e($in['price']) ?>" placeholder="On request"<?= isset($er['price']) ? ' aria-invalid="true"' : '' ?>>
          </div>
          <div class="field">
            <label for="a-<?= $sid ?>">Availability</label>
            <select id="a-<?= $sid ?>" name="av[<?= e($slug) ?>]">
              <?php foreach (AlokProducts::AVAILABILITY as $v => $l): ?><option value="<?= e($v) ?>"<?= $in['availability'] === $v ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
            </select>
          </div>
          <div class="field">
            <label for="s-<?= $sid ?>">Status</label>
            <select id="s-<?= $sid ?>" name="st[<?= e($slug) ?>]">
              <?php foreach (AlokProducts::STATUS as $v => $l): ?><option value="<?= e($v) ?>"<?= $in['status'] === $v ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
            </select>
          </div>
        </div>
        <?php foreach ($er as $m): ?><p class="field-error"><?= e($m) ?></p><?php endforeach; ?>
      </div>
      <div class="pact">
        <a class="btn btn-secondary btn-sm" href="<?= e(u('product', ['slug' => $slug])) ?>">Edit</a>
        <?php if ($c['published']): ?>
        <button class="btn btn-quiet btn-sm" type="submit" name="toggle" value="<?= e($slug) ?>" formnovalidate>
          <?= $r['hidden'] ? 'Show' : 'Hide' ?><span class="sr-only"> <?= e($r['name']) ?></span></button>
        <?php endif; ?>
      </div>
    </li>
    <?php endforeach; ?>
  </ul>
  <div class="sticky-actions">
    <button class="btn btn-primary" type="submit" name="do" value="bulk">Save quick edits</button>
    <span class="meta"><?= count($rows) ?> product(s) shown</span>
  </div>
</form>
<?php endif; ?>
<p class="meta">Hiding removes a product from the website’s lists and menus; its own page stays reachable. Status “Inactive” or “Archived” also removes it from lists, search and menus, and the page shows “no longer available”. Products you add here appear on the website straight away in their group; built-in products can be moved between groups or removed from the website from their edit screen.</p>
