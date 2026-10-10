<?php defined('ALOK_ADMIN') || exit; ?>
<?= page_head('Delete ' . $o['code'] . '?', [['Dashboard', u()], ['Orders', u('orders')], [$o['code'], u('order', ['id' => $o['id']])], ['Delete', null]]) ?>
<section class="card narrow">
  <span class="empty-ico"><?= icon('trash') ?></span>
  <p>This permanently removes order <b><?= e($o['code']) ?></b> from <b><?= e($o['name']) ?></b> (+<?= e($o['phone']) ?>) with its notes and history. It cannot be undone.</p>
  <p class="meta">If you only want it out of the way, cancel it instead so a record stays.</p>
  <form method="post" action="<?= e(u('order_delete', ['id' => $o['id']])) ?>" class="actions">
    <?= csrf_field() ?><input type="hidden" name="confirm" value="yes">
    <button class="btn btn-danger" type="submit">Yes, delete permanently</button>
    <a class="btn btn-secondary" href="<?= e(u('order', ['id' => $o['id']])) ?>">Keep it</a>
  </form>
</section>
