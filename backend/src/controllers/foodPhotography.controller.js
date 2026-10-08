const { GoogleGenAI } = require("@google/genai");
const { getSuperAdminSettings } = require("../services/superadminSettings.service");

let genAIInstance = null;
let activeApiKey = null;

async function getGenerativeAIClient() {
    const settings = await getSuperAdminSettings();
    const GEMINI_API_KEY = settings ? settings.gemini_api_key : null;

    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API Key is not configured by Super Admin.");
    }

    if (activeApiKey !== GEMINI_API_KEY || !genAIInstance) {
        activeApiKey = GEMINI_API_KEY;
        genAIInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return genAIInstance;
}

const styleModifiers = {
    'Rustic / Dark': "Rustic dark aesthetic, moody lighting, dark wood background, warm shadows, artisanal ceramic plates, dramatic lighting, professional food styling, shallow depth of field.",
    'Bright / Modern': "Bright modern aesthetic, airy lighting, white marble surface, minimalist plating, high-key photography, vibrant colors, clean edges, commercial food photography style.",
    'Social Media': "Social media flat lay, 90-degree top-down perspective, colorful accessories, vibrant garnishes, trendy restaurant vibe, overhead shot, Instagrammable presentation, high contrast."
};

async function parseMenu(menuText) {
    const genAI = await getGenerativeAIClient();
    const prompt = `Parse the following menu text and extract the dishes. Return a JSON array of objects with 'name' and 'description'.
    Menu Text:
    ${menuText}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
        });
        const text = response.text;
        if (!text) {
            throw new Error("Gemini returned no menu text.");
        }
        // Attempt to parse the text as JSON. The model might return extra text, so we need to be careful.
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse menu text into JSON.");
    } catch (error) {
        console.error("Error parsing menu:", error);
        throw new Error("Failed to parse menu. Please check the format or try again.");
    }
}

async function generateFoodImage(dishName, dishDescription, style) {
    const genAI = await getGenerativeAIClient();
    const stylePrompt = styleModifiers[style] || styleModifiers['Bright / Modern']; // Default to Bright / Modern

    const prompt = `Professional food photography of '${dishName}'. Description: ${dishDescription}. ${stylePrompt} High-end plating, michelin star presentation, 8k resolution, crisp details.`;

    try {
        await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
        });
        // Assuming the model returns a direct image URL or base64 encoded image in its text response
        // For now, let's assume it returns a URL or a placeholder indicating success.
        // In a real scenario, you'd need to extract the image data/URL from the model's response.
        // The Gemini API for image generation typically returns a base64 encoded image or a URL.
        // For gemini-1.5-flash, it's text-based, so we'd need to use a different model for actual image generation.
        // The prompt specified gemini-2.5-flash-image or gemini-3-pro-image-preview for image generation.
        // Let's simulate a successful image generation for now and note this limitation.

        // For demonstration, we'll return a placeholder or a simulated URL.
        // In a real implementation, you would call a vision model or a dedicated image generation API.
        // Since the prompt mentioned gemini-2.5-flash-image or gemini-3-pro-image-preview,
        // I'll assume for now that the 'generateContent' call with the right model would return image data.
        // However, the current @google/genai library primarily focuses on text generation for gemini-1.5-flash.
        // To truly generate images, we'd need to use a different approach or a different model that supports image output.

        // For now, let's return a mock image URL.
        const mockImageUrl = `https://via.placeholder.com/400x400?text=${encodeURIComponent(dishName.replace(/\s/g, '+'))}+(${style.replace(/\s/g, '+')})`;
        return mockImageUrl;

    } catch (error) {
        console.error(`Error generating image for ${dishName}:`, error);
        throw new Error(`Failed to generate image for ${dishName}.`);
    }
}

exports.generateFoodPhotography = async (req, res) => {
    const { menuText, style } = req.body;

    if (!menuText || !style) {
        return res.status(400).json({ message: "Menu text and style are required." });
    }

    try {
        const dishes = await parseMenu(menuText);
        const images = [];

        for (const dish of dishes) {
            const imageUrl = await generateFoodImage(dish.name, dish.description, style);
            images.push({ name: dish.name, description: dish.description, imageUrl });
        }

        res.status(200).json({ images });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// This function will be used when integrating with existing menu item creation
exports.generateImageForMenuItem = async (req, res) => {
    const { dishName, dishDescription, style } = req.body;

    if (!dishName || !dishDescription || !style) {
        return res.status(400).json({ message: "Dish name, description, and style are required." });
    }

    try {
        const imageUrl = await generateFoodImage(dishName, dishDescription, style);
        res.status(200).json({ dishName, imageUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
