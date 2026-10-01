<?php defined('ALOK_ADMIN') || exit; ?>
<section class="card narrow">
  <h1>Admin not set up yet</h1>
  <p>This panel needs a private <code>config.php</code> with at least one admin user. No password ships with the site, so nobody can sign in until you create one.</p>
  <ol class="steps">
    <li>Create a password hash: run <code>php admin/hash.php</code> on your computer, or open <a href="hash.php">hash.php</a> once (it switches itself off after setup).</li>
    <li>Copy <code>config.php.example</code> to <code>config.php</code> in this folder and paste the hash in.</li>
    <li>Reload this page.</li>
  </ol>
  <p class="meta">Full steps: <code>docs/admin-panel.md</code> in the project.</p>
</section>
