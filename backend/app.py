from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os, jwt, datetime

load_dotenv()
app = Flask(__name__)
CORS(app)

FLASK_APP_KEY = os.getenv("FLASK_APP_KEY")
MONGO_URI = os.getenv("MONGO_URI")
if not FLASK_APP_KEY or not MONGO_URI:
    raise ValueError("Missing FLASK_APP_KEY or MONGO_URI in environment.")

client = MongoClient(MONGO_URI)
db = client["4Geeks"]
users = db.users
students = db.students
sessions = db.sessions


@app.route("/")
def home():
    return "Flask backend is running!"


# --- Auth Helpers ---
def get_user_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, (jsonify(status="error", message="Missing or invalid token"), 401)
    try:
        token = auth.split()[1]
        payload = jwt.decode(token, FLASK_APP_KEY, algorithms=["HS256"])
        user = users.find_one({"email": payload["email"]})
        if not user or not user.get("is_authorized"):
            return None, (jsonify(status="error", message="Unauthorized"), 403)
        return user, None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None, (jsonify(status="error", message="Invalid or expired token"), 401)


# --- Auth Routes ---
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not all(data.get(k) for k in ("email", "password", "name")):
        return jsonify(status="error", message="Missing required fields"), 400
    if users.find_one({"email": data["email"]}):
        return jsonify(status="error", message="Email already exists"), 400
    user = {
        "email": data["email"],
        "password": generate_password_hash(data["password"]),
        "name": data["name"],
        "is_authorized": False,
    }
    users.insert_one(user)
    return jsonify(status="success", message="User created successfully"), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users.find_one({"email": data.get("email")})
    if not user or not check_password_hash(user["password"], data.get("password")):
        return jsonify(status="error", message="Invalid email or password"), 401
    if not user["is_authorized"]:
        return jsonify(status="error", message="User is not yet authorized"), 403
    payload = {
        "email": user["email"],
        "name": user["name"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    }
    token = jwt.encode(payload, FLASK_APP_KEY, algorithm="HS256")
    return (
        jsonify(
            status="success",
            message="Login successful",
            token=token,
            user={"email": user["email"], "name": user["name"]},
        ),
        200,
    )


@app.route("/api/authorized", methods=["GET"])
def authorized():
    user, err = get_user_from_token()
    if err:
        return err
    return (
        jsonify(
            status="success",
            message="User is authorized",
            user={"email": user["email"], "name": user["name"]},
        ),
        200,
    )


# --- Student Routes ---
@app.route("/api/students", methods=["GET"])
def get_students():
    user, err = get_user_from_token()
    if err:
        return err
    result = list(students.find())
    for s in result:
        s["_id"] = str(s["_id"])
    return jsonify(result)


@app.route("/api/students", methods=["POST"])
def add_student():
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    if not data.get("name") or not data.get("first_session"):
        return jsonify(status="error", message="Missing required fields"), 400
    student = {
        "name": data["name"],
        "first_session": data["first_session"],
        "sessions": data.get("sessions", []),
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    result = students.insert_one(student)
    student["_id"] = str(result.inserted_id)

    # Add to sessions collection
    session_date = student["first_session"]
    session_student = {
        "name": student["name"],
        "work_description": student["sessions"][0]["work_description"] if student["sessions"] else "",
        "added_by": student["sessions"][0]["added_by"] if student["sessions"] else "",
    }
    sessions.update_one(
        {"date": session_date},
        {"$push": {"students": session_student}},
        upsert=True
    )
    return jsonify(status="success", student=student), 201


@app.route("/api/students/<student_id>", methods=["PUT"])
def update_student(student_id):
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    update_fields = {
        k: v
        for k, v in data.items()
        if k in ["name", "first_session", "sessions"]
    }
    # Get the old student name before update
    old_student = students.find_one({"_id": ObjectId(student_id)})
    old_name = old_student["name"] if old_student else None
    result = students.update_one({"_id": ObjectId(student_id)}, {"$set": update_fields})
    if not result.matched_count:
        return jsonify(status="error", message="Student not found"), 404
    # If sessions updated, update sessions collection (only if a new session is added)
    if "sessions" in update_fields and update_fields["sessions"]:
        # Check if a new session was added (by comparing lengths)
        if old_student and len(update_fields["sessions"]) > len(old_student.get("sessions", [])):
            latest_session = update_fields["sessions"][-1]
            session_student = {
                "name": data["name"],
                "work_description": latest_session.get("work_description", ""),
                "added_by": latest_session.get("added_by", ""),
            }
            sessions.update_one(
                {"date": latest_session["date"]},
                {"$push": {"students": session_student}},
                upsert=True
            )
    # If name changed, update all session entries with old name (do not push new entry)
    if old_name and "name" in update_fields and update_fields["name"] != old_name:
        sessions.update_many(
            {"students.name": old_name},
            {"$set": {"students.$[elem].name": update_fields["name"]}},
            array_filters=[{"elem.name": old_name}]
        )
    return jsonify(status="success"), 200


@app.route("/api/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    user, err = get_user_from_token()
    if err:
        return err
    # Get the student name before deleting
    student = students.find_one({"_id": ObjectId(student_id)})
    student_name = student["name"] if student else None
    result = students.delete_one({"_id": ObjectId(student_id)})
    if not result.deleted_count:
        return jsonify(status="error", message="Student not found"), 404
    # Remove student from all sessions
    if student_name:
        sessions.update_many(
            {},
            {"$pull": {"students": {"name": student_name}}}
        )
    return jsonify(status="success"), 200


@app.route("/api/students/<student_id>", methods=["GET"])
def get_student(student_id):
    user, err = get_user_from_token()
    if err:
        return err
    student = students.find_one({"_id": ObjectId(student_id)})
    if not student:
        return jsonify(status="error", message="Student not found"), 404
    student["_id"] = str(student["_id"])
    return jsonify(status="success", student=student), 200


# --- Session Routes ---
@app.route("/api/sessions", methods=["GET"])
def get_sessions():
    user, err = get_user_from_token()
    if err:
        return err
    result = list(sessions.find())
    for s in result:
        s["_id"] = str(s["_id"])
    return jsonify(result)


@app.route("/api/sessions", methods=["POST"])
def add_session():
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    if not data.get("date") or not data.get("student_id"):
        return jsonify(status="error", message="Missing required fields"), 400
    session = {
        "date": data["date"],
        "student_id": data["student_id"],
        "notes": data.get("notes"),
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    result = sessions.insert_one(session)
    session["_id"] = str(result.inserted_id)
    return jsonify(status="success", session=session), 201


if __name__ == "__main__":
    app.run(debug=True)
