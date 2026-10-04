<?php defined('ALOK_ADMIN') || exit; ?>
<?php
/** @var array $stats @var array $recent @var array $user */
$series = array_values($stats['series']);
$days = array_keys($stats['series']);
$peak = max(1, ...$series);
$sum30 = array_sum($series);
$maxProd = max(1, ...array_values($stats['products'] ?: [1]));
$maxBuyer = max(1, ...array_values($stats['buyers']));
$tz = AlokConfig::tz();
$hour = (int) (new DateTimeImmutable('now', $tz))->format('G');
$hello = $hour < 12 ? 'Good morning' : ($hour < 17 ? 'Good afternoon' : 'Good evening');
$first = explode(' ', trim((string) $user['name']))[0];
$pipeTotal = max(1, array_sum($stats['by_status']));
$hasData = $stats['total'] > 0;
// chart geometry
$W = 600; $H = 160; $padL = 26; $padB = 18; $plotH = $H - $padB - 8; $slot = ($W - $padL) / 30; $bw = max(4, $slot - 5);
$mid = (int) ceil($peak / 2);
?>
<header class="page-head">
  <div class="page-head-main">
    <p class="greeting"><?= e(date('l, j F')) ?></p>
    <h1 class="page-title"><?= e($hello) ?>, <?= e($first) ?></h1>
    <p class="lead"><?= $stats['new'] > 0
      ? '<b>' . (int) $stats['new'] . '</b> new enquir' . ($stats['new'] === 1 ? 'y is' : 'ies are') . ' waiting for a first response.'
      : 'Nothing is waiting for a first response. Here is how the enquiry pipeline looks.' ?></p>
  </div>
  <div class="page-actions">
    <a class="btn btn-primary" href="<?= e(u('enquiries')) ?>"><?= icon('mail') ?>Open enquiries</a>
  </div>
</header>

<?php if ($stats['mail_failed'] > 0): ?>
<p class="flash flash-warn" role="status"><?= icon('alert') ?><span><?= (int) $stats['mail_failed'] ?> enquir<?= $stats['mail_failed'] === 1 ? 'y was' : 'ies were' ?> saved here but the email notification did not go through. Ask your developer to check the email settings in <code>api/config.php</code>.</span></p>
<?php endif; ?>

<section aria-labelledby="h-at-a-glance">
  <h2 id="h-at-a-glance" class="sr-only">At a glance</h2>
  <ul class="kpis">
    <li><a class="kpi kpi-hot" href="<?= e(u('enquiries', ['status' => 'new'])) ?>"><span class="kpi-l">New</span><span><span class="kpi-n"><?= (int) $stats['new'] ?></span><span class="kpi-note">&nbsp;not yet contacted</span></span></a></li>
    <li><a class="kpi" href="<?= e(u('enquiries')) ?>"><span class="kpi-l">Unread</span><span><span class="kpi-n"><?= (int) $stats['unseen'] ?></span><span class="kpi-note">&nbsp;not opened</span></span></a></li>
    <li><a class="kpi" href="<?= e(u('enquiries', ['from' => (new DateTimeImmutable('monday this week', $tz))->format('Y-m-d')])) ?>"><span class="kpi-l">This week</span><span><span class="kpi-n"><?= (int) $stats['week'] ?></span><span class="kpi-note">&nbsp;since Monday</span></span></a></li>
    <li><a class="kpi" href="<?= e(u('enquiries', ['from' => (new DateTimeImmutable('first day of this month', $tz))->format('Y-m-d')])) ?>"><span class="kpi-l">This month</span><span><span class="kpi-n"><?= (int) $stats['month'] ?></span><span class="kpi-note">&nbsp;<?= e(date('F')) ?></span></span></a></li>
  </ul>
</section>

<div class="grid2">
  <section class="card" aria-labelledby="h-trend">
    <div class="card-head"><h2 class="card-title" id="h-trend">Enquiries, last 30 days</h2><span class="card-sub"><?= (int) $sum30 ?> total</span></div>
    <svg class="chart" viewBox="0 0 <?= $W ?> <?= $H ?>" role="img" aria-label="Enquiries per day over the last 30 days. Total <?= (int) $sum30 ?>, busiest day <?= (int) max($series) ?>.">
      <?php foreach ([$peak, $mid, 0] as $gv): $gy = 4 + $plotH - ($gv / $peak) * $plotH; ?>
        <line class="grid" x1="<?= $padL ?>" x2="<?= $W ?>" y1="<?= round($gy, 1) ?>" y2="<?= round($gy, 1) ?>"/>
        <text class="axis" x="0" y="<?= round($gy + 3, 1) ?>"><?= (int) $gv ?></text>
      <?php endforeach; ?>
      <?php foreach ($series as $i => $n):
        $h = $n === 0 ? 2 : max(4, round(($n / $peak) * $plotH, 1));
        $x = round($padL + $i * $slot + ($slot - $bw) / 2, 1); ?>
        <rect class="<?= $n === 0 ? 'bar bar-zero' : 'bar' ?>" x="<?= $x ?>" y="<?= round(4 + $plotH - $h, 1) ?>" width="<?= round($bw, 1) ?>" height="<?= $h ?>" rx="2"><title><?= e(date('d M', strtotime($days[$i]))) ?>: <?= (int) $n ?></title></rect>
      <?php endforeach; ?>
      <?php foreach ([0, 7, 14, 21, 29] as $i): ?>
        <text class="axis" x="<?= round($padL + $i * $slot + $slot / 2, 1) ?>" y="<?= $H - 2 ?>" text-anchor="middle"><?= e(date('j M', strtotime($days[$i]))) ?></text>
      <?php endforeach; ?>
    </svg>
    <p class="chart-meta"><span>Busiest day <b><?= (int) max($series) ?></b></span><span>Daily average <b><?= number_format($sum30 / 30, 1) ?></b></span></p>
  </section>

  <section class="card" aria-labelledby="h-pipe">
    <div class="card-head"><h2 class="card-title" id="h-pipe">Where enquiries stand</h2><span class="card-sub"><?= (int) $stats['active'] ?> active</span></div>
    <?php if ($stats['active'] > 0): ?>
    <svg class="pipebar" viewBox="0 0 100 3" preserveAspectRatio="none" aria-hidden="true">
      <rect class="seg-track" width="100" height="3"/>
      <?php $px = 0; foreach (ALOK_STATUS_LABELS as $k => $label): if ($stats['by_status'][$k] < 1) continue; $w = $stats['by_status'][$k] / $pipeTotal * 100; ?>
        <rect class="seg-<?= e($k) ?>" x="<?= round($px, 2) ?>" width="<?= max(0.8, round($w - 0.5, 2)) ?>" height="3"/>
      <?php $px += $w; endforeach; ?>
    </svg>
    <?php endif; ?>
    <ul class="pipe">
      <?php foreach (ALOK_STATUS_LABELS as $k => $label): ?>
        <li><a href="<?= e(u('enquiries', ['status' => $k])) ?>"><?= status_badge($k) ?> <b><?= (int) $stats['by_status'][$k] ?></b></a></li>
      <?php endforeach; ?>
    </ul>
    <p class="meta"><?= (int) $stats['archived'] ?> archived · <?= (int) $stats['total'] ?> in total</p>
  </section>

  <section class="card" aria-labelledby="h-prod">
    <div class="card-head"><h2 class="card-title" id="h-prod">Most requested products</h2></div>
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
    <div class="card-head"><h2 class="card-title" id="h-buyer">Who is enquiring</h2></div>
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
  <div class="card-head"><h2 class="card-title" id="h-recent">Latest enquiries</h2><a href="<?= e(u('enquiries')) ?>">See all <?= icon('arrow') ?></a></div>
  <?php if (!$recent): ?>
    <div class="empty-state">
      <span class="empty-ico"><?= icon('inbox') ?></span>
      <p class="empty-title">No enquiries yet</p>
      <p>When someone submits the website form, it appears here and in your email.</p>
    </div>
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

<nav aria-label="Quick links">
  <div class="quick">
    <a href="<?= e(u('role')) ?>"><?= icon('plus') ?>Add a role</a>
    <a href="<?= e(u('products')) ?>"><?= icon('box') ?>Products</a>
    <a href="<?= e('index.php?r=export') ?>"><?= icon('download') ?>Download CSV</a>
    <a href="<?= e(u('audit')) ?>"><?= icon('clock') ?>Activity log</a>
  </div>
</nav>
