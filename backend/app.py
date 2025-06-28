from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os
import jwt
import datetime

load_dotenv()  

app = Flask(__name__)
CORS(app)

FLASK_APP_KEY = os.getenv("FLASK_APP_KEY")
if not FLASK_APP_KEY:
    raise ValueError("FLASK_APP_KEY is not set in the environment variables.")
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["4Geeks"]

@app.route('/')
def home():
    return "Flask backend is running!"

@app.route("/api/test-mongo")
def test_mongo():
    try:
        collections = db.list_collection_names()
        return jsonify(status="success", collections=collections), 200
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500
    
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")

    if not email or not password or not name:
        return jsonify(status="error", message="Missing required fields"), 400
    
    if db.users.find_one({"email": email}):
        return jsonify(status="error", message="Email already exists"), 400
    
    hashed_password = generate_password_hash(password)
    user = {
        "email": email,
        "password": hashed_password,
        "name": name,
        "is_authorized": False
    }
    db.Users.insert_one(user)
    return jsonify(status="success", message="User created successfully"), 201

@app.route("/api/login", methods=["POST"])
def login():
    data= request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = db.Users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify(status="error", message="Invalid email or password"), 401
    
    if not user["is_authorized"]:
        return jsonify(status="error", message="User is not yet authorized"), 403
    
    payload = {
        "email": user["email"],
        "name": user["name"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, FLASK_APP_KEY, algorithm="HS256")
    
    return jsonify(status="success", message="Login successful", token=token, user={"email": user["email"], "name": user["name"]}), 200

@app.route("/api/authorized", methods=["GET"])
def authorized():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify(status="error", message="Missing or invalid token"), 401
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, FLASK_APP_KEY, algorithms=["HS256"])
        user = db.Users.find_one({"email": payload["email"]})
        if not user:
            return jsonify(status="error", message="User not found"), 404
        if user["is_authorized"]:
            return jsonify(status="success", message="User is authorized", user={"email": user["email"], "name": user["name"]}), 200
    except jwt.ExpiredSignatureError:
        return jsonify(status="error", message="Token expired"), 401
    except jwt.InvalidTokenError:
        return jsonify(status="error", message="Invalid token"), 401    


if __name__ == '__main__':
    app.run(debug=True)