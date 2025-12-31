const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/genai");
const { getSuperAdminSettings, setGeminiApiKey } = require("../services/superadminSettings.service");

exports.getGeminiApiKey = async (req, res) => {
    try {
        const settings = await getSuperAdminSettings();
        res.status(200).json({ gemini_api_key: settings ? settings.gemini_api_key : null });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve Gemini API key." });
    }
};

exports.setGeminiApiKey = async (req, res) => {
    const { gemini_api_key } = req.body;

    if (!gemini_api_key) {
        return res.status(400).json({ message: "Gemini API key is required." });
    }

    try {
        await setGeminiApiKey(gemini_api_key);
        res.status(200).json({ message: "Gemini API key saved successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to save Gemini API key." });
    }
};

exports.testGeminiApiKey = async (req, res) => {
    try {
        const settings = await getSuperAdminSettings();
        const GEMINI_API_KEY = settings ? settings.gemini_api_key : null;

        if (!GEMINI_API_KEY) {
            return res.status(400).json({ message: "No Gemini API Key configured." });
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
    try {
        await setGeminiApiKey(null); // Assuming setGeminiApiKey can clear the key by setting it to null
        res.status(200).json({ message: "Gemini API key cleared successfully." });
    } catch (error) {
        console.error("Error clearing Gemini API key:", error);
        res.status(500).json({ message: "Failed to clear Gemini API key." });
    }
};
