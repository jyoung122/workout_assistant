import os
from flask import (Flask, jsonify)
import psycopg2
from dotenv import load_dotenv
from flask_cors import CORS


load_dotenv()

app = Flask(__name__)
CORS(app)


# the minimal Flask application
@app.route('/')
def index():
    return '<h1>Hello, World!</h1>'


@app.route('/init-db', methods=['POST'])
def init_db():
    try:
        conn = psycopg2.connect(
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME")
        )
        cursor = conn.cursor()

        # Users Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            google_id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''')

        # Workouts Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS workouts (
            id SERIAL PRIMARY KEY,
            google_id VARCHAR(255) REFERENCES users(google_id) ON DELETE CASCADE,
            exercise_name VARCHAR(255) NOT NULL,
            reps INT NOT NULL,
            weight FLOAT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            set_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''')

        # Workout Labels Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS workout_labels (
            id SERIAL PRIMARY KEY,
            google_id VARCHAR(255) REFERENCES users(google_id) ON DELETE CASCADE,
            label_name VARCHAR(50) NOT NULL,
            color VARCHAR(10) DEFAULT '#FFFFFF'
        );
        ''')

        # Workout Label Assignments Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS workout_label_assignments (
            id SERIAL PRIMARY KEY,
            workout_id INT REFERENCES workouts(id) ON DELETE CASCADE,
            label_id INT REFERENCES workout_labels(id) ON DELETE CASCADE
        );
        ''')

        conn.commit()
        conn.close()
        return jsonify({"message": "Database initialized successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
   app.run()