const express = require('express');
const { getGeminiApiKey, setGeminiApiKey, testGeminiApiKey, clearGeminiApiKey } = require('../controllers/superadminSettings.controller');
const router = express.Router();

router.get('/gemini-api-key', getGeminiApiKey);
router.post('/gemini-api-key', setGeminiApiKey);
router.post('/gemini-api-key/test', testGeminiApiKey);
router.post('/gemini-api-key/clear', clearGeminiApiKey);

module.exports = router;
