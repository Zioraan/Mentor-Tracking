from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os, jwt, datetime, uuid

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
        user["is_admin"] = payload.get("is_admin", False)
        return user, None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None, (jsonify(status="error", message="Invalid or expired token"), 401)


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
        "is_admin": False,
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
        "is_admin": user.get("is_admin", False),
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


# protected route to check if user is authorized
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

    # Add unique session_id to each session
    sessions_with_ids = []
    for session in data.get("sessions", []):
        session_with_id = {**session, "session_id": str(uuid.uuid4())}
        sessions_with_ids.append(session_with_id)

    student = {
        "name": data["name"],
        "first_session": data["first_session"],
        "sessions": sessions_with_ids,
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    result = students.insert_one(student)
    student["_id"] = str(result.inserted_id)

    session_date = student["first_session"]
    session_student = {
        "name": student["name"],
        "work_description": (
            student["sessions"][0]["work_description"] if student["sessions"] else ""
        ),
        "added_by": student["sessions"][0]["added_by"] if student["sessions"] else "",
    }
    sessions.update_one(
        {"date": session_date}, {"$push": {"students": session_student}}, upsert=True
    )
    return jsonify(status="success", student=student), 201


@app.route("/api/students/<student_id>", methods=["PUT"])
def update_student(student_id):
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    update_fields = {
        k: v for k, v in data.items() if k in ["name", "first_session", "sessions"]
    }

    # Add unique session_id to any sessions that don't have them
    if "sessions" in update_fields:
        sessions_with_ids = []
        for session in update_fields["sessions"]:
            if "session_id" not in session:
                session_with_id = {**session, "session_id": str(uuid.uuid4())}
            else:
                session_with_id = session
            sessions_with_ids.append(session_with_id)
        update_fields["sessions"] = sessions_with_ids
    old_student = students.find_one({"_id": ObjectId(student_id)})
    old_name = old_student["name"] if old_student else None
    result = students.update_one({"_id": ObjectId(student_id)}, {"$set": update_fields})
    if not result.matched_count:
        return jsonify(status="error", message="Student not found"), 404
    if "sessions" in update_fields and update_fields["sessions"]:
        if old_student and len(update_fields["sessions"]) > len(
            old_student.get("sessions", [])
        ):
            latest_session = update_fields["sessions"][-1]
            session_student = {
                "name": data["name"],
                "work_description": latest_session.get("work_description", ""),
                "added_by": latest_session.get("added_by", ""),
            }
            sessions.update_one(
                {"date": latest_session["date"]},
                {"$push": {"students": session_student}},
                upsert=True,
            )
    if old_name and "name" in update_fields and update_fields["name"] != old_name:
        sessions.update_many(
            {"students.name": old_name},
            {"$set": {"students.$[elem].name": update_fields["name"]}},
            array_filters=[{"elem.name": old_name}],
        )
    return jsonify(status="success"), 200


@app.route("/api/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    user, err = get_user_from_token()
    if err:
        return err
    student = students.find_one({"_id": ObjectId(student_id)})
    student_name = student["name"] if student else None
    result = students.delete_one({"_id": ObjectId(student_id)})
    if not result.deleted_count:
        return jsonify(status="error", message="Student not found"), 404
    if student_name:
        sessions.update_many({}, {"$pull": {"students": {"name": student_name}}})
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


@app.route("/api/students/<student_id>/sessions/<session_id>", methods=["PUT"])
def update_student_session(student_id, session_id):
    user, err = get_user_from_token()
    if err:
        return err

    data = request.get_json()
    update_fields = {
        k: v for k, v in data.items() if k in ["date", "work_description", "added_by"]
    }

    # Find the student
    student = students.find_one({"_id": ObjectId(student_id)})
    if not student:
        return jsonify(status="error", message="Student not found"), 404

    # Find and update the specific session
    sessions_array = student.get("sessions", [])
    session_found = False

    for i, session in enumerate(sessions_array):
        if session.get("session_id") == session_id:
            # Update only the specified fields
            for field, value in update_fields.items():
                sessions_array[i][field] = value
            session_found = True
            break

    if not session_found:
        return jsonify(status="error", message="Session not found"), 404

    # Update the student document with the modified sessions array
    result = students.update_one(
        {"_id": ObjectId(student_id)}, {"$set": {"sessions": sessions_array}}
    )

    if not result.matched_count:
        return jsonify(status="error", message="Failed to update session"), 500

    return jsonify(status="success"), 200


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
        "work_description": data["work_description"],
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    result = sessions.insert_one(session)
    session["_id"] = str(result.inserted_id)
    return jsonify(status="success", session=session), 201


@app.route("/api/sessions/<session_id>", methods=["PUT"])
def update_session(session_id):
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    update_fields = {
        k: v for k, v in data.items() if k in ["date", "student_id", "notes"]
    }
    result = sessions.update_one({"_id": ObjectId(session_id)}, {"$set": update_fields})
    if not result.matched_count:
        return jsonify(status="error", message="Session not found"), 404
    return jsonify(status="success"), 200


@app.route("/api/users", methods=["GET"])
def get_users():
    user, err = get_user_from_token()
    if err:
        return err
    if not user.get("is_admin", False):
        return jsonify(status="error", message="Forbidden: Admins only"), 403
    result = list(users.find({}, {"password": 0}))
    for u in result:
        u["_id"] = str(u["_id"])
    return jsonify(users=result), 200


@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    user, err = get_user_from_token()
    if err:
        return err
    if not user.get("is_admin", False):
        return jsonify(status="error", message="Forbidden: Admins only"), 403
    data = request.get_json()
    update_fields = {}
    for field in ["is_authorized", "is_admin"]:
        if field in data:
            update_fields[field] = data[field]
    if not update_fields:
        return jsonify(status="error", message="No valid fields to update"), 400
    result = users.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    if not result.matched_count:
        return jsonify(status="error", message="User not found"), 404
    return jsonify(status="success"), 200


@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    user, err = get_user_from_token()
    if err:
        return err
    if not user.get("is_admin", False):
        return jsonify(status="error", message="Forbidden: Admins only"), 403
    if str(user["_id"]) == user_id:
        return (
            jsonify(status="error", message="You cannot delete your own user account."),
            400,
        )
    result = users.delete_one({"_id": ObjectId(user_id)})
    if not result.deleted_count:
        return jsonify(status="error", message="User not found"), 404
    return jsonify(status="success"), 200


if __name__ == "__main__":
    app.run(debug=True)
