<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var bool $submitted @var string|null $resetUrl @var string|null $error @var string $username */ ?>
<section class="auth">
  <div class="auth-brand">
    <img src="/brand/alok-logo-white.svg" alt="Alok Plastics" width="168" height="61">
    <div>
      <p class="auth-eyebrow">Admin</p>
      <p class="auth-statement">Reset your password.</p>
    </div>
  </div>
  <div class="auth-form">
    <h1>Reset password</h1>
    <?php if ($submitted): ?>
      <?php if ($resetUrl !== null): ?>
        <p class="flash flash-ok"><?= icon('check') ?><span>Local development: no mail server, so the link is shown here.</span></p>
        <div class="card">
          <a href="<?= e($resetUrl) ?>" class="reset-url">Open the reset link</a>
          <p class="meta">Valid for 15 minutes, single use.</p>
        </div>
      <?php else: ?>
        <p class="flash flash-ok"><?= icon('check') ?><span>If that username exists, a reset link has been emailed to the owner's inbox. It is valid for 15 minutes.</span></p>
      <?php endif; ?>
      <p class="meta"><a href="<?= e(u('forgot_password')) ?>">Try again</a> &nbsp;·&nbsp; <a href="<?= e(u('login')) ?>">← Back to sign in</a></p>
    <?php else: ?>
      <p class="sub">Enter your username. A reset link will be emailed to the owner's inbox.</p>
      <?php if (!empty($error)): ?><p class="flash flash-err" role="alert"><?= icon('alert') ?><span><?= e($error) ?></span></p><?php endif; ?>
      <form method="post" action="<?= e(u('forgot_password')) ?>" autocomplete="on">
        <?= csrf_field() ?>
        <div class="field">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" value="<?= e($username) ?>" autocomplete="username" autocapitalize="none" spellcheck="false" required maxlength="60" autofocus>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Send reset link</button>
      </form>
      <p class="meta"><a href="<?= e(u('login')) ?>">← Back to sign in</a></p>
    <?php endif; ?>
  </div>
</section>
