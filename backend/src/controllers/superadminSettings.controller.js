const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/genai");
const { getSuperAdminSettings, setGeminiApiKey } = require("../services/superadminSettings.service");

exports.getGeminiApiKey = async (req, res) => {
    try {
        const settings = await getSuperAdminSettings();
        res.status(200).json({ gemini_api_key: settings.gemini_api_key });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve Gemini API key." });
    }
};

exports.setGeminiApiKey = async (req, res) => {
    // When using .env, the API key cannot be set programmatically.
    // The user must manually edit the .env file.
    return res.status(400).json({ message: "Gemini API key must be updated in the .env file." });
};

exports.testGeminiApiKey = async (req, res) => {
    try {
        const settings = await getSuperAdminSettings();
        const GEMINI_API_KEY = settings.gemini_api_key;

        if (!GEMINI_API_KEY) {
            return res.status(400).json({ message: "No Gemini API Key configured in .env." });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Attempt to list models to verify the API key
        await genAI.listModels(); 
        
        res.status(200).json({ message: "Gemini API Key is valid." });
    } catch (error) {
        console.error("Error testing Gemini API key:", error);
        res.status(500).json({ message: "Gemini API Key is invalid or an error occurred." });
    }
};

exports.clearGeminiApiKey = async (req, res) => {
    // When using .env, the API key cannot be cleared programmatically.
    // The user must manually edit the .env file.
    return res.status(400).json({ message: "Gemini API key must be cleared in the .env file." });
};