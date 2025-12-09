const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.generateImage = async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const referenceImage = req.file;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get the project root directory (two levels up from this file)
    const projectRoot = path.resolve(__dirname, '../../..');
    const pythonScriptPath = path.join(projectRoot, 'templates', 'Backend', 'Python', 'generate_image.py');
    const outputImagePath = path.join(projectRoot, 'templates', 'Backend', 'Python', 'output_image.png');

    // Find Python executable (try common locations)
    // First try environment variable, then common paths
    let pythonExecutable = process.env.PYTHON_PATH || 'python';
    
    // On Windows, try 'py' command first as it's the Python launcher
    if (process.platform === 'win32' && !process.env.PYTHON_PATH) {
      pythonExecutable = 'py';
    }

    // Escape prompt for command line - Windows needs different escaping
    // For Windows, we need to escape quotes differently
    let escapedPrompt = prompt;
    if (process.platform === 'win32') {
      // Windows: escape quotes by doubling them, and escape backslashes
      escapedPrompt = prompt.replace(/\\/g, '\\\\').replace(/"/g, '""');
    } else {
      // Unix: escape quotes and special characters
      escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');
    }
    
    // Build command with prompt - always quote paths and prompt
    const quoteIfNeeded = (str) => {
      // Always quote if it contains spaces or special characters
      if (str.includes(' ') || str.includes('&') || str.includes('|') || str.includes('(') || str.includes(')')) {
        return `"${str}"`;
      }
      return str;
    };
    
    let command = `${quoteIfNeeded(pythonExecutable)} ${quoteIfNeeded(pythonScriptPath)} "${escapedPrompt}"`;

    // If reference image is provided, save it temporarily and pass the path
    let tempImagePath = null;
    if (referenceImage) {
      const tempDir = path.join(projectRoot, 'templates', 'Backend', 'Python');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      tempImagePath = path.join(tempDir, `temp_reference_${Date.now()}.png`);
      fs.writeFileSync(tempImagePath, referenceImage.buffer);
      command = `${quoteIfNeeded(pythonExecutable)} ${quoteIfNeeded(pythonScriptPath)} "${escapedPrompt}" ${quoteIfNeeded(tempImagePath)}`;
    }

    console.log('🧠 Executing Command:', command);
    console.log('📁 Python script path:', pythonScriptPath);
    console.log('📁 Output image path:', outputImagePath);
    console.log('🐍 Python executable:', pythonExecutable);

    // Get .env file path to pass to Python
    const envFilePath = path.join(projectRoot, 'templates', 'Backend', '.env');
    console.log('🔑 .env file path:', envFilePath);
    console.log('🔑 .env file exists:', fs.existsSync(envFilePath));
    
    // Check if API key is loaded in Node.js
    const apiKeyFromEnv = process.env.OPENAI_API_KEY;
    if (apiKeyFromEnv) {
      console.log('✅ API key found in Node.js environment');
    } else {
      console.warn('⚠️ API key NOT found in Node.js environment');
      console.warn('⚠️ Make sure .env file exists and contains OPENAI_API_KEY');
    }

    // Prepare environment variables for Python
    const pythonEnv = {
      ...process.env,
      ENV_FILE_PATH: envFilePath, // Pass .env path as environment variable
    };
    
    // Pass API key if available
    if (apiKeyFromEnv) {
      pythonEnv.OPENAI_API_KEY = apiKeyFromEnv;
    }

    exec(command, { 
      maxBuffer: 10 * 1024 * 1024,
      env: pythonEnv
    }, (error, stdout, stderr) => {
      // Log all output for debugging
      console.log('📤 Python stdout:', stdout);
      if (stderr) {
        console.error('📥 Python stderr:', stderr);
      }

      // Clean up temporary reference image
      if (tempImagePath && fs.existsSync(tempImagePath)) {
        try {
          fs.unlinkSync(tempImagePath);
        } catch (cleanupErr) {
          console.error('Failed to cleanup temp image:', cleanupErr);
        }
      }

      if (error) {
        console.error('🐍 Python execution error:', error);
        console.error('🐍 Error code:', error.code);
        console.error('🐍 Error signal:', error.signal);
        
        // Check for specific error messages in stdout/stderr
        const output = (stdout || '') + (stderr || '');
        let errorMessage = 'Image generation failed';
        let errorDetails = output || error.message;
        
        // Check for billing limit error
        if (output.includes('billing_hard_limit') || output.includes('billing hard limit')) {
          errorMessage = 'Billing limit reached';
          errorDetails = 'Your OpenAI account has reached its billing limit. Please add credits to your account at https://platform.openai.com/account/billing';
        } else if (output.includes('insufficient_quota')) {
          errorMessage = 'Insufficient quota';
          errorDetails = 'Your OpenAI account has insufficient quota. Please add credits at https://platform.openai.com/account/billing';
        } else if (output.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded';
          errorDetails = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (output.includes('No API key found')) {
          errorMessage = 'API key not found';
          errorDetails = 'OpenAI API key not found. Please check your .env file.';
        }
        
        return res.status(500).json({ 
          error: errorMessage, 
          details: errorDetails,
          code: error.code
        });
      }

      // Check if output image exists
      if (!fs.existsSync(outputImagePath)) {
        console.error('🖼️ Output image not found at:', outputImagePath);
        console.error('📤 Python stdout was:', stdout);
        console.error('📥 Python stderr was:', stderr);
        return res.status(500).json({ 
          error: 'Generated image file not found',
          details: `Expected output at: ${outputImagePath}. Python output: ${stdout || stderr || 'No output'}`
        });
      }

      // Read and send the image as base64
      fs.readFile(outputImagePath, (err, data) => {
        if (err) {
          console.error('🖼️ Image read error:', err);
          return res.status(500).json({ error: 'Failed to read image file', details: err.message });
        }

        const base64Image = data.toString('base64');
        res.json({ image: base64Image });
      });
    });
  } catch (err) {
    console.error('❌ Controller error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
