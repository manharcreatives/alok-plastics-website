<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var string $title @var string $content @var string $nav @var bool $bare @var ?array $user @var ?array $flash */ ?>
<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="color-scheme" content="light">
<title><?= e($title) ?> · Alok Plastics admin</title>
<link rel="icon" href="/icon-192.png">
<link rel="stylesheet" href="<?= e(asset('admin.css')) ?>">
<script src="<?= e(asset('admin.js')) ?>" defer></script>
</head>
<body class="<?= $bare ? 'bare' : 'app' ?>">
<a class="skip" href="#main">Skip to content</a>
<?php if (!$bare && $user): ?>
<header class="top">
  <a class="brand" href="<?= e(u()) ?>" aria-label="Alok Plastics admin, dashboard">
    <img src="/brand/alok-logo-color.svg" alt="Alok Plastics" width="128" height="44">
  </a>
  <div class="who">
    <span class="who-name"><?= e($user['name']) ?></span>
    <form method="post" action="<?= e(u('logout')) ?>"><?= csrf_field() ?><button class="btn btn-quiet" type="submit">Sign out</button></form>
  </div>
</header>
<?php
$unseen = alok_unseen_count();
$items = [
  'dashboard' => ['Dashboard', u()],
  'enquiries' => ['Enquiries', u('enquiries')],
  'settings'  => ['Site settings', u('settings')],
  'careers'   => ['Open roles', u('careers')],
  'products'  => ['Products', u('products')],
  'more'      => ['Activity & system', u('audit')],
];
?>
<nav class="tabs" aria-label="Admin sections">
  <ul>
  <?php foreach ($items as $key => [$label, $href]): ?>
    <li><a href="<?= e($href) ?>"<?= $nav === $key ? ' aria-current="page"' : '' ?>><?= e($label) ?><?php if ($key === 'enquiries' && $unseen > 0): ?> <span class="count" aria-label="<?= (int) $unseen ?> unread"><?= (int) $unseen ?></span><?php endif; ?></a></li>
  <?php endforeach; ?>
  </ul>
</nav>
<?php endif; ?>
<main id="main" tabindex="-1" class="<?= $bare ? 'main-bare' : 'main' ?>">
<?php if ($flash): ?>
  <p class="flash flash-<?= e($flash[0]) ?>" role="<?= $flash[0] === 'err' ? 'alert' : 'status' ?>"><?= e($flash[1]) ?></p>
<?php endif; ?>
<?= $content ?>
</main>
<?php if (!$bare): ?>
<footer class="foot">Alok Plastics admin · private area. Times shown in <?= e(AlokConfig::tz()->getName()) ?>.</footer>
<?php endif; ?>
</body>
</html>
