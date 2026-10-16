<?php defined('ALOK_ADMIN') || exit; ?>
<section class="card narrow empty-state">
  <span class="empty-ico"><?= icon('alert') ?></span>
  <h1 class="empty-title"><?= e($title) ?></h1>
  <p><?= e($message ?? '') ?></p>
  <?php if (!empty($detail)): ?><p class="meta"><code><?= e($detail) ?></code></p><?php endif; ?>
  <a class="btn btn-secondary" href="<?= e(u()) ?>"><?= icon('back') ?>Back to dashboard</a>
</section>
