import React from "react";

// We expect an array of workout objects like:
// {
//   exercise_name: "Bench Press",
//   total_reps: 10,
//   total_sets: 1,
//   weight: 225.0,
//   timestamp: "2025-03-01 05:45:42"
// }

export default function WorkoutList({ workouts }) {
  // 1. If no data, show a quick message
  if (!workouts || workouts.length === 0) {
    return <p className="text-gray-500">No workouts found for this date.</p>;
  }

  // 2. Group by exercise_name
  const groupedWorkouts = workouts.reduce((acc, workout) => {
    const exercise = workout.exercise_name || "Unknown Exercise";
    // Initialize array if not present
    if (!acc[exercise]) {
      acc[exercise] = [];
    }
    acc[exercise].push(workout);
    return acc;
  }, {});

  // 3. Render
  return (
    // This container can scroll if it overflows. 
    // You can remove overflow-y-auto if you prefer the parent to handle scrolling.
    <div className="h-full overflow-y-auto">
      {/* We'll display each exercise in a responsive grid, so if we have multiple,
          they'll appear side-by-side on wider screens. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(groupedWorkouts).map(([exerciseName, sets]) => (
          <div
            key={exerciseName}
            className="bg-white rounded-lg shadow-md p-4"
          >
            {/* Exercise Title */}
            <h3 className="text-lg font-semibold mb-3">
              {exerciseName}
            </h3>

            {/* Each workout entry (set) for this exercise */}
            <div className="space-y-2">
              {sets.map((setItem, index) => {
                // Convert timestamp to a more readable format
                const readableTime = new Date(setItem.timestamp).toLocaleString();

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded p-2"
                  >
                    <p className="text-sm font-medium">
                      Set {index + 1}: {setItem.total_reps} reps 
                      {setItem.weight > 0 && (
                        <> @ {setItem.weight} lbs</>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Logged at: {readableTime}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}