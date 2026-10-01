<?php defined('ALOK_ADMIN') || exit; ?>
<section class="card narrow">
  <h1><?= e($title) ?></h1>
  <p><?= e($message ?? '') ?></p>
  <p><a class="btn btn-secondary" href="<?= e(u()) ?>">Back to dashboard</a></p>
</section>
