const multer = require("multer");

// Use memory storage (stores file in memory buffer)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
