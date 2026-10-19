<?php
/**
 * Admin girişi. Şifrənin özü burada saxlanılmır — yalnız PBKDF2-SHA256 hash-i.
 * Şifrəni dəyişmək üçün yeni salt və hash yaradıb bu üç dəyəri əvəz edin.
 */
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_SALT = 'f715c04ad206725157b9d30d51be064c';
const ADMIN_PASSWORD_ITERATIONS = 200000;
const ADMIN_PASSWORD_HASH = '3bad1f0941c16db75938d5cdab548046328366b28d524e5a360a780ecb61dcc8';
