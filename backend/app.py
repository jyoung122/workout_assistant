from collections import defaultdict
from datetime import datetime
import json
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import logging
import jwt as pyjwt
from google.auth.transport import requests
from google.oauth2 import id_token
from functools import wraps

import psycopg2
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

logger = logging.getLogger(__name__)

def get_db_connection():
    """Establishes and returns a connection to the Google Cloud SQL PostgreSQL database."""
    try:
        logging.info("🌐 Attempting to connect to Google Cloud SQL PostgreSQL...")

        # Connection details (Using your actual details from the previous logs)
        db_user = "postgres"  # Your Cloud SQL username
        db_password = "1845"  # Securely fetch from environment variable
        db_name = "postgres"  # Your database name in Cloud SQL
        db_host = "35.193.103.85"  # Your Cloud SQL Public IP

        # Connect to the database
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=5432
        )

        logging.info("✅ Successfully connected to Google Cloud SQL!")
        return conn

    except psycopg2.Error as e:
        logging.error(f"❌ Database connection failed: {e}")
        return None

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
        cur = conn.cursor()
        cur.execute("SELECT google_id FROM users WHERE google_id = %s", (google_id,))
        user = cur.fetchone()

        if not user:
            cur.execute("INSERT INTO users (google_id, email, username) VALUES (%s, %s, %s)",
            (google_id, email, email.split('@')[0]))
            conn.commit()

        cur.close()
        conn.close()

        jwt_token = pyjwt.encode({"google_id": google_id}, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": jwt_token})

    except ValueError:
        return jsonify({"error": "Invalid Google ID token"}), 401

# @app.route("/workouts", methods=["GET"])
# @authenticate_user
# def get_workouts():
#     google_id = request.google_id
#     conn = get_db_connection()
#     cur = conn.connection.cursor()
#     cur.execute("SELECT * FROM workouts WHERE google_id = %s", (google_id,))
#     workouts = cur.fetchall()
#     cur.close()
#     conn.close()
#     return jsonify(workouts)

@app.route("/workouts", methods=["POST"])
@authenticate_user
def log_workout():
    logging.info("Received POST request at /workouts")

    data = request.get_json()
    if not data or "description" not in data:
        return jsonify({"error": "Missing description"}), 400

    google_id = request.google_id
    description = data["description"]

    # ✅ Retrieve user history for AI context
    user_history = conversation_history_store.get(google_id, [])
    user_history.append({"role": "user", "content": description})

    # ✅ Extract workout details
    workout_data = extract_workout_data(description, user_history)

    exercise_name = workout_data.get("exercise_name")
    weight = workout_data.get("weight")
    reps = workout_data.get("reps")
    desc = workout_data.get("description")

    # ✅ Determine muscle activation before inserting
    muscle_activation = determine_muscle_activation([{"exercise_name": exercise_name}])
    
    # ✅ Store conversation history
    conversation_history_store[google_id] = user_history

    # ✅ Insert workout into the database with muscle activation
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO workouts (google_id, exercise_name, reps, weight, description, muscle_activation)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (google_id, exercise_name, reps, weight, desc, json.dumps(muscle_activation))
    )

    workout_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    logging.info(f"✅ Workout logged successfully (ID: {workout_id}) with muscle activation: {muscle_activation}")

    return jsonify({"message": "Workout logged successfully", "data": workout_data, "muscle_activation": muscle_activation}), 200

@app.route("/workouts/<date>", methods=["GET"])
@authenticate_user
def get_workouts_by_day(date):
    try:
        google_id = request.google_id
        conn = get_db_connection()
        cur = conn.cursor()

        # ✅ Ensure date format is correct
        date = datetime.strptime(date, "%Y-%m-%d").date()

        logging.info(f"📅 Fetching workouts for user {google_id} on {date}")

        sql_query = """
            SELECT exercise_name, reps, weight, description, set_time
            FROM workouts 
            WHERE google_id = %s AND DATE(set_time) = %s
            ORDER BY set_time ASC
        """

        logging.info(f"🔍 Executing query: {sql_query}")
        logging.info(f"🔢 Parameters: {google_id}, {date}")

        cur.execute(sql_query, (google_id, date))
        workouts = cur.fetchall()

        logging.info(f"✅ Retrieved {len(workouts)} workouts.")

        cur.close()
        conn.close()

        if not workouts:
            return jsonify({"message": "No workouts found"}), 404

        return jsonify(
            [
                {
                    "exercise_name": row[0],
                    "total_reps": row[1],  # ✅ Adjusted to match the schema
                    "weight": row[2],
                    "description": row[3],
                    "timestamp": row[4].isoformat()
                }
                for row in workouts
            ]
        ), 200
    except Exception as e:
        logging.error(f"❌ Error fetching workouts: {e}", exc_info=True)
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
    """
    API endpoint to fetch muscle activation for a given date.
    """
    try:
        google_id = request.google_id
        logging.info(f"🦾 Fetching muscle activation for user {google_id} on {date}")

        conn = get_db_connection()
        cur = conn.cursor()

        # ✅ Step 1: Check if muscle activation exists in the database
        cur.execute(
            """
            SELECT muscle_activation FROM workouts
            WHERE google_id = %s AND DATE(set_time) = %s AND muscle_activation IS NOT NULL
            """,
            (google_id, date),
        )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        if rows:
            combined_activation = {}
            for row in rows:
                activation_data = row[0]  # JSONB column
                if activation_data:
                    for muscle, intensity in activation_data.items():
                        combined_activation[muscle] = max(combined_activation.get(muscle, 0), intensity)

            logging.info(f"✅ Returning stored muscle activation: {combined_activation}")
            return jsonify({"success": True, "muscleActivation": combined_activation}), 200

        # 🛠 Step 2: No stored activation → Fetch workouts & Compute activation
        workouts = fetch_workouts_for_date(google_id, date)
        logging.info(f"📋 Retrieved {len(workouts)} workouts for muscle activation processing.")

        if not workouts:
            return jsonify({"message": "No workouts found"}), 404

        # 🧠 Compute muscle activation using OpenAI
        muscle_activation = determine_muscle_activation(workouts)

        # ✅ Step 3: Store newly computed activation in the database
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            UPDATE workouts
            SET muscle_activation = %s
            WHERE google_id = %s AND DATE(set_time) = %s
            """,
            (json.dumps(muscle_activation), google_id, date),
        )
        conn.commit()
        cur.close()
        conn.close()

        logging.info(f"✅ Computed & stored muscle activation: {muscle_activation}")

        return jsonify({"success": True, "muscleActivation": muscle_activation}), 200

    except Exception as e:
        logging.error(f"❌ Error fetching muscle activation: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)