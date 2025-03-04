SELECT * FROM users;
SELECT * FROM workouts;
SELECT w.id, u.username, w.exercise_name, w.reps, w.weight, w.description, w.created_at, w.set_time
FROM workouts w
JOIN users u ON w.user_id = u.id;
SELECT * FROM workout_labels;
SELECT w.exercise_name, wl.label_name, wl.color
FROM workout_label_assignments wa
JOIN workouts w ON wa.workout_id = w.id
JOIN workout_labels wl ON wa.label_id = wl.id;
SELECT u.username, COUNT(w.id) AS total_workouts
FROM users u
LEFT JOIN workouts w ON u.id = w.user_id
GROUP BY u.username;
SELECT exercise_name, reps, weight, created_at 
FROM workouts
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;