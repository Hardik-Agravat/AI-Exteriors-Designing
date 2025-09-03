from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

# === MongoDB setup ===
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    client.server_info()  # Test the connection
except Exception as e:
    raise RuntimeError(f"Error connecting to MongoDB: {e}")

db = client['user_database']
users_collection = db['users']

# Create a unique index on username so duplicates won't be allowed
users_collection.create_index('username', unique=True)

# === Functions for user management ===

def create_user(username: str, password: str) -> bool:
    """
    Create a new user with hashed password.
    Returns True if successful, False if username already exists.
    """
    if users_collection.find_one({"username": username}):
        return False  # username taken
    password_hash = generate_password_hash(password)
    users_collection.insert_one({"username": username, "password_hash": password_hash})
    return True

def find_user(username: str):
    return users_collection.find_one({"username": username})


def check_user_password(username: str, password: str) -> bool:
    """
    Check if the provided password matches the user's hashed password.
    Returns True if correct, False otherwise.
    """
    user = find_user(username)
    if not user:
        return False
    return check_password_hash(user['password_hash'], password)
