<?php

declare(strict_types=1);

if (!defined('ALOK_ADMIN')) {
    define('ALOK_ADMIN', true);
}

$alokLib = dirname(__DIR__) . '/admin/lib';
require_once $alokLib . '/core.php';
require_once $alokLib . '/shop.php';

date_default_timezone_set(AlokConfig::tz()->getName());
