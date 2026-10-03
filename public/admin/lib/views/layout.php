<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var string $title @var string $content @var string $nav @var bool $bare @var ?array $user @var ?array $flash  @var list<string>|null $styles extra stylesheets under assets/ (e.g. ['products.css']) */ ?>
<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#2E0A0F">
<title><?= e($title) ?> · Alok Plastics admin</title>
<link rel="icon" href="/icon-192.png">
<link rel="preload" href="<?= e(asset('fonts/archivo-latin-wdth.woff2')) ?>" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="<?= e(asset('admin.css')) ?>">
<?php foreach (($styles ?? []) as $css): ?>
<link rel="stylesheet" href="<?= e(asset((string) $css)) ?>">
<?php endforeach; ?>
<script src="<?= e(asset('admin.js')) ?>" defer></script>
</head>
<body class="<?= $bare ? 'bare' : 'app' ?>">
<a class="skip" href="#main">Skip to content</a>
<?php if (!$bare && $user): ?>
<?php
$unseen = alok_unseen_count();
$items = [
  'dashboard' => ['Dashboard', u(), 'grid'],
  'enquiries' => ['Enquiries', u('enquiries'), 'mail'],
  'products'  => ['Products', u('products'), 'box'],
  'careers'   => ['Open roles', u('careers'), 'briefcase'],
  'audit'     => ['Activity log', u('audit'), 'clock'],
];
$initial = mb_strtoupper(mb_substr((string) $user['name'], 0, 1));
?>
<div class="shell">
  <aside class="side">
    <div class="side-top">
      <a class="side-brand" href="<?= e(u()) ?>" aria-label="Alok Plastics admin, dashboard">
        <img src="/brand/alok-logo-white.svg" alt="Alok Plastics" width="140" height="51">
      </a>
      <span class="side-tag">Admin</span>
    </div>
    <nav class="side-nav" aria-label="Admin sections">
      <ul>
      <?php foreach ($items as $key => [$label, $href, $ico]): ?>
        <li><a href="<?= e($href) ?>"<?= $nav === $key ? ' aria-current="page"' : '' ?>><?= icon($ico) ?><span class="nav-label"><?= e($label) ?></span><?php if ($key === 'enquiries' && $unseen > 0): ?><span class="count" aria-label="<?= (int) $unseen ?> unread"><?= (int) $unseen ?></span><?php endif; ?></a></li>
      <?php endforeach; ?>
      </ul>
    </nav>
    <div class="side-user">
      <span class="avatar" aria-hidden="true"><?= e($initial) ?></span>
      <span class="side-user-meta"><span class="side-user-name"><?= e($user['name']) ?></span><span class="side-user-role">Signed in</span></span>
      <form method="post" action="<?= e(u('logout')) ?>"><?= csrf_field() ?><button class="icon-btn" type="submit" title="Sign out" aria-label="Sign out"><?= icon('logout') ?></button></form>
    </div>
  </aside>

  <div class="stage">
    <header class="mobile-top">
      <a class="side-brand" href="<?= e(u()) ?>" aria-label="Alok Plastics admin, dashboard">
        <img src="/brand/alok-logo-white.svg" alt="Alok Plastics" width="104" height="38">
      </a>
      <form method="post" action="<?= e(u('logout')) ?>"><?= csrf_field() ?><button class="mobile-signout" type="submit"><?= icon('logout') ?><span>Sign out</span></button></form>
    </header>

    <main id="main" tabindex="-1" class="main">
    <?php if ($flash): ?>
      <p class="flash flash-<?= e($flash[0]) ?>" role="<?= $flash[0] === 'err' ? 'alert' : 'status' ?>"><?= icon($flash[0] === 'ok' ? 'check' : ($flash[0] === 'err' || $flash[0] === 'warn' ? 'alert' : 'eye')) ?><span><?= e($flash[1]) ?></span></p>
    <?php endif; ?>
    <?= $content ?>
    </main>
    <footer class="foot">Alok Plastics admin · private area · times in <?= e(AlokConfig::tz()->getName()) ?></footer>
  </div>

  <nav class="tabbar" aria-label="Admin sections (mobile)">
    <ul>
    <?php foreach ($items as $key => [$label, $href, $ico]): ?>
      <li><a href="<?= e($href) ?>"<?= $nav === $key ? ' aria-current="page"' : '' ?>><span class="tab-ico"><?= icon($ico) ?><?php if ($key === 'enquiries' && $unseen > 0): ?><span class="tab-dot" aria-label="<?= (int) $unseen ?> unread"><?= (int) $unseen ?></span><?php endif; ?></span><span class="tab-label"><?= e($label === 'Activity log' ? 'Activity' : ($label === 'Open roles' ? 'Roles' : $label)) ?></span></a></li>
    <?php endforeach; ?>
    </ul>
  </nav>
</div>
<?php else: ?>
<main id="main" tabindex="-1" class="main-bare">
<?php if ($flash): ?>
  <p class="flash flash-<?= e($flash[0]) ?> flash-float" role="<?= $flash[0] === 'err' ? 'alert' : 'status' ?>"><?= e($flash[1]) ?></p>
<?php endif; ?>
<?= $content ?>
</main>
<?php endif; ?>
</body>
</html>
