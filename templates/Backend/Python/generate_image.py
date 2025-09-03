import os
from openai import OpenAI
import base64
from dotenv import load_dotenv
import sys

# Load API key from .env file
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("❌ No API key found!")
    sys.exit(1)

# Get prompt from command-line arguments
if len(sys.argv) < 2:
    print("No prompt provided")
    sys.exit(1)

prompt = sys.argv[1]

# Create OpenAI client
client = OpenAI(api_key=api_key)

# Generate image
result = client.images.generate(
    model="dall-e-3",
    prompt=prompt,
    size="1024x1024",
    quality="standard",
    n=1,
    response_format="b64_json"
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image
output_path = "Python/output_image.png"
with open(output_path, "wb") as f:
    f.write(image_bytes)

print(f"Image generated and saved to {output_path}")
