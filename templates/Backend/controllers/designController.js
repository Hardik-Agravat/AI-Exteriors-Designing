const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.generateImage = async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // ABSOLUTE path to Python script
  const pythonScriptPath = 'C:/Project Ai/templates/Backend/Python/generate_image.py';

  // Generate the command
  const command = `"C:/Users/HP/AppData/Local/Programs/Python/Python313/python.exe" "${pythonScriptPath}" "${prompt}"`;

  console.log('🧠 Executing Command:', command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('🐍 Python error:', stderr);
      return res.status(500).json({ error: 'Image generation failed', details: stderr });
    }

    // ABSOLUTE path to output image
    const imagePath = 'C:/Project Ai/templates/Backend/Python/output_image.png';

    // Read and send the image as base64
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error('🖼️ Image read error:', err);
        return res.status(500).json({ error: 'Failed to read image file' });
      }

      const base64Image = data.toString('base64');
      res.json({ image: base64Image });
    });
  });
};
