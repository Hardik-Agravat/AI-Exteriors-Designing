import os
from openai import OpenAI
import base64
from dotenv import load_dotenv
import sys
from pathlib import Path

# Fix encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Load API key from .env file
# Try multiple locations and methods
api_key = None

# First, try to get from environment variable (passed from Node.js)
api_key = os.getenv("OPENAI_API_KEY")

# If not in environment, try to load from .env file
if not api_key:
    # Try to find .env file in multiple locations
    env_paths = [
        Path(__file__).parent.parent / '.env',  # templates/Backend/.env
        Path(__file__).parent.parent.parent / '.env',  # templates/.env
        Path(__file__).parent.parent.parent.parent / '.env',  # Project root/.env
    ]
    
    # Also try the path passed from Node.js
    env_file_path = os.getenv("ENV_FILE_PATH")
    if env_file_path:
        env_paths.insert(0, Path(env_file_path))

    env_loaded = False
    for env_path in env_paths:
        if env_path.exists():
            print(f"[INFO] Loading .env from: {env_path}")
            load_dotenv(env_path)
            env_loaded = True
            break
    
    if not env_loaded:
        print("[WARNING] .env file not found in expected locations, trying default...")
        load_dotenv()  # Try default location
    
    api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("[ERROR] No API key found! Please set OPENAI_API_KEY in .env file")
    print("[INFO] Make sure .env file is in templates/Backend/ directory")
    print("[INFO] .env file should contain: OPENAI_API_KEY=your_key_here")
    sys.exit(1)

print("[SUCCESS] API key loaded successfully")

# Get prompt from command-line arguments
if len(sys.argv) < 2:
    print("No prompt provided")
    sys.exit(1)

prompt = sys.argv[1]
reference_image_path = sys.argv[2] if len(sys.argv) > 2 else None

# Create OpenAI client
client = OpenAI(api_key=api_key)

try:
    print(f"[INFO] Prompt: {prompt}")
    print(f"[INFO] Reference image: {reference_image_path if reference_image_path else 'None'}")
    
    # Generate image with or without reference
    if reference_image_path and os.path.exists(reference_image_path):
        # If reference image is provided, use it
        print("[INFO] Using reference image to enhance prompt")
        # For DALL-E 3, we can't directly use reference images in the same way
        # Instead, we'll enhance the prompt with the reference
        # Note: DALL-E 3 doesn't support image-to-image directly
        # We'll generate based on enhanced prompt
        enhanced_prompt = f"{prompt}, based on the style and elements from the reference image"
        
        result = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
            response_format="b64_json"
        )
    else:
        # Generate image without reference
        print("[INFO] Generating image without reference")
        result = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
            response_format="b64_json"
        )

    print("[SUCCESS] Image generated successfully by OpenAI")
    
    if not result or not result.data or len(result.data) == 0:
        print("[ERROR] No image data returned from OpenAI")
        sys.exit(1)
    
    image_base64 = result.data[0].b64_json
    image_bytes = base64.b64decode(image_base64)

    # Get the script directory and save the image
    script_dir = Path(__file__).parent
    script_dir.mkdir(parents=True, exist_ok=True)  # Ensure directory exists
    output_path = script_dir / "output_image.png"
    
    with open(output_path, "wb") as f:
        f.write(image_bytes)

    print(f"[SUCCESS] Image saved to {output_path}")
    
except Exception as e:
    error_msg = str(e)
    error_type = type(e).__name__
    print(f"[ERROR] Error generating image: {error_type}: {error_msg}")
    
    # Provide more specific error messages
    if "billing_hard_limit" in error_msg.lower() or "billing hard limit" in error_msg.lower():
        print("[ERROR] BILLING LIMIT REACHED - Your OpenAI account has reached its billing limit.")
        print("[INFO] Solutions:")
        print("   1. Add credits to your OpenAI account at: https://platform.openai.com/account/billing")
        print("   2. Set up a payment method if you haven't already")
        print("   3. Wait for your billing cycle to reset (if applicable)")
        print("   4. Use a different API key with available credits")
    elif "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
        print("[INFO] This looks like an API key issue. Please check:")
        print("   1. Your OPENAI_API_KEY in .env file is correct")
        print("   2. The API key has not expired")
        print("   3. You have sufficient credits in your OpenAI account")
    elif "rate limit" in error_msg.lower():
        print("[INFO] Rate limit exceeded. Please wait a moment and try again.")
    elif "insufficient_quota" in error_msg.lower():
        print("[ERROR] Insufficient quota. Please check your OpenAI account billing.")
        print("[INFO] Add credits at: https://platform.openai.com/account/billing")
    
    sys.exit(1)
