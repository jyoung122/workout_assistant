-- Users Table (Authentication)
CREATE TABLE users (
    google_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workouts Table
CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) REFERENCES users(google_id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    reps INT NOT NULL,
    weight FLOAT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    set_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout Labels Table
CREATE TABLE workout_labels (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) REFERENCES users(google_id) ON DELETE CASCADE,
    label_name VARCHAR(50) NOT NULL,
    color VARCHAR(10) DEFAULT '#FFFFFF'
);

-- Workout Label Assignments Table
CREATE TABLE workout_label_assignments (
    id SERIAL PRIMARY KEY,
    workout_id INT REFERENCES workouts(id) ON DELETE CASCADE,
    label_id INT REFERENCES workout_labels(id) ON DELETE CASCADE
);