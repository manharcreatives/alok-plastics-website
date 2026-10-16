<?php defined('ALOK_ADMIN') || exit; ?>
<?php /** @var bool $invalid @var string|null $error @var string|null $username @var string $token */ ?>
<section class="auth">
  <div class="auth-brand">
    <img src="/brand/alok-logo-white.svg" alt="Alok Plastics" width="168" height="61">
    <div>
      <p class="auth-eyebrow">Admin</p>
      <p class="auth-statement">Choose a new password.</p>
    </div>
  </div>
  <div class="auth-form">
    <h1>Set new password</h1>
    <?php if ($invalid): ?>
      <p class="flash flash-err" role="alert"><?= icon('alert') ?><span>This reset link is invalid or has expired.</span></p>
      <p class="sub">Reset links expire after 15 minutes and can only be used once.</p>
      <p class="meta"><a href="<?= e(u('forgot_password')) ?>">Request a new reset link</a> &nbsp;·&nbsp; <a href="<?= e(u('login')) ?>">← Back to sign in</a></p>
    <?php else: ?>
      <p class="sub">Setting a new password for <strong><?= e($username) ?></strong>.</p>
      <?php if (!empty($error)): ?><p class="flash flash-err" role="alert"><?= icon('alert') ?><span><?= e($error) ?></span></p><?php endif; ?>
      <form method="post" action="<?= e(u('reset_password', ['t' => $token])) ?>" autocomplete="off">
        <?= csrf_field() ?>
        <div class="field">
          <label for="password">New password</label>
          <input id="password" name="password" type="password" autocomplete="new-password" required minlength="10" maxlength="200" autofocus>
          <p class="field-hint">Minimum 10 characters.</p>
        </div>
        <div class="field">
          <label for="password2">Confirm new password</label>
          <input id="password2" name="password2" type="password" autocomplete="new-password" required maxlength="200">
        </div>
        <button class="btn btn-primary btn-block" type="submit">Set new password</button>
      </form>
      <p class="meta"><a href="<?= e(u('login')) ?>">← Back to sign in</a></p>
    <?php endif; ?>
  </div>
</section>
