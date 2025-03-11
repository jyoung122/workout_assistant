import openai
import psycopg2
import logging
from datetime import datetime, timedelta
import json
from collections import defaultdict
import numpy as np
from dotenv import load_dotenv
import os
import re
from muscles import MUSCLE_GROUPS

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

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

def extract_workout_data(user_sentence: str, conversation_history: list) -> dict:
    """
    Calls OpenAI LLM to extract structured workout data from a sentence.
    Uses conversation history to track missing values and prevents invalid JSON responses.
    """
    logging.info("Extracting workout data using OpenAI.")

    # Append user input to conversation history
    conversation_history.append({"role": "user", "content": user_sentence})

    # System Prompt
    system_prompt = """
    You are a fitness assistant that extracts structured workout details from user input.
    - Standardize exercise names (e.g., "pull-ups" → "Weighted Pull-ups").
    - Normalize variations of exercises to their most common name.
    - Ensure weight is included only if needed (e.g., bodyweight exercises should only include weight if extra resistance is specified).
    - If details are missing (workout type, weight, or reps), ask the user one question at a time.
    - Keep responses concise.

    Return only a JSON object in the format:
    {
        "exercise_name": "string or null",
        "weight": float or null,
        "reps": int or null,
        "description": "string (optional)",
        "follow_up_question": "string or null"
    }
    """

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                *conversation_history,  # Pass conversation history
            ]
        )

        response_text = response.choices[0].message.content.strip()

        if not response_text:
            logging.error("OpenAI returned an empty response.")
            return {}

        # Ensure the response is valid JSON
        workout_data = json.loads(response_text)
        
        # Validate JSON fields
        if "exercise_name" not in workout_data:
            logging.error("OpenAI response is missing 'exercise_name'.")
            return {}

        logging.info(f"Extracted workout data: {workout_data}")
        return workout_data

    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse OpenAI JSON response: {e}")
        return {}

    except Exception as e:
        logging.error(f"OpenAI extraction failed: {e}")
        return {}

def insert_workout(user_id: int, exercise_name: str, weight: float, reps: int, description: str = None):
    """
    Inserts a workout entry into the PostgreSQL database.
    """
    if weight is None:
        weight = 1.0  # Default to 0 if weight is missing

    logging.info(f"Inserting workout for user {user_id}: {exercise_name}, {weight} lbs, {reps} reps.")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
    INSERT INTO workouts (google_id, exercise_name, weight, reps, description, created_at, set_time)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    now = datetime.utcnow()
    cur.execute(query, (user_id, exercise_name, weight, reps, description, now, now))
    conn.commit()
    conn.close()
    
    logging.info("Workout inserted successfully.")

def get_daily_workout_summary(user_id: int):
    """
    Retrieves and returns a summary of the user's workouts for the current day.
    - Groups similar workout names together (e.g., 'Pull-Ups' and 'pull-ups').
    - Adds date and time of the workout.
    """
    logging.info(f"Fetching today's workout summary for user {user_id}.")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
    SELECT 
        exercise_name, 
        reps as total_reps, 
        1 as total_sets, 
        weight, 
        set_time as timestamp
    FROM workouts
    WHERE user_id = %s AND created_at >= CURRENT_DATE
    ORDER BY set_time ASC
    """
    
    cur.execute(query, (user_id,))
    results = cur.fetchall()
    conn.close()
    
    summary = [
        {
            "exercise_name": row[0],
            "total_reps": row[1],
            "total_sets": row[2],
            "weight": row[3],
            "timestamp": row[4].strftime("%Y-%m-%d %H:%M:%S")  # Format date/time
        }
        for row in results
    ]
    
    logging.info(f"Workout summary retrieved: {summary}")
    return summary

# 🎯 Mapping timeframe filters to actual date ranges
TIMEFRAME_MAP = {
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "9M": 270,
    "12M": 365,
    "ALL": None  # No limit, fetch all data
}

def fetch_workout_history(google_id, timeframe):
    """
    Fetches raw workout data from the database and performs calculations in Python.
    
    Args:
        google_id (str): The user's Google ID.
        timeframe (str): Time range (e.g., "1M", "3M", "6M", etc.).

    Returns:
        list: List of dictionaries with total volume, avg intensity, and 1RM per workout day.
    """
    # ✅ Step 1: Fetch raw workout data from DB
    results = query_workout_data(google_id, timeframe)
    if not results:
        logging.warning(f"No workout data found for user {google_id} in timeframe {timeframe}")
        return []

    # ✅ Step 2: Process data in Python
    processed_data = process_workout_data(results)
    
    return processed_data

# 🔹 **1. Query the database for raw workout data**
def query_workout_data(google_id, timeframe):
    """
    Fetch raw workout data from the database.
    
    Args:
        google_id (str): The user's Google ID.
        timeframe (str): Time range.

    Returns:
        list: Raw workout data (tuples).
    """
    conn = get_db_connection()
    cur = conn.cursor()

    # Determine date range
    days_limit = TIMEFRAME_MAP.get(timeframe, None)
    date_filter = ""
    params = [google_id]

    if days_limit:
        start_date = datetime.now() - timedelta(days=days_limit)
        date_filter = "AND created_at >= %s"
        params.append(start_date)

    query = f"""
        SELECT DATE(created_at), exercise_name, reps, weight
        FROM workouts
        WHERE google_id = %s {date_filter}
        ORDER BY created_at ASC
    """
    
    logging.info(f"Fetching raw workout data for Google ID {google_id} (Timeframe: {timeframe})")
    cur.execute(query, tuple(params))
    results = cur.fetchall()
    
    cur.close()
    conn.close()
    return results

# 🔹 **2. Process the raw data into meaningful workout insights**
def process_workout_data(results):
    """
    Process raw workout data to compute total sets, volume, avg intensity, and 1RM.
    
    Args:
        results (list): Raw workout data tuples from DB.

    Returns:
        list: Processed workout insights.
    """
    workout_data = defaultdict(lambda: defaultdict(list))

    # Organize data per day and exercise
    for workout_date, exercise_name, reps, weight in results:
        workout_data[workout_date][exercise_name].append({"reps": reps, "weight": weight})

    processed_data = []

    # Compute total sets, volume, avg intensity, and 1RM per exercise
    for workout_date, exercises in workout_data.items():
        for exercise_name, sets in exercises.items():
            total_sets = len(sets)
            total_volume = sum(s["reps"] * s["weight"] for s in sets)
            avg_intensity = round(np.mean([s["weight"] for s in sets]), 2) if sets else 0
            estimated_1RM = round(max(s["weight"] * (1 + s["reps"] / 30.0) for s in sets), 2) if sets else 0

            # Normalize total volume so it doesn't exceed 1.5 times 1RM
            if total_volume > 1.5 * estimated_1RM and estimated_1RM > 0:
                total_volume = total_volume / total_volume * (1.5 * estimated_1RM) 

            processed_data.append({
                "workout_date": str(workout_date),
                "exercise_name": exercise_name,
                "total_sets": total_sets,
                "total_volume": total_volume,
                "avg_intensity": avg_intensity,
                "estimated_1RM": estimated_1RM
            })

    return processed_data

def fetch_muscle_activation_from_openai(exercises):
    """
    Calls OpenAI to determine which muscle groups were activated based on exercises.

    Args:
        exercises (list): List of exercise names.

    Returns:
        str: Raw response from OpenAI as a JSON string.
    """
    prompt = f"""
    Given the following exercises, determine the muscle groups activated and their activation intensity.

    Exercises: {', '.join(exercises)}

    Only use the following predefined muscle groups:
    {json.dumps(list(MUSCLE_GROUPS.keys()), indent=2)}

    Respond in JSON format with muscle groups as keys and activation intensity as values.
    Example output:
    {{
        "chest": 1.0,
        "triceps": 0.6
    }}

    - Use `1.0` for primary muscles.
    - Use `0.6` for secondary muscles.
    - If muscle is not used omit it.
    - If an exercise does not match any known muscle group, omit it.

    Return **only** valid JSON, with no extra text.
    """

    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a fitness expert."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200
        )

        logging.info(f"🔍 ChatGPT Response: {response}")
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        logging.error(f"❌ OpenAI API Error: {e}")
        return "{}"  # Return empty JSON if there's an error

def process_muscle_activation_response(response_content):
    """
    Processes OpenAI's response and maps muscle groups to actual muscles.

    Args:
        response_content (str): JSON string from OpenAI response.

    Returns:
        dict: Dictionary mapping individual muscles to activation levels.
    """
    try:
        logging.info(f"🧐 Raw OpenAI Response: {repr(response_content)}")  # Debugging

        # ✅ Clean response to remove excessive newlines and markdown
        response_content = response_content.strip().replace("\n", "")
        if response_content.startswith("```json"):
            response_content = response_content.replace("```json", "").replace("```", "").strip()

        activation_data = json.loads(response_content)  # ✅ Parse JSON safely

        # ✅ Fix issue: OpenAI response nests muscle activation under exercise names
        flattened_activation = {}
        for exercise, muscles in activation_data.items():  # Loop through exercises
            for muscle_group, activation_value in muscles.items():  # Loop through muscle groups
                if muscle_group.lower() in MUSCLE_GROUPS:
                    for muscle in MUSCLE_GROUPS[muscle_group.lower()]:
                        flattened_activation[muscle] = max(flattened_activation.get(muscle, 0), activation_value)

        logging.info(f"✅ Processed Muscle Activation: {flattened_activation}")
        return flattened_activation

    except json.JSONDecodeError as json_error:
        logging.error(f"❌ JSON Decode Error: {json_error} - Raw Response: {response_content}")
        return {}
    except Exception as e:
        logging.error(f"❌ Error processing muscle activation: {e}")
        return {}

def determine_muscle_activation(workouts):
    """
    Determines muscle activation based on workouts using ChatGPT inference.

    Args:
        workouts (list): List of workout entries for the day.

    Returns:
        dict: Muscle activation mapping with intensities.
    """
    if not workouts:
        return {}

    exercises = [w["exercise_name"] for w in workouts]
    raw_response = fetch_muscle_activation_from_openai(exercises)
    return process_muscle_activation_response(raw_response)

def fetch_workouts_for_date(google_id, date):
    """
    Fetches workouts for a given date from the database.
    
    Args:
        google_id (str): The user's Google ID.
        date (str): The date for which workouts are fetched (format: YYYY-MM-DD).

    Returns:
        list: List of workout entries for the specified date.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT exercise_name, reps, weight, description, set_time 
        FROM workouts 
        WHERE google_id = %s AND DATE(set_time) = %s
        ORDER BY set_time ASC
        """,
        (google_id, date),
    )

    workouts = cur.fetchall()
    cur.close()
    conn.close()

    # Convert to dictionary format
    workout_list = []
    for row in workouts:
        workout_list.append({
            "exercise_name": row[0],
            "total_reps": row[1],
            "total_sets": row[2],
            "weight": row[3],
            "timestamp": row[4].strftime("%Y-%m-%d %H:%M:%S")
        })

    return workout_list

if __name__ == "__main__":
    """
    Terminal-based interface for testing OpenAI workout extraction and database logging.
    """
    user_id = int(input("Enter your user ID: "))
    print("Fetching your current workout summary...")
    
    summary = get_daily_workout_summary(user_id)
    if summary:
        print("Today's Workouts:")
        for entry in summary:
            print(f"{entry['timestamp']} - {entry['exercise_name']}: {entry['total_sets']} sets, {entry['total_reps']} reps, {entry['weight']} lbs")
    else:
        print("No workouts logged today.")

    # Initialize conversation history
    conversation_history = []

    while True:
        user_input = input("\nDescribe your workout (or type 'exit' to quit): ")
        if user_input.lower() == 'exit':
            break
        
        # Extract workout data with OpenAI and conversation history
        workout_data = extract_workout_data(user_input, conversation_history)

        # Keep asking questions if any details are missing
        while workout_data.get("follow_up_question"):
            follow_up = input(f"{workout_data['follow_up_question']} ")
            conversation_history.append({"role": "user", "content": follow_up})
            workout_data = extract_workout_data(follow_up, conversation_history)

        # Insert finalized workout data
        insert_workout(user_id, workout_data["exercise_name"], workout_data["weight"], workout_data["reps"], workout_data.get("description"))

        print("Workout logged! Here's your updated summary:")
        summary = get_daily_workout_summary(user_id)
        for entry in summary:
            print(f"{entry['exercise_name']}: {entry['total_sets']} sets, {entry['total_reps']} reps, {entry['weight']} lbs")