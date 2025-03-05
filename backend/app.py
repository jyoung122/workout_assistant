from collections import defaultdict
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import logging
import jwt as pyjwt
from google.auth.transport import requests
from google.oauth2 import id_token
from functools import wraps
from main import TIMEFRAME_MAP, extract_workout_data, insert_workout, fetch_workout_history, determine_muscle_activation, fetch_workouts_for_date

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load configuration
app.config.from_object('config')

# Initialize database
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Global dictionary to store conversation history for each user
conversation_history_store = defaultdict(list)

# Secret key for JWT
SECRET_KEY = "a3f9d92f6e2b3f8c4b7d6a2e5c9a3d8f2e7c6d5a4b8f9c0e3a5d7b6f2c9e8a1"


# Enable logging for API requests
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def get_db_connection():
    return db.engine.connect()

def authenticate_user(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            print("❌ Missing token in request!")  # Debugging
            return jsonify({"error": "Missing token"}), 401

        try:
            token = token.split("Bearer ")[-1]  # Ensure correct format
            decoded_token = pyjwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.google_id = decoded_token["google_id"]
            print("✅ User authenticated:", request.google_id)  # Debugging
        except pyjwt.ExpiredSignatureError:
            print("❌ Token expired!")  # Debugging
            return jsonify({"error": "Token expired"}), 401
        except pyjwt.InvalidTokenError:
            print("❌ Invalid token!")  # Debugging
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated_function

@app.route("/")
def home():
    return jsonify({"message": "Workout Assistant API is running!"})

@app.route("/login/google", methods=["POST"])
def google_login():
    data = request.get_json()
    if not data or "id_token" not in data:
        print("ERROR: Missing ID token in request:", data)  # Debugging
        return jsonify({"error": "Missing ID token"}), 400

    token = data["id_token"]
    print("Received Google ID token:", token[:20] + "...") 

    if not token:
        return jsonify({"error": "Missing ID token"}), 400

    try:
        client_id = "505754151265-4lscvjc5loinvbk7e03kbo8bpdkpnu4r.apps.googleusercontent.com"
        google_info = id_token.verify_oauth2_token(token, requests.Request(), client_id)
        google_id = google_info["sub"]
        email = google_info["email"]

        conn = get_db_connection()
        cur = conn.connection.cursor()
        cur.execute("SELECT google_id FROM users WHERE google_id = %s", (google_id,))
        user = cur.fetchone()

        if not user:
            cur.execute("INSERT INTO users (google_id, email, username, password_hash) VALUES (%s, %s, %s, %s)",
                        (google_id, email, email.split('@')[0], ""))
            conn.connection.commit()

        cur.close()
        conn.close()

        jwt_token = pyjwt.encode({"google_id": google_id}, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": jwt_token})

    except ValueError:
        return jsonify({"error": "Invalid Google ID token"}), 401

@app.route("/workouts", methods=["GET"])
@authenticate_user
def get_workouts():
    google_id = request.google_id
    conn = get_db_connection()
    cur = conn.connection.cursor()
    cur.execute("SELECT * FROM workouts WHERE google_id = %s", (google_id,))
    workouts = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(workouts)

@app.route("/workouts", methods=["POST"])
@authenticate_user
def log_workout():
    logging.info("Received POST request at /workouts")

    data = request.get_json()
    if not data or "description" not in data:
        return jsonify({"error": "Missing description"}), 400

    # ✅ Use Google ID instead of `user_id`
    google_id = request.google_id
    description = data["description"]

    # ✅ Retrieve (or create) the user's existing conversation history
    user_history = conversation_history_store.get(google_id, [])

    # ✅ Append the new user message to that history
    user_history.append({"role": "user", "content": description})

    # ✅ Use AI extraction function to parse workout details
    workout_data = extract_workout_data(description, user_history)

    # ✅ Extract details from AI output
    exercise_name = workout_data.get("exercise_name")
    weight = workout_data.get("weight")
    reps = workout_data.get("reps")
    desc = workout_data.get("description")

    # ✅ Store the updated conversation history for future AI calls
    conversation_history_store[google_id] = user_history

    # ✅ Call insert function (This function already exists)
    insert_workout(google_id, exercise_name, weight, reps, desc)

    return jsonify({"message": "Workout logged successfully", "data": workout_data}), 200

@app.route("/workouts/<date>", methods=["GET"])
@authenticate_user
def get_workouts_by_day(date):
    try:
        google_id = request.google_id
        conn = get_db_connection()
        cur = conn.connection.cursor()
        cur.execute(
            """
            SELECT exercise_name, reps, 1 as total_sets, weight, set_time as timestamp 
            FROM workouts 
            WHERE google_id = %s AND DATE(set_time) = %s
            ORDER BY set_time ASC
            """,
            (google_id, date),
        )
        workouts = cur.fetchall()
        cur.close()
        conn.close()

        if not workouts:
            return jsonify({"message": "No workouts found"}), 404

        return jsonify(
            [
                {
                    "exercise_name": row[0],
                    "total_reps": row[1],
                    "total_sets": row[2],
                    "weight": row[3],
                    "timestamp": row[4]
                }
                for row in workouts
            ]
        ), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/workouts/history/<timeframe>", methods=["GET"])
@authenticate_user
def get_workout_history(timeframe):
    """
    API endpoint to fetch the user's workout history based on timeframe.

    Args:
        timeframe (str): Time range ("1M", "3M", "6M", "9M", "12M", "ALL").

    Returns:
        JSON response with workout history.
    """
    google_id = request.google_id

    # Validate timeframe
    if timeframe not in TIMEFRAME_MAP.keys():
        return jsonify({"error": "Invalid timeframe. Use 1M, 3M, 6M, 9M, 12M, or ALL."}), 400

    try:
        history = fetch_workout_history(google_id, timeframe)
        return jsonify(history), 200

    except Exception as e:
        logging.error(f"Error fetching workout history: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/muscle-activation/<date>", methods=["GET"])
@authenticate_user
def get_muscle_activation(date):
    """API endpoint to fetch muscle activation for a given date."""
    google_id = request.google_id
    workouts = fetch_workouts_for_date(google_id, date)
    muscle_activation = determine_muscle_activation(workouts)
    return jsonify({"success": True, "muscleActivation": muscle_activation})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)