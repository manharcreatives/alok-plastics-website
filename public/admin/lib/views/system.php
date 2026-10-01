<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var list<array{label:string,state:string,detail:string}> $checks */ ?>
<h1>System check</h1>
<p class="lead">A quick health check of the hosting set-up. Anything marked “Fix” needs attention; “Advice” is recommended but not blocking.</p>
<ul class="checks card">
  <?php foreach ($checks as $c): ?>
  <li>
    <span class="badge badge-<?= $c['state'] === 'ok' ? 'won' : ($c['state'] === 'warn' ? 'quoted' : 'new') ?>"><?= $c['state'] === 'ok' ? 'OK' : ($c['state'] === 'warn' ? 'Advice' : 'Fix') ?></span>
    <div><b><?= e($c['label']) ?></b><br><span class="meta"><?= e($c['detail']) ?></span></div>
  </li>
  <?php endforeach; ?>
</ul>
<p class="meta"><a href="<?= e(u('audit')) ?>">Activity log</a></p>
