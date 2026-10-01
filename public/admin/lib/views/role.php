<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var array<string,mixed> $form @var array<string,string> $errors @var string $id */ ?>
<p class="crumb"><a href="<?= e(u('careers')) ?>">← Open roles</a></p>
<h1><?= $id !== '' ? 'Edit role' : 'Add a role' ?></h1>
<?php if ($errors): ?>
<div class="flash flash-err" role="alert"><b>Please fix <?= count($errors) ?> thing(s) below.</b><?php if (isset($errors['_save'])): ?><br><?= e($errors['_save']) ?><?php endif; ?></div>
<?php endif; ?>
<form class="card" method="post" action="<?= e(u('role', $id !== '' ? ['id' => $id] : [])) ?>" novalidate>
  <?= csrf_field() ?>
  <div class="field">
    <label for="title">Role title</label>
    <input id="title" name="title" type="text" maxlength="80" required value="<?= e($form['title'] ?? '') ?>"<?= aria_inv($errors, 'title') ?>>
    <?= field_err($errors, 'title') ?>
  </div>
  <div class="field">
    <label for="team">Team</label>
    <select id="team" name="team" required<?= aria_inv($errors, 'team') ?>>
      <option value="">Choose a team</option>
      <?php foreach (ALOK_TEAMS as $k => $l): ?><option value="<?= e($k) ?>"<?= ($form['team'] ?? '') === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
    </select>
    <?= field_err($errors, 'team') ?>
  </div>
  <div class="field">
    <label for="location">Location</label>
    <input id="location" name="location" type="text" maxlength="80" required value="<?= e($form['location'] ?? '') ?>"<?= aria_inv($errors, 'location') ?>>
    <?= field_err($errors, 'location') ?>
  </div>
  <div class="field">
    <label for="type">Employment type</label>
    <select id="type" name="type" required<?= aria_inv($errors, 'type') ?>>
      <?php foreach (ALOK_ROLE_TYPES as $k => $l): ?><option value="<?= e($k) ?>"<?= ($form['type'] ?? '') === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?>
    </select>
    <?= field_err($errors, 'type') ?>
  </div>
  <div class="field">
    <label for="description">Description</label>
    <textarea id="description" name="description" rows="8" maxlength="2000"<?= aria_inv($errors, 'description') ?>><?= e($form['description'] ?? '') ?></textarea>
    <p class="help">Plain text. What the person will do and what you are looking for. Do not publish a salary, qualification or benefit unless you have decided it.</p>
    <?= field_err($errors, 'description') ?>
  </div>
  <label class="check check-big"><input type="checkbox" name="active" value="1"<?= !empty($form['active']) ? ' checked' : '' ?>> Show this role on the Careers page</label>
  <div class="sticky-actions"><button class="btn btn-primary" type="submit">Save role</button> <a class="btn btn-quiet" href="<?= e(u('careers')) ?>">Cancel</a></div>
</form>
