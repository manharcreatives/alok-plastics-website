<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var list<array<string,mixed>> $roles */ ?>
<div class="row-between">
  <h1>Open roles</h1>
  <a class="btn btn-primary" href="<?= e(u('role')) ?>">Add a role</a>
</div>
<p class="lead">Roles listed here appear on the Careers page. Shown roles are the ones marked <b>Live</b>. When nothing is live, the page shows its normal “send your CV” message.</p>

<?php if (!$roles): ?>
  <p class="card empty">No roles yet. Add one when you are hiring.</p>
<?php else: ?>
<ul class="roles">
  <?php foreach ($roles as $ro): ?>
  <li class="card">
    <div class="row-between">
      <div>
        <h2 class="role-title"><?= e($ro['title'] ?? '') ?></h2>
        <p class="meta"><?= e(ALOK_TEAMS[$ro['team'] ?? ''] ?? ($ro['team'] ?? '')) ?> · <?= e($ro['location'] ?? '') ?> · <?= e(ALOK_ROLE_TYPES[$ro['type'] ?? ''] ?? ($ro['type'] ?? '')) ?></p>
      </div>
      <span class="badge <?= !empty($ro['active']) ? 'badge-won' : 'badge-lost' ?>"><?= !empty($ro['active']) ? 'Live' : 'Hidden' ?></span>
    </div>
    <div class="actions">
      <form method="post" action="<?= e(u('careers')) ?>"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($ro['id'] ?? '') ?>">
        <button class="btn btn-secondary btn-sm" type="submit"><?= !empty($ro['active']) ? 'Hide from website' : 'Show on website' ?></button></form>
      <a class="btn btn-secondary btn-sm" href="<?= e(u('role', ['id' => $ro['id'] ?? ''])) ?>">Edit</a>
      <a class="btn btn-quiet btn-sm" href="<?= e(u('role_delete', ['id' => $ro['id'] ?? ''])) ?>">Delete…</a>
    </div>
  </li>
  <?php endforeach; ?>
</ul>
<?php endif; ?>
