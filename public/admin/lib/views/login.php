<?php defined('ALOK_ADMIN') || exit; ?>
<section class="card narrow login">
  <img class="login-logo" src="/brand/alok-logo-color.svg" alt="Alok Plastics" width="180" height="62">
  <h1>Admin sign in</h1>
  <?php if (!empty($error)): ?><p class="flash flash-err" role="alert"><?= e($error) ?></p><?php endif; ?>
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
</section>
