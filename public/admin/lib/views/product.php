<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var array<string,mixed> $c @var array<string,string> $def @var array<string,string> $form @var list<array<string,string>> $images
         @var bool $isNew @var bool $isCustom @var array<string,array<string,string>> $groups @var string $gform @var list<string> $mform
         @var array<string,string> $errors @var bool $gd @var bool $isHidden @var string $self @var bool $edited @var string $updatedAt @var array<string,string> $cform @var array<string,mixed> $cdef */
/** One text field with its default shown, a counter and a reset control. */
$field = static function (string $k, string $hint = '') use ($form, $def, $errors): string {
    [$label, $m, $multi] = AlokProducts::FIELDS[$k];
    $d = (string) ($def[$k] ?? '');
    $ph = $d !== '' ? $d : 'Not set';
    $h = '<div class="field"><label for="f-' . e($k) . '">' . e($label) . '</label>';
    $attrs = ' id="f-' . e($k) . '" name="' . e($k) . '" maxlength="' . ($m + 40) . '" data-max="' . $m . '" data-default="' . e($d) . '" placeholder="' . e($ph) . '"' . aria_inv($errors, $k);
    $h .= $multi
        ? '<textarea' . $attrs . ' rows="' . ($m > 500 ? 8 : 3) . '">' . e($form[$k] ?? '') . '</textarea>'
        : '<input type="text"' . $attrs . ' value="' . e($form[$k] ?? '') . '">';
    $h .= '<p class="fmeta"><span class="meta">' . ($d !== '' ? 'Default: ' . e(mb_strlen($d) > 90 ? mb_substr($d, 0, 90) . '…' : $d) : 'No default. Leave empty to show nothing.') . '</span>'
        . '<span class="meta"><span class="count-out" data-for="f-' . e($k) . '">' . mb_strlen($form[$k] ?? '') . '</span>/' . $m . '</span>'
        . '<button class="btn btn-quiet btn-sm js-only" type="button" data-reset="f-' . e($k) . '" hidden>Reset to default</button></p>';
    if ($hint !== '') $h .= '<p class="meta">' . e($hint) . '</p>';
    return $h . field_err($errors, $k) . '</div>';
};
$host = (string) ($_SERVER['HTTP_HOST'] ?? 'alokplastics.com');
?>
<link rel="stylesheet" href="<?= e(asset('products.css')) ?>">
<script src="<?= e(asset('products.js')) ?>" defer></script>
<p class="crumb"><a href="<?= e(u('products')) ?>">← Products</a></p>
<div class="row-between">
  <div>
    <h1><?= e($isNew ? 'Add product' : ($form['name'] !== '' ? $form['name'] : $c['name'])) ?></h1>
    <p class="pbadges">
      <?php if ($isNew): ?><span class="badge badge-new">New</span>
      <?php elseif ($c['published']): ?><span class="badge badge-won">On website</span><?php if ($isHidden): ?> <span class="badge badge-lost">Hidden from lists</span><?php endif; ?>
      <?php else: ?><span class="badge badge-quoted">Not on website yet</span><?php endif; ?>
      <?php if ($edited && !$isCustom): ?><span class="badge badge-new">Edited</span><?php endif; ?>
      <?php if ($isCustom && !$isNew): ?><span class="badge tone-brand">Added in admin</span><?php endif; ?>
      <?php if ($cform['status'] !== 'active'): ?><span class="badge badge-quoted"><?= e(AlokProducts::STATUS[$cform['status']] ?? '') ?></span><?php endif; ?>
      <span class="meta"><?= e($c['group']['name'] ?? 'No group yet') ?></span>
    </p>
  </div>
  <?php if (!$isNew && $c['published'] && $c['path']): ?><a class="btn btn-secondary" href="<?= e($c['path']) ?>" target="_blank" rel="noopener">View on website</a><?php endif; ?>
</div>
<?php if (!$c['published']): ?>
<div class="flash flash-info" role="note"><b>This product is not on the website yet.</b> You can still prepare its details and photos here; they are stored and will be used once your developer publishes it.</div>
<?php endif; ?>
<?php if ($errors): ?>
<div class="flash flash-err" role="alert"><b>Please fix <?= count($errors) ?> thing(s) below. Nothing was saved.</b><?php if (isset($errors['_save'])): ?><br><?= e($errors['_save']) ?><?php endif; ?></div>
<?php endif; ?>

<form method="post" action="<?= e($self) ?>" enctype="multipart/form-data" novalidate class="pedit">
  <?= csrf_field() ?>
  <input type="hidden" name="do" value="save">

  <fieldset>
    <legend>Basics</legend>
    <?= $field('name') ?>
    <?= $field('summary') ?>
    <?= $field('description', 'Plain text. A blank line starts a new paragraph.') ?>
  </fieldset>

  <fieldset>
    <legend>Group and fitment</legend>
    <div class="field">
      <label for="f-group">Product group<?= $isCustom ? ' *' : '' ?></label>
      <select id="f-group" name="group"<?= aria_inv($errors, 'group') ?>>
        <?php if ($gform === ''): ?><option value="" selected disabled>Choose a group</option><?php endif; ?>
        <?php foreach ($groups as $gid => $g): ?><option value="<?= e($gid) ?>"<?= $gform === (string) $gid ? ' selected' : '' ?>><?= e($g['name']) ?></option><?php endforeach; ?>
      </select>
      <p class="meta">The group decides where the product appears on the website. Moving a built-in product changes its group in lists, search and filters.</p>
      <?= field_err($errors, 'group') ?>
    </div>
    <fieldset class="check-group">
      <legend>Machines it fits</legend>
      <?php foreach (AlokProducts::MACHINES as $mid => $mlabel): ?>
      <label class="check"><input type="checkbox" name="machines[]" value="<?= e($mid) ?>"<?= in_array($mid, $mform, true) ? ' checked' : '' ?>> <?= e($mlabel) ?></label>
      <?php endforeach; ?>
    </fieldset>
    <?= $field('fitment', 'For example: Voltas 2 tap water cooler, 4 ft display counter. Shown on the product page.') ?>
  </fieldset>

  <fieldset>
    <legend>Specifications</legend>
    <div class="grid2">
      <?= $field('material') ?>
      <?= $field('sku') ?>
      <?= $field('hsn') ?>
      <?= $field('moq') ?>
    </div>
    <?= $field('packing') ?>
    <?php if ($c['machines'] || $c['variants']): ?>
    <p class="meta">Also on the website, changed by your developer: <?= $c['machines'] ? 'used in ' . e(implode(', ', $c['machines'])) : '' ?><?= $c['machines'] && $c['variants'] ? '; ' : '' ?><?= $c['variants'] ? count($c['variants']) . ' size/variant(s)' : '' ?>.</p>
    <?php endif; ?>
  </fieldset>

  <fieldset>
    <legend>Price and availability</legend>
    <p class="meta">Optional. Leave price empty and customers see <b>Price on request</b>. Customers never see a price, stock or “in stock” you have not entered here. Orders are requests only: Alok Plastics confirms price, stock, delivery and payment on WhatsApp.</p>
    <div class="grid2">
      <div class="field">
        <label for="f-price">Price (₹, per piece)</label>
        <input type="text" inputmode="decimal" id="f-price" name="price" maxlength="14" value="<?= e($cform['price']) ?>" data-default="<?= e($cdef['price'] ?? '') ?>" placeholder="e.g. 125 or 125.50"<?= aria_inv($errors, 'price') ?>>
        <p class="meta"><?= $cdef['price'] === null ? 'Default: Not set — customers see Price on request.' : 'Default: ' . e(AlokProducts::formatPrice($cdef['price'])) ?> Allowed: 0 to 9,999,999.</p>
        <?= field_err($errors, 'price') ?>
      </div>
      <div class="field">
        <label for="f-availability">Availability</label>
        <select id="f-availability" name="availability"<?= aria_inv($errors, 'availability') ?>>
          <?php foreach (AlokProducts::AVAILABILITY as $v => $l): ?><option value="<?= e($v) ?>"<?= $cform['availability'] === $v ? ' selected' : '' ?>><?= e($l) ?><?= $v === 'on-request' ? ' (default)' : '' ?></option><?php endforeach; ?>
        </select>
        <p class="meta">Default: <?= e(AlokProducts::AVAILABILITY[$cdef['availability']] ?? 'On request') ?>. “On request” means customers are told to ask on WhatsApp.</p>
        <?= field_err($errors, 'availability') ?>
      </div>
      <div class="field">
        <label for="f-stock">Stock (pieces)</label>
        <input type="text" inputmode="numeric" id="f-stock" name="stock" maxlength="8" value="<?= e($cform['stock']) ?>" placeholder="Not set"<?= aria_inv($errors, 'stock') ?>>
        <p class="meta"><?= $cdef['stock'] === null ? 'Default: Not set — no stock figure is shown.' : 'Default: ' . (int) $cdef['stock'] ?> Optional whole number, 0 to 100,000.</p>
        <?= field_err($errors, 'stock') ?>
      </div>
      <div class="field">
        <label for="f-brand">Brand</label>
        <input type="text" id="f-brand" name="brand" maxlength="<?= AlokProducts::BRAND_MAX + 20 ?>" value="<?= e($cform['brand']) ?>" placeholder="<?= e($cdef['brand'] !== '' ? $cdef['brand'] : 'Not set') ?>"<?= aria_inv($errors, 'brand') ?>>
        <p class="meta">Optional, up to <?= AlokProducts::BRAND_MAX ?> characters.</p>
        <?= field_err($errors, 'brand') ?>
      </div>
    </div>
  </fieldset>

  <fieldset>
    <legend>Search keywords and status</legend>
    <div class="field">
      <label for="f-keywords">Keywords / tags</label>
      <textarea id="f-keywords" name="keywords" rows="3" maxlength="1200" placeholder="e.g. sliding bush, freezer, nylon"<?= aria_inv($errors, 'keywords') ?>><?= e($cform['keywords']) ?></textarea>
      <p class="meta">Words customers might type to find this product. Separate with commas or new lines. Up to <?= AlokProducts::KEYWORDS_MAX ?> keywords, each up to <?= AlokProducts::KEYWORD_LEN ?> characters; saved in lowercase, duplicates removed.<?= $cdef['keywords'] ? ' Default: ' . e(implode(', ', $cdef['keywords'])) . '.' : ' Default: none.' ?></p>
      <?= field_err($errors, 'keywords') ?>
    </div>
    <label class="check"><input type="checkbox" name="featured" value="1"<?= $cform['featured'] === '1' ? ' checked' : '' ?>> Featured product (shown first where the website highlights products)</label>
    <div class="field">
      <label for="f-status">Status</label>
      <select id="f-status" name="status"<?= aria_inv($errors, 'status') ?>>
        <?php foreach (AlokProducts::STATUS as $v => $l): ?><option value="<?= e($v) ?>"<?= $cform['status'] === $v ? ' selected' : '' ?>><?= e($l) ?><?= $v === 'active' ? ' (default)' : '' ?></option><?php endforeach; ?>
      </select>
      <?= field_err($errors, 'status') ?>
      <ul class="meta status-help">
        <li><b>Active:</b> shown on the website in lists, search and menus.</li>
        <li><b>Inactive:</b> removed from website lists, search and menus; the product page shows “no longer available”. Use for products you may bring back.</li>
        <li><b>Archived:</b> same as Inactive on the website; use it to keep an old product on file out of your way.</li>
      </ul>
    </div>
  </fieldset>

  <fieldset>
    <legend>SEO (how it looks on Google)</legend>
    <?= $field('seoTitle', 'Aim for under 60 characters. Leave empty to use the product name.') ?>
    <?= $field('seoDescription', 'Aim for 120 to 160 characters. Leave empty to use the short summary.') ?>
    <div class="seo-preview" id="seo-preview" aria-label="Google result preview" data-name="<?= e($c['name']) ?>" data-summary="<?= e($def['summary']) ?>">
      <p class="sp-url"><?= e($host) ?> › products<?= $c['group'] ? ' › ' . e($c['group']['slug']) : '' ?> › <?= e($c['slug']) ?></p>
      <p class="sp-title" id="sp-title"><?= e($form['seoTitle'] !== '' ? $form['seoTitle'] : ($form['name'] !== '' ? $form['name'] : $c['name'])) ?></p>
      <p class="sp-desc" id="sp-desc"><?= e($form['seoDescription'] !== '' ? $form['seoDescription'] : ($form['summary'] !== '' ? $form['summary'] : $def['summary'])) ?></p>
    </div>
    <p class="meta">A rough preview; Google may show something different.</p>
  </fieldset>

  <fieldset>
    <legend>Images</legend>
    <?php if (!$gd): ?>
    <div class="flash flash-warn" role="note">Image upload is switched off because the PHP “GD” extension is not enabled on this server. Ask your host to enable it. Text editing still works.</div>
    <?php endif; ?>
    <?php if (isset($errors['images'])): ?><p class="field-error"><?= e($errors['images']) ?></p><?php endif; ?>
    <?php if ($c['image']): ?>
    <p class="meta"><?= $images ? 'Your photos replace the built-in image below.' : 'Built-in image shown on the website until you add your own:' ?></p>
    <p class="built-in"><img src="<?= e($c['image']['src']) ?>" alt="<?= e($c['image']['alt']) ?>" width="96" height="96" loading="lazy"></p>
    <?php endif; ?>
    <?php if ($images): ?>
    <ol class="imglist" id="imglist">
      <?php foreach ($images as $i => $im): $id = $im['id']; ?>
      <li class="imgrow" data-id="<?= e($id) ?>">
        <img src="<?= e($im['url']) ?>" alt="" width="96" height="96" loading="lazy">
        <div class="imgfields">
          <p class="meta"><?= $i === 0 ? '<b>Main image</b> (shown first)' : 'Image ' . ($i + 1) ?></p>
          <label for="alt-<?= e($id) ?>">Description (alt text)</label>
          <input id="alt-<?= e($id) ?>" type="text" name="img_alt[<?= e($id) ?>]" maxlength="<?= AlokProducts::ALT_MAX + 40 ?>" value="<?= e($im['alt']) ?>"<?= aria_inv($errors, 'img_alt_' . $id) ?>>
          <?= field_err($errors, 'img_alt_' . $id) ?>
          <div class="imgctl">
            <label class="posl" for="pos-<?= e($id) ?>">Position</label>
            <input id="pos-<?= e($id) ?>" class="pos" type="number" min="1" max="<?= AlokProducts::MAX_IMAGES ?>" name="img_pos[<?= e($id) ?>]" value="<?= $i + 1 ?>">
            <button class="btn btn-quiet btn-sm js-only" type="button" data-move="up" hidden>Move up</button>
            <button class="btn btn-quiet btn-sm js-only" type="button" data-move="down" hidden>Move down</button>
            <label class="check"><input type="checkbox" name="img_del[]" value="<?= e($id) ?>"> Delete this image</label>
          </div>
        </div>
      </li>
      <?php endforeach; ?>
    </ol>
    <p class="meta">The image in position 1 is the main one. Change the numbers (or use the buttons) and save to reorder.</p>
    <?php endif; ?>
    <?php if ($gd && count($images) < AlokProducts::MAX_IMAGES): ?>
    <div class="field">
      <label for="new_images">Add images</label>
      <input id="new_images" type="file" name="new_images[]" accept="image/jpeg,image/png,image/webp" multiple>
      <p class="meta">JPEG, PNG or WebP, up to 8 MB each, <?= AlokProducts::MAX_IMAGES ?> images per product. Large photos are resized to 2400 pixels and cleaned of camera data. Pick a few at a time.</p>
    </div>
    <div class="field">
      <label for="new_alt">Description for the new images</label>
      <input id="new_alt" type="text" name="new_alt" maxlength="<?= AlokProducts::ALT_MAX + 40 ?>" placeholder="<?= e($c['name']) ?>"<?= aria_inv($errors, 'new_alt') ?>>
      <?= field_err($errors, 'new_alt') ?>
    </div>
    <?php elseif ($gd): ?><p class="meta">This product already has <?= AlokProducts::MAX_IMAGES ?> images. Delete one to add another.</p><?php endif; ?>
  </fieldset>

  <fieldset>
    <legend>Visibility</legend>
    <?php if ($c['published']): ?>
    <label class="check"><input type="checkbox" name="show" value="1"<?= $isHidden ? '' : ' checked' ?>> Show this product in the website’s lists and menus</label>
    <p class="meta">Untick for a temporary reason such as out of stock. The product’s own page stays reachable.</p>
    <?php else: ?><p class="meta">Not applicable: this product has no group yet, so it is not on the website.</p><?php endif; ?>
  </fieldset>

  <div class="sticky-actions">
    <button class="btn btn-primary" type="submit"><?= $isNew ? 'Add product' : 'Save changes' ?></button>
    <a class="btn btn-quiet" href="<?= e(u('products')) ?>">Cancel</a>
  </div>
</form>

<?php if (!$isNew): ?>
<form class="card danger-zone" method="post" action="<?= e($self) ?>">
  <?= csrf_field() ?><input type="hidden" name="do" value="delete">
  <h2><?= $isCustom ? 'Delete this product' : 'Remove from website' ?></h2>
  <p class="meta"><?= $isCustom ? 'Permanently deletes this product and its uploaded images. This cannot be undone.' : 'Built-in products cannot be erased. This sets the status to Archived so it disappears from lists, search and menus; set the status back to Active to restore it.' ?></p>
  <label class="check"><input type="checkbox" name="confirm" value="yes" required> <?= $isCustom ? 'Yes, delete this product permanently' : 'Yes, remove this product from the website' ?></label>
  <button class="btn btn-danger" type="submit"><?= $isCustom ? 'Delete product' : 'Remove from website' ?></button>
</form>
<?php endif; ?>

<?php if ($edited && !$isCustom): ?>
<form class="card danger-zone" method="post" action="<?= e($self) ?>">
  <?= csrf_field() ?><input type="hidden" name="do" value="reset">
  <h2>Reset this product</h2>
  <p class="meta">Removes every edit (including price, availability, stock, keywords, brand, featured and status) and uploaded image for this product and goes back to the built-in details.<?= $updatedAt !== '' ? ' Last edited ' . e($updatedAt) . ' (UTC).' : '' ?></p>
  <button class="btn btn-danger" type="submit">Reset all to default</button>
</form>
<?php endif; ?>
