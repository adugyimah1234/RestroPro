const { getSuperAdminSettings, setGeminiApiKey } = require("../services/superadminSettings.service");

exports.getGeminiApiKey = async (req, res) => {
    try {
        const settings = await getSuperAdminSettings();
        res.status(200).json({
            configured: Boolean(settings.gemini_api_key),
            source: settings.gemini_api_key
                ? (settings.is_database_setting ? "database" : "environment")
                : null,
        });
    } catch (error) {
        console.error("Failed to retrieve Gemini API key status:", error);
        res.status(500).json({ message: "Failed to retrieve Gemini API key." });
    }
};

exports.setGeminiApiKey = async (req, res) => {
    const { gemini_api_key: apiKey } = req.body;
    if (typeof apiKey !== "string") {
        return res.status(400).json({ message: "A Gemini API key string is required." });
    }

    try {
        await setGeminiApiKey(apiKey.trim());
        res.status(200).json({
            message: apiKey.trim()
                ? "Gemini API key saved successfully."
                : "Gemini API key cleared successfully.",
            configured: Boolean(apiKey.trim()),
        });
    } catch (error) {
        console.error("Failed to save Gemini API key:", error);
        res.status(500).json({ message: error.message || "Failed to save Gemini API key." });
    }
};

exports.testGeminiApiKey = async (req, res) => {
    try {
        const settings = await getSuperAdminSettings();
        const GEMINI_API_KEY = settings.gemini_api_key;

        if (!GEMINI_API_KEY) {
            return res.status(400).json({ message: "No Gemini API key is configured." });
        }

        const verification = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models",
            { headers: { "x-goog-api-key": GEMINI_API_KEY } }
        );
        if (!verification.ok) {
            const invalidKey = [400, 401, 403].includes(verification.status);
            return res.status(invalidKey ? 400 : 502).json({
                message: invalidKey
                    ? "Gemini rejected the configured API key."
                    : "Gemini could not verify the API key right now.",
            });
        }

        res.status(200).json({ message: "Gemini API Key is valid." });
    } catch (error) {
        console.error("Error testing Gemini API key:", error);
        res.status(502).json({ message: "Unable to reach Gemini to test the API key." });
    }
};
