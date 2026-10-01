<?php defined('ALOK_ADMIN') || exit; ?>
<?php
/** @var array $stats @var array $recent @var list<string> $missing */
$series = array_values($stats['series']);
$days = array_keys($stats['series']);
$peak = max(1, ...$series);
$sum30 = array_sum($series);
$maxProd = max(1, ...array_values($stats['products'] ?: [1]));
$maxBuyer = max(1, ...array_values($stats['buyers']));
$tz = AlokConfig::tz();
?>
<h1>Dashboard</h1>

<?php if ($stats['mail_failed'] > 0): ?>
<p class="flash flash-warn" role="status"><?= (int) $stats["mail_failed"] ?> enquir<?= $stats["mail_failed"] === 1 ? "y was" : "ies were" ?> saved here but the email notification did not go through. Check the email settings in <code>api/config.php</code> (see the System screen).</p>
<?php endif; ?>
<?php if ($missing): ?>
<p class="flash flash-info" role="status">Site settings are incomplete: <?= e(implode(', ', $missing)) ?> not set yet. <a href="<?= e(u('settings')) ?>">Open site settings</a></p>
<?php endif; ?>

<section aria-labelledby="h-at-a-glance">
  <h2 id="h-at-a-glance" class="sr-only">At a glance</h2>
  <ul class="tiles">
    <li><a class="tile tile-hot" href="<?= e(u('enquiries', ['status' => 'new'])) ?>"><span class="tile-n"><?= (int) $stats['new'] ?></span><span class="tile-l">New, not yet contacted</span></a></li>
    <li><a class="tile" href="<?= e(u('enquiries')) ?>"><span class="tile-n"><?= (int) $stats['unseen'] ?></span><span class="tile-l">Unread</span></a></li>
    <li><a class="tile" href="<?= e(u('enquiries', ['from' => (new DateTimeImmutable('monday this week', $tz))->format('Y-m-d')])) ?>"><span class="tile-n"><?= (int) $stats['week'] ?></span><span class="tile-l">This week</span></a></li>
    <li><a class="tile" href="<?= e(u('enquiries', ['from' => (new DateTimeImmutable('first day of this month', $tz))->format('Y-m-d')])) ?>"><span class="tile-n"><?= (int) $stats['month'] ?></span><span class="tile-l">This month</span></a></li>
  </ul>
</section>

<div class="grid2">
  <section class="card" aria-labelledby="h-trend">
    <h2 id="h-trend">Enquiries, last 30 days</h2>
    <svg class="spark" viewBox="0 0 300 64" role="img" aria-label="Enquiries per day over the last 30 days. Total <?= (int) $sum30 ?>, busiest day <?= (int) max($series) ?>.">
      <?php foreach ($series as $i => $n):
        $h = $n === 0 ? 1.5 : max(3, round(($n / $peak) * 58, 1)); ?>
        <rect class="<?= $n === 0 ? 'bar bar-zero' : 'bar' ?>" x="<?= $i * 10 + 1 ?>" y="<?= 62 - $h ?>" width="8" height="<?= $h ?>" rx="1"><title><?= e(date('d M', strtotime($days[$i]))) ?>: <?= (int) $n ?></title></rect>
      <?php endforeach; ?>
    </svg>
    <p class="meta"><?= (int) $sum30 ?> in 30 days · busiest day <?= (int) max($series) ?></p>
  </section>

  <section class="card" aria-labelledby="h-pipe">
    <h2 id="h-pipe">Where enquiries stand</h2>
    <ul class="pipe">
      <?php foreach (ALOK_STATUS_LABELS as $k => $label): ?>
        <li><a href="<?= e(u('enquiries', ['status' => $k])) ?>"><?= status_badge($k) ?> <b><?= (int) $stats['by_status'][$k] ?></b></a></li>
      <?php endforeach; ?>
    </ul>
    <p class="meta"><?= (int) $stats['active'] ?> active · <?= (int) $stats['archived'] ?> archived · <?= (int) $stats['total'] ?> total</p>
  </section>

  <section class="card" aria-labelledby="h-prod">
    <h2 id="h-prod">Most requested products</h2>
    <?php if (!$stats['products']): ?>
      <p class="empty">Nothing yet. Products appear here once enquiries name them.</p>
    <?php else: ?>
    <ul class="hbars">
      <?php foreach ($stats['products'] as $name => $n): ?>
      <li><a href="<?= e(u('enquiries', ['product' => $name])) ?>"><span class="hb-l"><?= e($name) ?></span><b><?= (int) $n ?></b>
        <svg viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true"><rect class="track" width="100" height="4"/><rect class="fill" width="<?= round($n / $maxProd * 100, 1) ?>" height="4"/></svg></a></li>
      <?php endforeach; ?>
    </ul>
    <?php endif; ?>
  </section>

  <section class="card" aria-labelledby="h-buyer">
    <h2 id="h-buyer">Who is enquiring</h2>
    <?php if ($stats['active'] === 0): ?>
      <p class="empty">No enquiries yet.</p>
    <?php else: ?>
    <ul class="hbars">
      <?php foreach (ALOK_BUYER_TYPES as $k => $label): ?>
      <li><a href="<?= e(u('enquiries', ['buyer' => $k])) ?>"><span class="hb-l"><?= e($label) ?></span><b><?= (int) $stats['buyers'][$k] ?></b>
        <svg viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true"><rect class="track" width="100" height="4"/><rect class="fill fill-grey" width="<?= round($stats['buyers'][$k] / $maxBuyer * 100, 1) ?>" height="4"/></svg></a></li>
      <?php endforeach; ?>
    </ul>
    <?php endif; ?>
  </section>
</div>

<section class="card" aria-labelledby="h-recent">
  <div class="row-between"><h2 id="h-recent">Latest enquiries</h2><a href="<?= e(u('enquiries')) ?>">See all</a></div>
  <?php if (!$recent): ?>
    <p class="empty">No enquiries yet. When someone submits the website form, it appears here (and in your email).</p>
  <?php else: ?>
  <ul class="latest">
    <?php foreach ($recent as $r): ?>
    <li><a href="<?= e(u('enquiry', ['id' => $r['id']])) ?>">
      <span class="l-main"><?= !$r['seen'] ? '<span class="dot" title="Unread"></span><span class="sr-only">Unread. </span>' : '' ?><b><?= e($r['name']) ?></b> · <?= e($r['company']) ?></span>
      <span class="l-sub"><?= e($r['product'] ?: 'No product named') ?> · <?= e(alok_ago($r['created_at'])) ?></span>
      <?= status_badge($r['status']) ?></a></li>
    <?php endforeach; ?>
  </ul>
  <?php endif; ?>
</section>
