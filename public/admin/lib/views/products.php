<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var list<array{0:string,1:string,2:bool}> $catalogue @var list<string> $hidden */
$known = array_column($catalogue, 0);
$orphans = array_values(array_diff($hidden, $known));
?>
<h1>Product visibility</h1>
<p class="lead">Untick a product to hide it from the website’s product lists. Use this for a temporary reason, such as a part that is out of stock.</p>
<div class="flash flash-info" role="note">
  <b>What this can and cannot do.</b> It hides the product in lists and menus when each page loads. The product’s own page still exists and search engines may still list it. Adding, renaming, or properly removing a product means editing the product content and rebuilding the website; ask your developer.
</div>

<form class="card" method="post" action="<?= e(u('products')) ?>">
  <?= csrf_field() ?>
  <fieldset class="plain">
    <legend class="sr-only">Products shown on the website</legend>
    <ul class="checklist">
      <?php foreach ($catalogue as [$slug, $name, $published]): ?>
      <li>
        <?php if ($published): ?>
          <label class="check"><input type="checkbox" name="visible[]" value="<?= e($slug) ?>"<?= in_array($slug, $hidden, true) ? '' : ' checked' ?>> <?= e($name) ?></label>
        <?php else: ?>
          <span class="check muted"><?= e($name) ?> <span class="meta">(not published on the website yet)</span></span>
        <?php endif; ?>
      </li>
      <?php endforeach; ?>
    </ul>
  </fieldset>
  <?php if ($orphans): ?><p class="meta">Also hidden, but not in this panel’s product list: <?= e(implode(', ', $orphans)) ?>. They stay hidden.</p><?php endif; ?>
  <div class="sticky-actions"><button class="btn btn-primary" type="submit">Save</button></div>
</form>
<p class="meta">This list is a snapshot of the website’s products. If products were added to the website recently, ask your developer to refresh it.</p>
