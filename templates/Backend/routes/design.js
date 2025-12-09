const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const designController = require('../controllers/designController');

router.post('/generate-image', upload.single('referenceImage'), designController.generateImage);

module.exports = router;
