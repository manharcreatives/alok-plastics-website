<?php defined('ALOK_ADMIN') || exit; ?>
<?php
/** @var array<string,string> $form @var array<string,string> $errors @var bool $saved */
$v = static fn(string $k): string => e($form[$k] ?? '');
$text = static function (string $id, string $label, string $help = '', string $type = 'text', string $ph = '', string $extra = '') use ($form, $errors): void {
    echo '<div class="field"><label for="' . e($id) . '">' . e($label) . '</label>';
    echo '<input id="' . e($id) . '" name="' . e($id) . '" type="' . e($type) . '" value="' . e($form[$id] ?? '') . '"'
        . ($ph !== '' ? ' placeholder="' . e($ph) . '"' : '') . ' ' . $extra . aria_inv($errors, $id) . '>';
    if ($help !== '') echo '<p class="help">' . e($help) . '</p>';
    echo field_err($errors, $id) . '</div>';
};
?>
<h1>Site settings</h1>
<p class="lead">Contact details and notices that the website reads when each page loads. Leave a field empty to leave it out of the website. Nothing here is filled in for you.</p>
<?php if (!$saved): ?><p class="flash flash-info" role="status">No settings have been saved yet, so the website is using the values built into it.</p><?php endif; ?>
<?php if ($errors): ?>
<div class="flash flash-err" role="alert">
  <b>Please fix <?= count($errors) ?> thing(s) below.</b>
  <?php if (isset($errors['_save'])): ?><br><?= e($errors['_save']) ?><?php endif; ?>
</div>
<?php endif; ?>

<form method="post" action="<?= e(u('settings')) ?>" novalidate>
  <?= csrf_field() ?>

  <fieldset class="card">
    <legend>Contact</legend>
    <?php
    $text('phone', 'Phone number', 'As customers should dial it.', 'tel', 'e.g. +91 98xxx xxxxx', 'autocomplete="off" maxlength="30"');
    $text('whatsapp', 'WhatsApp number', 'Digits with country code (India: 91 then the 10-digit number). Used for the floating WhatsApp button.', 'tel', 'e.g. 9198xxxxxxxx', 'autocomplete="off" inputmode="numeric" maxlength="30"');
    $text('email', 'Enquiry email address', 'Shown on the website. This does not change where form emails are delivered; that is set in api/config.php.', 'email', 'name@yourdomain', 'autocomplete="off" maxlength="120"');
    $text('mapsUrl', 'Google Maps link', 'Open the factory on Google Maps, press Share, copy the link.', 'url', 'https://maps.app.goo.gl/…', 'autocomplete="off" maxlength="300"');
    $text('gstin', 'GSTIN', '15 characters.', 'text', '', 'autocomplete="off" maxlength="15" spellcheck="false" class="mono"');
    ?>
  </fieldset>

  <fieldset class="card">
    <legend>Social pages</legend>
    <?php
    foreach (['instagram' => 'Instagram', 'linkedin' => 'LinkedIn', 'facebook' => 'Facebook', 'youtube' => 'YouTube'] as $k => $l) {
        $text($k, $l . ' link', '', 'url', 'https://…', 'autocomplete="off" maxlength="300"');
    }
    ?>
  </fieldset>

  <fieldset class="card">
    <legend>Replying and opening hours</legend>
    <?php $text('replyTime', 'Typical reply time', 'Only promise what you can keep. Example wording: "within one business day".', 'text', '', 'maxlength="60"'); ?>
    <div class="hours" role="group" aria-label="Opening hours">
      <?php foreach (ALOK_DAYS as $d => $label): ?>
      <div class="hours-row">
        <span class="hours-day"><?= e($label) ?></span>
        <label class="sr-only" for="open_<?= e($d) ?>"><?= e($label) ?> opens</label>
        <input id="open_<?= e($d) ?>" name="open_<?= e($d) ?>" type="time" value="<?= $v('open_' . $d) ?>"<?= aria_inv($errors, 'hours_' . $d) ?>>
        <span aria-hidden="true">to</span>
        <label class="sr-only" for="close_<?= e($d) ?>"><?= e($label) ?> closes</label>
        <input id="close_<?= e($d) ?>" name="close_<?= e($d) ?>" type="time" value="<?= $v('close_' . $d) ?>">
        <label class="check"><input type="checkbox" name="closed_<?= e($d) ?>" value="1" data-closes="<?= e($d) ?>"<?= !empty($form['closed_' . $d]) ? ' checked' : '' ?>> Closed</label>
        <?= field_err($errors, 'hours_' . $d) ?>
      </div>
      <?php endforeach; ?>
    </div>
    <p class="help">Leave both times empty if you do not want to publish hours for that day.</p>
    <?php $text('hoursNote', 'Hours note (optional)', 'For example a holiday closure.', 'text', '', 'maxlength="120"'); ?>
  </fieldset>

  <fieldset class="card">
    <legend>Announcement banner</legend>
    <label class="check check-big"><input type="checkbox" name="banner_enabled" value="1"<?= !empty($form['banner_enabled']) ? ' checked' : '' ?>> Show the banner on the website</label>
    <div class="field">
      <label for="banner_text">Banner text</label>
      <input id="banner_text" name="banner_text" type="text" maxlength="140" value="<?= $v('banner_text') ?>"<?= aria_inv($errors, 'banner_text') ?> data-counter="banner_count">
      <p class="help"><span id="banner_count">0</span> / 140 characters. Keep it short and factual.</p>
      <?= field_err($errors, 'banner_text') ?>
    </div>
    <?php $text('banner_href', 'Link (optional)', 'A page like /contact/ or a full https:// link.', 'text', '', 'maxlength="300"'); ?>
  </fieldset>

  <div class="sticky-actions">
    <button class="btn btn-primary" type="submit">Save settings</button>
  </div>
</form>
