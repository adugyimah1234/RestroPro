'use strict';

const crypto = require('crypto');
const { PlatformSetting } = require('../models');

const GEMINI_API_KEY_SETTING = 'gemini_api_key';

function getEncryptionKey() {
    const configuredKey = process.env.GEMINI_SETTINGS_ENCRYPTION_KEY;
    if (!configuredKey || configuredKey.length < 32) {
        throw new Error('GEMINI_SETTINGS_ENCRYPTION_KEY must be configured with at least 32 characters to manage the Gemini API key.');
    }
    return crypto.createHash('sha256').update(configuredKey).digest();
}

function encrypt(value) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv, tag, ciphertext].map((part) => part.toString('base64')).join('.');
}

function decrypt(value) {
    const [ivText, tagText, ciphertextText] = value.split('.');
    if (!ivText || !tagText || ciphertextText === undefined) {
        throw new Error('Stored Gemini API key has an invalid encrypted format.');
    }

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        getEncryptionKey(),
        Buffer.from(ivText, 'base64')
    );
    decipher.setAuthTag(Buffer.from(tagText, 'base64'));
    return Buffer.concat([
        decipher.update(Buffer.from(ciphertextText, 'base64')),
        decipher.final(),
    ]).toString('utf8');
}

async function getSuperAdminSettings() {
    try {
        const setting = await PlatformSetting.findByPk(GEMINI_API_KEY_SETTING);
        if (setting) {
            return {
                gemini_api_key: decrypt(setting.encrypted_value) || null,
                is_database_setting: true,
            };
        }
        return {
            gemini_api_key: process.env.GEMINI_API_KEY || null,
            is_database_setting: false,
        };
    } catch (error) {
        console.error('Error retrieving Gemini API key setting:', error);
        throw error;
    }
}

async function setGeminiApiKey(apiKey) {
    try {
        await PlatformSetting.upsert({
            setting_key: GEMINI_API_KEY_SETTING,
            encrypted_value: encrypt(apiKey),
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving Gemini API key setting:', error);
        throw error;
    }
}

module.exports = {
    getSuperAdminSettings,
    setGeminiApiKey,
};
