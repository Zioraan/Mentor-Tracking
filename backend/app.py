from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()  

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)