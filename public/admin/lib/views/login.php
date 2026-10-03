<?php defined('ALOK_ADMIN') || exit; ?>
<section class="auth">
  <div class="auth-brand">
    <img src="/brand/alok-logo-white.svg" alt="Alok Plastics" width="168" height="61">
    <div>
      <p class="auth-eyebrow">Admin</p>
      <p class="auth-statement">Enquiries, products and open roles in one place.</p>
    </div>
  </div>
  <div class="auth-form">
    <h1>Sign in</h1>
    <p class="sub">Use the username and password given to you.</p>
    <?php if (!empty($error)): ?><p class="flash flash-err" role="alert"><?= icon('alert') ?><span><?= e($error) ?></span></p><?php endif; ?>
    <form method="post" action="<?= e(u('login')) ?>" autocomplete="on">
      <?= csrf_field() ?>
      <div class="field">
        <label for="username">Username</label>
        <input id="username" name="username" type="text" value="<?= e($username) ?>" autocomplete="username" autocapitalize="none" spellcheck="false" required maxlength="60" autofocus>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required maxlength="200">
      </div>
      <button class="btn btn-primary btn-block" type="submit">Sign in</button>
    </form>
    <p class="meta">Private area for Alok Plastics staff. Activity is logged.</p>
  </div>
</section>
