const express = require('express');
const router = express.Router();
const multer = require('multer');
const designController = require('../controllers/designController');

const upload = multer();

router.post('/generate-image', upload.single('referenceImage'), designController.generateImage);

module.exports = router;
