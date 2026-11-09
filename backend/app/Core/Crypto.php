<?php

namespace App\Core;

class Crypto
{
    private const CIPHER = 'AES-256-CBC';
    private const PREFIX = 'ENC:';

    /**
     * Get 32-byte binary key derived from APP_KEY or strong fallback
     */
    private static function getKey(): string
    {
        $rawKey = envValue('APP_KEY', 'SILARIA_GFS_CERIA_SECURE_VAULT_KEY_2026!#@CERINDO');
        return hash('sha256', (string)$rawKey, true);
    }

    /**
     * Encrypt a plaintext string into a safe, prefixed base64 string
     */
    public static function encrypt(string $plainText): string
    {
        if ($plainText === '') {
            return '';
        }

        // Avoid double-encryption if already encrypted
        if (self::isEncrypted($plainText)) {
            return $plainText;
        }

        $ivlen = openssl_cipher_iv_length(self::CIPHER);
        $iv = openssl_random_pseudo_bytes($ivlen);
        $encrypted = openssl_encrypt($plainText, self::CIPHER, self::getKey(), OPENSSL_RAW_DATA, $iv);

        if ($encrypted === false) {
            return $plainText;
        }

        return self::PREFIX . base64_encode($iv . $encrypted);
    }

    /**
     * Decrypt an encrypted string back into human-readable plaintext
     */
    public static function decrypt(string $cipherText): string
    {
        if ($cipherText === '') {
            return '';
        }

        // If not prefixed, treat as legacy unencrypted plaintext
        if (!self::isEncrypted($cipherText)) {
            return $cipherText;
        }

        $raw = base64_decode(substr($cipherText, strlen(self::PREFIX)), true);
        if ($raw === false) {
            return $cipherText;
        }

        $ivlen = openssl_cipher_iv_length(self::CIPHER);
        if (strlen($raw) <= $ivlen) {
            return $cipherText;
        }

        $iv = substr($raw, 0, $ivlen);
        $ciphertextRaw = substr($raw, $ivlen);

        $decrypted = openssl_decrypt($ciphertextRaw, self::CIPHER, self::getKey(), OPENSSL_RAW_DATA, $iv);

        if ($decrypted === false) {
            return $cipherText;
        }

        return $decrypted;
    }

    /**
     * Check if a string is encrypted with our prefix
     */
    public static function isEncrypted(string $text): bool
    {
        return str_starts_with($text, self::PREFIX);
    }

    /**
     * Verify plain text against stored password (either encrypted or legacy plaintext)
     */
    public static function verifyPassword(string $plainText, string $storedPassword): bool
    {
        if ($storedPassword === '') {
            return false;
        }

        if (self::isEncrypted($storedPassword)) {
            $decrypted = self::decrypt($storedPassword);
            return hash_equals($decrypted, $plainText);
        }

        // Support bcrypt/argon2 if any exists
        if (str_starts_with($storedPassword, '$2y$') || str_starts_with($storedPassword, '$argon2')) {
            return password_verify($plainText, $storedPassword);
        }

        // Legacy plaintext comparison with timing-attack safe hash_equals
        return hash_equals($storedPassword, $plainText);
    }
}

