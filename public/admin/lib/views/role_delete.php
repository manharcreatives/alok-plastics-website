<?php defined('ALOK_ADMIN') || exit; ?>
<?= page_head('Delete this role?', [['Dashboard', u()], ['Open roles', u('careers')], ['Delete', null]]) ?>
<section class="card narrow">
  <span class="empty-ico"><?= icon('trash') ?></span>
  <p><b><?= e($role['title'] ?? '') ?></b> will be removed from the list. If you might hire for it again, hide it instead.</p>
  <form method="post" action="<?= e(u('role_delete', ['id' => $role['id'] ?? ''])) ?>" class="actions">
    <?= csrf_field() ?><input type="hidden" name="confirm" value="yes">
    <button class="btn btn-danger" type="submit">Yes, delete</button>
    <a class="btn btn-secondary" href="<?= e(u('careers')) ?>">Keep it</a>
  </form>
</section>
