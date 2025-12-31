const express = require('express');
const { generateFoodPhotography, generateImageForMenuItem } = require('../controllers/foodPhotography.controller');
const router = express.Router();

// Route to parse menu text and generate images for all dishes
router.post('/generate', generateFoodPhotography);

// Route to generate an image for a single menu item
router.post('/generate-single', generateImageForMenuItem);

module.exports = router;
