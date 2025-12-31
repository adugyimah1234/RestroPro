// const { getMySqlPromiseConnection } = require("../config/mysql.db"); // No longer needed

async function getSuperAdminSettings() {
    try {
        const gemini_api_key = process.env.GEMINI_API_KEY || null;
        return { gemini_api_key };
    } catch (error) {
        console.error("Error fetching super admin settings from .env:", error);
        throw error;
    }
}

async function setGeminiApiKey(apiKey) {
    // When using .env, the API key cannot be set programmatically.
    // The user must manually edit the .env file.
    console.warn("Attempted to set Gemini API key programmatically. Please update the .env file manually.");
    return { success: true, message: "Gemini API key must be updated in the .env file." };
}

module.exports = {
    getSuperAdminSettings,
    setGeminiApiKey,
};