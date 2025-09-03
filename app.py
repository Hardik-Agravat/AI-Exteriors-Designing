from flask import Flask, request, render_template, session, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from model import create_user, check_user_password, find_user  # make sure to add find_user in model.py
from diffusers import StableDiffusionPipeline
import torch
import os
import uuid

# === App setup ===
app = Flask(__name__)
app.secret_key = "your_secret_key_here"

# === Stable Diffusion setup ===
device = "cuda" if torch.cuda.is_available() else "cpu"
pipe = StableDiffusionPipeline.from_pretrained(
    "CompVis/stable-diffusion-v1-4",
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    safety_checker=None
).to(device)

# === Routes ===
@app.route('/')
def index():
    if 'username' in session:
        return render_template('index.html')
    return redirect(url_for('login'))

@app.route('/generate', methods=['POST'])
def generate():
    if 'username' not in session:
        return redirect(url_for('login'))
    prompt = request.form.get('prompt')
    if prompt:
        image = pipe(prompt).images[0]
        filename = f"{uuid.uuid4().hex}.png"
        image_path = os.path.join('static', filename)
        image.save(image_path)
        return render_template('index.html', image_path=image_path)
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if create_user(username, password):
            flash('Registered successfully!', 'success')
            return redirect(url_for('login'))
        else:
            flash('Username already exists!', 'error')
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Check if user exists
        user = find_user(username)
        if not user:
            flash('You are not registered. Please register first.', 'error')
            return render_template('login.html')

        # Check password
        if check_user_password(username, password):
            session['username'] = username
            return redirect(url_for('index'))
        else:
            flash('Incorrect password, please try again.', 'error')
            return render_template('login.html')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

# === Run ===
if __name__ == '__main__':
    app.run(debug=True)
