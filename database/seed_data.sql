-- Insert a test user
INSERT INTO users (username, email, password_hash) 
VALUES ('testuser', 'test@example.com', 'hashedpassword');

-- Insert a sample workout
INSERT INTO workouts (user_id, exercise_name, reps, weight, description) 
VALUES (1, 'Bench Press', 10, 135, 'Felt strong today.');

INSERT INTO workouts (user_id, exercise_name, reps, weight, description) 
VALUES (1, 'Squats', 12, 225, 'Legs were on fire.');

-- Insert workout labels
INSERT INTO workout_labels (user_id, label_name, color) 
VALUES (1, 'Leg Day', '#FF5733');

-- Assign label to a workout
INSERT INTO workout_label_assignments (workout_id, label_id) 
VALUES (1, 1);
