<?php defined('ALOK_ADMIN') || exit; ?>
<?php if ($pages > 1): ?>
<nav class="pager" aria-label="Pages">
  <?php if ($page > 1): ?><a class="btn btn-secondary" href="<?= e($pageHref($page - 1)) ?>" rel="prev"><?= icon('back') ?>Previous</a><?php else: ?><span></span><?php endif; ?>
  <span class="meta">Page <?= (int) $page ?> of <?= (int) $pages ?></span>
  <?php if ($page < $pages): ?><a class="btn btn-secondary" href="<?= e($pageHref($page + 1)) ?>" rel="next">Next<?= icon('arrow') ?></a><?php else: ?><span></span><?php endif; ?>
</nav>
<?php endif; ?>
