const express = require('express');
const { getGeminiApiKey, testGeminiApiKey } = require('../controllers/superadminSettings.controller');
const router = express.Router();

router.get('/gemini-api-key', getGeminiApiKey);
router.post('/gemini-api-key/test', testGeminiApiKey);

module.exports = router;