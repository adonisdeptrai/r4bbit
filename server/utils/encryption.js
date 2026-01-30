const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Validates encryption key existence and format
 */
function validateKey() {
    if (!ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }

    if (ENCRYPTION_KEY.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }
}

/**
 * Encrypts a text string
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text in format: iv:encryptedData
 */
function encrypt(text) {
    if (!text) return '';

    validateKey();

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return iv:encryptedData format
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypts an encrypted text string
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} Decrypted plain text
 */
function decrypt(encryptedText) {
    if (!encryptedText) return '';

    validateKey();

    try {
        const parts = encryptedText.split(':');

        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedData = Buffer.from(parts[1], 'hex');

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Checks if a string is already encrypted
 * @param {string} text - Text to check
 * @returns {boolean} True if encrypted
 */
function isEncrypted(text) {
    if (!text) return false;

    // Check if format matches iv:data (both parts should be hex)
    const parts = text.split(':');
    if (parts.length !== 2) return false;

    const hexRegex = /^[0-9a-f]+$/i;
    return hexRegex.test(parts[0]) && hexRegex.test(parts[1]);
}

module.exports = {
    encrypt,
    decrypt,
    isEncrypted,
    validateKey
};
