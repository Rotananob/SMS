from flask import Flask, request, jsonify, render_template
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime, date
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
app.config["SECRET_KEY"] = "sms-secret-key"
app.config["JWT_SECRET_KEY"] = "jwt-secret-key"

# Initialize Firebase
if not firebase_admin.get_app():
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

bcrypt = Bcrypt(app)
jwt    = JWTManager(app)
CORS(app)

# ─── Firestore Collections ────────────────────────────────────────────────────

USERS_COL = "users"
STUDENTS_COL = "students"
COURSES_COL = "courses"
ENROLLMENTS_COL = "enrollments"
ATTENDANCE_COL = "attendance"
GRADES_COL = "grades"
NOTIFICATIONS_COL = "notifications"

# ─── Helpers ──────────────────────────────────────────────────────────────────

def letter_grade(total):
    if total >= 90: return "A+"
    if total >= 85: return "A"
    if total >= 80: return "A-"
    if total >= 75: return "B+"
    if total >= 70: return "B"
    if total >= 65: return "B-"
    if total >= 60: return "C+"
    if total >= 55: return "C"
    if total >= 50: return "D"
    return "F"

# ─── SPA ──────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")

# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    
    # Query Firestore for user
    users = db.collection(USERS_COL).where("username", "==", data.get("username")).stream()
    user = None
    user_id = None
    for doc in users:
        user = doc.to_dict()
        user_id = doc.id
        break
    
    if not user or not bcrypt.check_password_hash(user["password"], data.get("password", "")):
        return jsonify({"error": "Invalid credentials"}), 401
    
    token = create_access_token(identity={"id": user_id, "role": user["role"], "username": user["username"]})
    return jsonify({"token": token, "role": user["role"], "username": user["username"], "id": user_id})

@app.route("/api/auth/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()
    user_doc = db.collection(USERS_COL).document(identity["id"]).get()
    if not user_doc.exists:
        return jsonify({"error": "User not found"}), 404
    user = user_doc.to_dict()
    return jsonify({"id": identity["id"], "username": user["username"], "email": user["email"], "role": user["role"]})

# ─── Students ─────────────────────────────────────────────────────────────────

@app.route("/api/students", methods=["GET"])
@jwt_required()
def get_students():
    students = db.collection(STUDENTS_COL).stream()
    return jsonify([{**s.to_dict(), "id": s.id} for s in students])

@app.route("/api/students", methods=["POST"])
@jwt_required()
def create_student():
    data = request.get_json()
    student_data = {
        "user_id": data["user_id"],
        "student_id": data["student_id"],
        "full_name": data["full_name"],
        "gender": data.get("gender"),
        "phone": data.get("phone"),
        "major": data.get("major"),
        "year": data.get("year", 1),
        "status": "active",
        "created_at": datetime.utcnow()
    }
    if data.get("dob"):
        student_data["dob"] = datetime.strptime(data["dob"], "%Y-%m-%d").date()
    
    _, doc_ref = db.collection(STUDENTS_COL).add(student_data)
    return jsonify({"id": doc_ref.id}), 201

@app.route("/api/students/<sid>", methods=["GET"])
@jwt_required()
def get_student(sid):
    s = db.collection(STUDENTS_COL).document(sid).get()
    if not s.exists:
        return jsonify({"error": "Student not found"}), 404
    return jsonify({**s.to_dict(), "id": s.id})

@app.route("/api/students/<sid>", methods=["PUT"])
@jwt_required()
def update_student(sid):
    s = db.collection(STUDENTS_COL).document(sid).get()
    if not s.exists:
        return jsonify({"error": "Student not found"}), 404
    
    data = request.get_json()
    update_data = {}
    for f in ["full_name", "gender", "phone", "address", "major", "year", "status"]:
        if f in data:
            update_data[f] = data[f]
    if data.get("dob"):
        update_data["dob"] = datetime.strptime(data["dob"], "%Y-%m-%d").date()
    
    db.collection(STUDENTS_COL).document(sid).update(update_data)
    return jsonify({"message": "Updated"})

@app.route("/api/students/<sid>", methods=["DELETE"])
@jwt_required()
def delete_student(sid):
    db.collection(STUDENTS_COL).document(sid).delete()
    return jsonify({"message": "Deleted"})

# ─── Courses ──────────────────────────────────────────────────────────────────

@app.route("/api/courses", methods=["GET"])
@jwt_required()
def get_courses():
    courses = db.collection(COURSES_COL).stream()
    return jsonify([{**c.to_dict(), "id": c.id} for c in courses])

@app.route("/api/courses", methods=["POST"])
@jwt_required()
def create_course():
    data = request.get_json()
    course_data = {
        "code": data["code"],
        "name": data["name"],
        "description": data.get("description"),
        "credits": data.get("credits", 3),
        "teacher_id": data.get("teacher_id"),
        "schedule": data.get("schedule"),
        "room": data.get("room"),
        "max_students": data.get("max_students", 40),
        "semester": data.get("semester"),
        "year": data.get("year"),
        "created_at": datetime.utcnow()
    }
    _, doc_ref = db.collection(COURSES_COL).add(course_data)
    return jsonify({"id": doc_ref.id}), 201

@app.route("/api/courses/<cid>", methods=["PUT"])
@jwt_required()
def update_course(cid):
    c = db.collection(COURSES_COL).document(cid).get()
    if not c.exists:
        return jsonify({"error": "Course not found"}), 404
    data = request.get_json()
    db.collection(COURSES_COL).document(cid).update(data)
    return jsonify({"message": "Updated"})

@app.route("/api/courses/<cid>", methods=["DELETE"])
@jwt_required()
def delete_course(cid):
    db.collection(COURSES_COL).document(cid).delete()
    return jsonify({"message": "Deleted"})

# ─── Enrollments ──────────────────────────────────────────────────────────────

@app.route("/api/enrollments", methods=["GET"])
@jwt_required()
def get_enrollments():
    enrollments = db.collection(ENROLLMENTS_COL).stream()
    return jsonify([{**e.to_dict(), "id": e.id} for e in enrollments])

@app.route("/api/enrollments", methods=["POST"])
@jwt_required()
def enroll():
    data = request.get_json()
    enrollment_data = {
        "student_id": data["student_id"],
        "course_id": data["course_id"],
        "enrolled_at": datetime.utcnow(),
        "status": "enrolled"
    }
    _, doc_ref = db.collection(ENROLLMENTS_COL).add(enrollment_data)
    return jsonify({"id": doc_ref.id}), 201

# ─── Attendance ───────────────────────────────────────────────────────────────

@app.route("/api/attendance", methods=["GET"])
@jwt_required()
def get_attendance():
    query = db.collection(ATTENDANCE_COL)
    if request.args.get("course_id"):
        query = query.where("course_id", "==", request.args["course_id"])
    if request.args.get("student_id"):
        query = query.where("student_id", "==", request.args["student_id"])
    if request.args.get("date"):
        att_date = datetime.strptime(request.args["date"], "%Y-%m-%d").date()
        query = query.where("date", "==", att_date)
    
    attendance = query.stream()
    return jsonify([{**a.to_dict(), "id": a.id} for a in attendance])

@app.route("/api/attendance", methods=["POST"])
@jwt_required()
def mark_attendance():
    data = request.get_json()
    rows = data if isinstance(data, list) else [data]
    
    for row in rows:
        att_date = datetime.strptime(row.get("date", str(date.today())), "%Y-%m-%d").date()
        
        existing = db.collection(ATTENDANCE_COL).where(
            "student_id", "==", row["student_id"]
        ).where(
            "course_id", "==", row["course_id"]
        ).where(
            "date", "==", att_date
        ).stream()
        
        existing_doc = None
        for doc in existing:
            existing_doc = doc
            break
        
        attendance_data = {
            "student_id": row["student_id"],
            "course_id": row["course_id"],
            "date": att_date,
            "status": row.get("status", "present"),
            "note": row.get("note", "")
        }
        
        if existing_doc:
            db.collection(ATTENDANCE_COL).document(existing_doc.id).update(attendance_data)
        else:
            db.collection(ATTENDANCE_COL).add(attendance_data)
    
    return jsonify({"message": "Saved"}), 201

# ─── Grades ───────────────────────────────────────────────────────────────────

@app.route("/api/grades", methods=["GET"])
@jwt_required()
def get_grades():
    query = db.collection(GRADES_COL)
    if request.args.get("course_id"):
        query = query.where("course_id", "==", request.args["course_id"])
    if request.args.get("student_id"):
        query = query.where("student_id", "==", request.args["student_id"])
    
    grades = query.stream()
    return jsonify([{**g.to_dict(), "id": g.id} for g in grades])

@app.route("/api/grades", methods=["POST"])
@jwt_required()
def save_grade():
    data = request.get_json()
    
    existing = db.collection(GRADES_COL).where(
        "student_id", "==", data["student_id"]
    ).where(
        "course_id", "==", data["course_id"]
    ).stream()
    
    existing_doc = None
    existing_id = None
    for doc in existing:
        existing_doc = doc
        existing_id = doc.id
        break
    
    assignment = data.get("assignment", 0)
    midterm = data.get("midterm", 0)
    final = data.get("final", 0)
    total = assignment + midterm + final
    
    grade_data = {
        "student_id": data["student_id"],
        "course_id": data["course_id"],
        "assignment": assignment,
        "midterm": midterm,
        "final": final,
        "total": total,
        "letter": letter_grade(total)
    }
    
    if existing_doc:
        db.collection(GRADES_COL).document(existing_id).update(grade_data)
        return jsonify({"id": existing_id, "total": total, "letter": letter_grade(total)}), 201
    else:
        _, doc_ref = db.collection(GRADES_COL).add(grade_data)
        return jsonify({"id": doc_ref.id, "total": total, "letter": letter_grade(total)}), 201

# ─── Reports ──────────────────────────────────────────────────────────────────

@app.route("/api/reports/summary", methods=["GET"])
@jwt_required()
def report_summary():
    students = list(db.collection(STUDENTS_COL).stream())
    courses = list(db.collection(COURSES_COL).stream())
    enrollments = list(db.collection(ENROLLMENTS_COL).stream())
    
    grades = list(db.collection(GRADES_COL).stream())
    attendance_all = list(db.collection(ATTENDANCE_COL).stream())
    attendance_present = [doc for doc in attendance_all if doc.to_dict().get("status") == "present"]
    
    average_score = 0
    if grades:
        total_grades = sum(doc.to_dict().get("total", 0) for doc in grades)
        average_score = round(total_grades / len(grades), 2)
    
    attendance_rate = 0
    if attendance_all:
        attendance_rate = round((len(attendance_present) / len(attendance_all)) * 100, 1)
    
    return jsonify({
        "total_students": len(students),
        "total_courses": len(courses),
        "total_enrollments": len(enrollments),
        "average_score": average_score,
        "attendance_rate": attendance_rate
    })

# ─── Notifications ────────────────────────────────────────────────────────────

@app.route("/api/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    role = get_jwt_identity()["role"]
    query = db.collection(NOTIFICATIONS_COL).where(
        "target", "in", ["all", role]
    ).order_by("created_at", direction=firestore.Query.DESCENDING)
    
    notifications = query.stream()
    return jsonify([{**n.to_dict(), "id": n.id} for n in notifications])

@app.route("/api/notifications", methods=["POST"])
@jwt_required()
def create_notification():
    data = request.get_json()
    notification_data = {
        "title": data["title"],
        "message": data["message"],
        "target": data.get("target", "all"),
        "author_id": get_jwt_identity()["id"],
        "created_at": datetime.utcnow()
    }
    _, doc_ref = db.collection(NOTIFICATIONS_COL).add(notification_data)
    return jsonify({"id": doc_ref.id}), 201

@app.route("/api/notifications/<nid>", methods=["DELETE"])
@jwt_required()
def delete_notification(nid):
    db.collection(NOTIFICATIONS_COL).document(nid).delete()
    return jsonify({"message": "Deleted"})

# ─── Init ─────────────────────────────────────────────────────────────────────

def seed_admin():
    """Create default admin user if not exists"""
    admins = db.collection(USERS_COL).where("username", "==", "admin").stream()
    
    admin_exists = False
    for _ in admins:
        admin_exists = True
        break
    
    if not admin_exists:
        pw = bcrypt.generate_password_hash("admin123").decode("utf-8")
        db.collection(USERS_COL).add({
            "username": "admin",
            "email": "admin@sms.edu",
            "password": pw,
            "role": "admin",
            "created_at": datetime.utcnow()
        })
        print("Default admin  ->  admin / admin123")

if __name__ == "__main__":
    seed_admin()
    app.run(debug=True, port=5000)
