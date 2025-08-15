from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from classes import User, Student, Session, Day
import os, jwt, datetime, uuid

load_dotenv()
app = Flask(__name__)
CORS(app)

FLASK_APP_KEY = os.getenv("FLASK_APP_KEY")
MONGO_URI = os.getenv("MONGO_URI")
if not FLASK_APP_KEY or not MONGO_URI:
    raise ValueError("Missing FLASK_APP_KEY or MONGO_URI in environment.")

client = MongoClient(MONGO_URI)
db = client["MentorTracking"]
users = db.users
students = db.students
sessions = db.sessions
days = db.days


@app.route("/")
def home():
    return "Flask backend is running!"

#functioning properly
def get_user_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, (jsonify(status="error", message="Missing or invalid token"), 401)
    try:
        token = auth.split()[1]
        payload = jwt.decode(token, FLASK_APP_KEY, algorithms=["HS256"])
        user = users.find_one({"email": payload["email"]})
        if not user or not user.get("is_active"):
            return None, (jsonify(status="error", message="Unauthorized"), 403)
        return user, None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None, (jsonify(status="error", message="Invalid or expired token"), 401)

#functioning properly
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not all(data.get(key) for key in ("email", "password", "name")):
        return jsonify(status="error", message="Missing required fields"), 400
    if users.find_one({"email": data["email"]}):
        return jsonify(status="error", message="Email already exists"), 400
    data["password"] = generate_password_hash(data["password"])
    user = User.unserialize(data)
    created_user = user.serialize()
    if "_id" in created_user:
        del created_user["_id"]
    created_user["password"] = data["password"]
    users.insert_one(created_user)
    return jsonify(status="success", message="User created successfully"), 201

#functioning properly
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users.find_one({"email": data.get("email")})
    if not user or not check_password_hash(user["password"], data.get("password")):
        return jsonify(status="error", message="Invalid email or password"), 401
    if not user["is_active"]:
        return jsonify(status="error", message="User is not yet authorized"), 403
    found_user = User.unserialize(user)
    payload = found_user.serialize()
    token = jwt.encode(payload, FLASK_APP_KEY, algorithm="HS256")
    return (
        jsonify(
            status="success",
            message="Login successful",
            token=token,
            user={"payload": payload},
        ),
        200,
    )

#functioning properly
@app.route("/api/authorized", methods=["GET"])
def authorized():
    user, err = get_user_from_token()
    if err:
        return err
    if "password" in user:
        del user["password"]
    if "_id" in user:
        user["_id"] = str(user["_id"])
    return (
        jsonify(
            status="success",
            message="User is authorized",
            user=user,
        ),
        200,
    )

#functioning properly
@app.route("/api/students", methods=["GET"])
def get_students():
    user, err = get_user_from_token()
    if err:
        return err
    result = list(students.find({"active_cohorts.0": {"$exists": True}}))
    for student in result:
        student["_id"] = str(student["_id"])
    return jsonify(result)

#functioning properly
@app.route("/api/students", methods=["POST"])
def add_student():
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    required_fields = ["name", "email"]

    if not all(data.get(field) for field in required_fields):
        return jsonify(status="error", message="Missing required fields"), 400
    student_obj = Student.unserialize(data)
    student_doc = student_obj.serialize()
    if "_id" in student_doc:
        del student_doc["_id"]
    result = students.insert_one(student_doc)
    new_student = students.find_one({"_id": result.inserted_id})
    if new_student:
        if "_id" in new_student and new_student["_id"] is not None:
            new_student["_id"] = str(new_student["_id"])
    return jsonify(status="success", student=new_student), 201

# functioning properly
@app.route("/api/students/<student_id>", methods=["PUT"])
def update_student(student_id):
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    update_fields = {key: value for key, value in data.items() if key in ["name", "email"]}
    if not update_fields:
        return jsonify(status="error", message="No valid fields to update"), 400
    student_doc = students.find_one({"_id": ObjectId(student_id)})
    if not student_doc:
        return jsonify(status="error", message="Student not found"), 404
    student_obj = Student.unserialize(student_doc)
    for key, value in update_fields.items():
        setattr(student_obj, key, value)
    updated_doc = student_obj.serialize()
    if "_id" in updated_doc:
        del updated_doc["_id"]
    result = students.update_one({"_id": ObjectId(student_id)}, {"$set": updated_doc})
    if not result.matched_count:
        return jsonify(status="error", message="Student not found"), 404
    return jsonify(status="success"), 200

# Functioning Properly
@app.route("/api/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    user, err = get_user_from_token()
    if err:
        return err
    if not user.get("roles", {}).get("is_admin", False):
        return jsonify(status="error", message="Forbidden: Admins only"), 403
    student = students.find_one({"_id": ObjectId(student_id)})
    student_name = student["name"] if student else None
    if student:
        personal_session_ids = student.get("personal_sessions", [])
        for session_id in personal_session_ids:
            try:
                object_id = ObjectId(session_id)
            except Exception:
                object_id = session_id
            sessions.delete_one({"_id": object_id})
    result = students.delete_one({"_id": ObjectId(student_id)})
    if not result.deleted_count:
        return jsonify(status="error", message="Student not found"), 404
    if student_name:
        sessions.update_many({}, {"$pull": {"students": {"name": student_name}}})
    return jsonify(status="success"), 200

# Functioning properly
@app.route("/api/students/<student_id>", methods=["GET"])
def get_student(student_id):
    user, err = get_user_from_token()
    if err:
        return err
    student = students.find_one({"_id": ObjectId(student_id)})
    if not student:
        return jsonify(status="error", message="Student not found"), 404
    student["_id"] = str(student["_id"])

    session_ids = student.get("personal_sessions", [])
    session_objs = []
    for sid in session_ids:
        try:
            obj_id = ObjectId(sid)
        except Exception:
            obj_id = sid
        session_doc = sessions.find_one({"_id": obj_id})
        if session_doc:
            session_doc["_id"] = str(session_doc["_id"])
            session_objs.append(session_doc)
    student["personal_sessions"] = session_objs
    return jsonify(status="success", student=student), 200

# Functioning properly
@app.route("/api/sessions", methods=["GET"])
def get_sessions():
    user, err = get_user_from_token()
    if err:
        return err
    result = list(sessions.find())
    found_sessions = []
    for session in result:
        session["_id"] = str(session["_id"])
        found_sessions.append(session) 
    return jsonify(sessions=found_sessions), 200

# Functioning Properly
@app.route("/api/sessions", methods=["POST"])
def add_session():
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    required_fields = ["date", "student_id", "work_description", "type_of", "project"]
    if not all(data.get(field) for field in required_fields):
        return jsonify(status="error", message="Missing required fields"), 400
    student_doc = students.find_one({"_id": ObjectId(data["student_id"])})
    if not student_doc:
        return jsonify(status="error", message="Student not found"), 404

    session_data = {
        "type_of": data["type_of"],
        "date": data["date"],
        "project": data["project"],
        "work_description": data["work_description"],
        "student": {"id": str(student_doc["_id"]), "name": student_doc["name"]},
        "added_by": {"id": str(user["_id"]), "name": user["name"]}
    }
    session_obj = Session.unserialize(session_data)
    session_doc = session_obj.serialize()
    if "_id" in session_doc:
        del session_doc["_id"]
    result = sessions.insert_one(session_doc)
    session_id = str(result.inserted_id)

    student_obj = Student.unserialize(student_doc)
    if hasattr(student_obj, "add_session"):
        student_obj.add_session(session_id)
        updated_student_doc = student_obj.serialize()
        if "_id" in updated_student_doc:
            del updated_student_doc["_id"]
        students.update_one({"_id": ObjectId(data["student_id"])}, {"$set": updated_student_doc})
    else:
        students.update_one({"_id": ObjectId(data["student_id"])}, {"$push": {"personal_sessions": session_id}})

    session_obj._id = session_id  
    day_doc = days.find_one({"date": data["date"]})
    if day_doc:
        day_obj = Day.unserialize(day_doc)
    else:
        day_obj = Day(date=data["date"])
    day_obj.add_session_id(session_id, data["type_of"])
    day_serialized = day_obj.serialize()
    day_serialized.pop("_id", None)
    days.update_one(
        {"date": data["date"]},
        {"$set": day_serialized},
        upsert=True
    )

    new_session = sessions.find_one({"_id": result.inserted_id})
    if new_session and "_id" in new_session:
        new_session["_id"] = str(new_session["_id"])
    return jsonify(status="success", session=new_session), 201

#Functioning Properly
@app.route("/api/sessions/<session_id>", methods=["PUT"])
def update_session(session_id):
    user, err = get_user_from_token()
    if err:
        return err
    data = request.get_json()
    session_doc = sessions.find_one({"_id": ObjectId(session_id)})
    if not session_doc:
        return jsonify(status="error", message="Session not found"), 404
    user_id = str(user["_id"])
    is_admin = user.get("roles", {}).get("is_admin", False)
    added_by_id = str(session_doc.get("added_by", {}).get("id", ""))
    if user_id != added_by_id and not is_admin:
        return jsonify(status="error", message="Forbidden: Only session creator or admin can edit this session."), 403
    session_obj = Session.unserialize(session_doc)
    if "date" in data:
        session_obj.update_date(data["date"])
    if "type_of" in data:
        session_obj.update_type_of(data["type_of"])
    if "work_description" in data:
        session_obj.update_description(data["work_description"])
    if "project" in data:
        session_obj.update_project(data["project"])
    updated_session_doc = session_obj.serialize()
    if "_id" in updated_session_doc:
        del updated_session_doc["_id"]
    result = sessions.update_one({"_id": ObjectId(session_id)}, {"$set": updated_session_doc})
    if not result.matched_count:
        return jsonify(status="error", message="Session not found"), 404
    updated_session = sessions.find_one({"_id": ObjectId(session_id)})
    if updated_session and "_id" in updated_session:
        updated_session["_id"] = str(updated_session["_id"])
    return jsonify(status="success", session=updated_session), 200

# Functioning Properly
@app.route("/api/users", methods=["GET"])
def get_users():
    user, err = get_user_from_token()
    if err:
        return err
    if not user.get("roles", {}).get("is_admin", False):
        return jsonify(status="error", message="Forbidden: Admins only"), 403
    result = list(users.find({}, {"password": 0}))
    for u in result:
        u["_id"] = str(u["_id"])
    return jsonify(users=result), 200

# Functioning Properly
@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    user, err = get_user_from_token()
    if err:
        return err
    if not user.get("roles", {}).get("is_admin", False):
        return jsonify(status="error", message="Forbidden: Admins only"), 403
    data = request.get_json()
    user_doc = users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        return jsonify(status="error", message="User not found"), 404
    user_obj = User.unserialize(user_doc)
    if "role" in data:
        role_key = data["role"]
        if role_key in user_obj.roles:
            user_obj.toggle_role(role_key)
        else:
            return jsonify(status="error", message=f"Role '{role_key}' not recognized"), 400
    elif "program" in data:
        program_key = data["program"]
        if program_key in user_obj.programs:
            user_obj.toggle_program(program_key)
        else:
            return jsonify(status="error", message=f"Program '{program_key}' not recognized"), 400
    elif "is_active" in data:
        user_obj.set_active()
    else:
        return jsonify(status="error", message="No valid field to update"), 400
    updated_user_doc = user_obj.serialize()
    if "_id" in updated_user_doc:
        del updated_user_doc["_id"]
    result = users.update_one({"_id": ObjectId(user_id)}, {"$set": updated_user_doc})
    if not result.matched_count:
        return jsonify(status="error", message="User not found"), 404
    return jsonify(status="success"), 200

# Functioning Properly
@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    user, err = get_user_from_token()
    if err:
        return err
    if not user.get("roles", {}).get("is_admin", False):
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

@app.route("/api/days", methods=["GET"])
def get_days():
    user, err = get_user_from_token()
    if err:
        return err
    days_list = list(days.find())
    for day in days_list:
        day["_id"] = str(day["_id"])
        # Populate global_sessions with full session docs
        global_sessions_full = []
        for sid in day.get("global_sessions", []):
            try:
                obj_id = ObjectId(sid)
            except Exception:
                obj_id = sid
            session_doc = sessions.find_one({"_id": obj_id})
            if session_doc:
                session_doc["_id"] = str(session_doc["_id"])
                global_sessions_full.append(session_doc)
        day["global_sessions"] = global_sessions_full

        # Populate private_sessions with full session docs
        private_sessions_full = []
        for sid in day.get("private_sessions", []):
            try:
                obj_id = ObjectId(sid)
            except Exception:
                obj_id = sid
            session_doc = sessions.find_one({"_id": obj_id})
            if session_doc:
                session_doc["_id"] = str(session_doc["_id"])
                private_sessions_full.append(session_doc)
        day["private_sessions"] = private_sessions_full

    return jsonify(status="success", days=days_list), 200


    


if __name__ == "__main__":
    app.run(debug=True)
