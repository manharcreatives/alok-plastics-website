<?php defined('ALOK_ADMIN') || exit; ?>
<?= page_head('Delete enquiry #' . (int) $r['id'] . '?', [['Dashboard', u()], ['Enquiries', u('enquiries')], ['#' . (int) $r['id'], u('enquiry', ['id' => $r['id']])], ['Delete', null]]) ?>
<section class="card narrow">
  <span class="empty-ico"><?= icon('trash') ?></span>
  <p>This permanently removes the enquiry from <b><?= e($r['name']) ?></b> (<?= e($r['company']) ?>) including its notes. It cannot be undone.</p>
  <p class="meta">If you only want it out of the way, archive it instead.</p>
  <form method="post" action="<?= e(u('enquiry_delete', ['id' => $r['id']])) ?>" class="actions">
    <?= csrf_field() ?><input type="hidden" name="confirm" value="yes">
    <button class="btn btn-danger" type="submit">Yes, delete permanently</button>
    <a class="btn btn-secondary" href="<?= e(u('enquiry', ['id' => $r['id']])) ?>">Keep it</a>
  </form>
</section>
