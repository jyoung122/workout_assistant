// import React, { useState, useEffect } from "react";
// import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

// export default function WorkoutProgress({ selectedDate }) {
//   const [todayExercises, setTodayExercises] = useState([]);
//   const [workoutHistory, setWorkoutHistory] = useState({});
//   const [timeframe, setTimeframe] = useState("ALL"); // Default to ALL timeframes

//   // ✅ Fetch today's workouts and extract unique exercises
//   useEffect(() => {
//     const fetchTodayWorkouts = async () => {
//       const token = localStorage.getItem("token");
//       const formattedDate = selectedDate.toISOString().split("T")[0]; // Ensure correct date format

//       try {
//         const res = await fetch(`http://127.0.0.1:5001/workouts/${formattedDate}`, {
//           method: "GET",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!res.ok) throw new Error("Failed to fetch today's workouts");

//         const data = await res.json();

//         // Extract unique exercise names
//         const uniqueExercises = [...new Set(data.map((workout) => workout.exercise_name))];

//         setTodayExercises((prev) => {
//           return JSON.stringify(prev) !== JSON.stringify(uniqueExercises) ? uniqueExercises : prev;
//         });

//       } catch (error) {
//         console.error("Error fetching today's workouts:", error);
//         setTodayExercises([]);
//       }
//     };

//     fetchTodayWorkouts();
//   }, [selectedDate]);

//   // ✅ Fetch historical workout data only for today's exercises
//   useEffect(() => {
//     if (todayExercises.length === 0) return; // Prevent unnecessary API calls

//     const fetchWorkoutHistory = async () => {
//       const token = localStorage.getItem("token");
//       const historyData = {};

//       try {
//         await Promise.all(
//           todayExercises.map(async (exercise) => {
//             const res = await fetch(`http://127.0.0.1:5001/workouts/history/${timeframe}?exercise=${encodeURIComponent(exercise)}`, {
//               method: "GET",
//               headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             });

//             if (!res.ok) throw new Error(`Failed to fetch history for ${exercise}`);

//             const data = await res.json();
            
//             historyData[exercise] = data.length > 0 ? data : []; // Handle exercises with no history
//           })
//         );

//         setWorkoutHistory((prev) => {
//           console.log("Fetched workout history:", historyData);
//           return JSON.stringify(prev) !== JSON.stringify(historyData) ? historyData : prev;
//         });

//       } catch (error) {
//         console.error("Error fetching workout history:", error);
//         setWorkoutHistory({});
//       }
//     };

//     fetchWorkoutHistory();
//   }, [selectedDate, timeframe, todayExercises]);

//   return (
//     <div className="bg-white shadow-md rounded-lg p-4 h-1/2 overflow-y-auto">
//       <h2 className="text-lg font-bold mb-3">Workout Progress</h2>

//       {/* Timeframe Selector */}
//       <div className="flex space-x-2 mb-4">
//         {["1M", "3M", "6M", "9M", "12M", "ALL"].map((option) => (
//           <button
//             key={option}
//             className={`px-4 py-1 rounded ${
//               timeframe === option ? "bg-blue-500 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setTimeframe(option)}
//           >
//             {option}
//           </button>
//         ))}
//       </div>

//       {/* Ensure workout history is available */}
//       {Object.keys(workoutHistory).length === 0 ? (
//         <p className="text-gray-500">No historical data available.</p>
//       ) : (
//         <div className="overflow-y-auto flex-1">
//           {Object.keys(workoutHistory).map((exercise, index) => (
//             <div key={index} className="p-2 bg-gray-50 rounded mb-4">
//               {/* Exercise Title */}
//               <h3 className="text-md font-semibold mb-2">{exercise} Progress</h3>

//               <ResponsiveContainer width="100%" height={250}>
//                 <LineChart data={workoutHistory[exercise]}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="workout_date" tick={{ fontSize: 12 }} />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="avg_intensity" stroke="#FF9800" strokeWidth={2} name="Avg Intensity" />
//                   <Line type="monotone" dataKey="estimated_1RM" stroke="#2196F3" strokeWidth={2} name="1RM Estimate" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export default function WorkoutProgress({ selectedDate }) {
  const [todayExercises, setTodayExercises] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [timeframe, setTimeframe] = useState("ALL"); // Default to ALL timeframes

  // ✅ Fetch today's workouts and extract unique exercises
  useEffect(() => {
    const fetchTodayWorkouts = async () => {
      const token = localStorage.getItem("token");
      const formattedDate = selectedDate.toISOString().split("T")[0];

      try {
        const res = await fetch(`http://127.0.0.1:5001/workouts/${formattedDate}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch today's workouts");

        const data = await res.json();

        // Extract unique exercise names
        const uniqueExercises = [...new Set(data.map((workout) => workout.exercise_name))].filter(Boolean);
        console.log("✅ Unique Exercises Today:", uniqueExercises);

        setTodayExercises(uniqueExercises);
      } catch (error) {
        console.error("Error fetching today's workouts:", error);
        setTodayExercises([]);
      }
    };

    fetchTodayWorkouts();
  }, [selectedDate]);

  // ✅ Fetch historical workout data only for today's exercises
  useEffect(() => {
    if (todayExercises.length === 0) return; // Prevent unnecessary API calls

    const fetchWorkoutHistory = async () => {
      const token = localStorage.getItem("token");
      let historyData = {}; // **Independent object for correct mapping**

      try {
        const responses = await Promise.all(
          todayExercises.map(async (exercise) => {
            const res = await fetch(
              `http://127.0.0.1:5001/workouts/history/${timeframe}?exercise=${encodeURIComponent(exercise)}`,
              {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!res.ok) throw new Error(`Failed to fetch history for ${exercise}`);

            const data = await res.json();
            console.log(`📊 Data for ${exercise}:`, data);

            return { exercise, data };
          })
        );

        // **Explicitly store each exercise's data separately**
        responses.forEach(({ exercise, data }) => {
            historyData = { ...historyData, [exercise]: data }; 
          });
          
          setWorkoutHistory(historyData);

        console.log("✅ Processed Workout History:", historyData);
        setWorkoutHistory(historyData);
      } catch (error) {
        console.error("Error fetching workout history:", error);
        setWorkoutHistory({});
      }
    };

    fetchWorkoutHistory();
  }, [selectedDate, timeframe, todayExercises]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-3">Workout Progress</h2>

      {/* Timeframe Selector */}
      <div className="flex space-x-2 mb-4">
        {["1M", "3M", "6M", "9M", "12M", "ALL"].map((option) => (
          <button
            key={option}
            className={`px-4 py-1 rounded ${
              timeframe === option ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTimeframe(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Ensure workout history is available */}
      {Object.keys(workoutHistory).length === 0 ? (
        <p className="text-gray-500">No historical data available.</p>
      ) : (
        <div className="overflow-y-auto flex-1">
          {Object.entries(workoutHistory).length === 0 ? (
            <p className="text-gray-500">No historical data available.</p>
            ) : (
            Object.entries(workoutHistory).map(([exercise, history], index) => (
                <div key={index} className="p-2 bg-gray-50 rounded mb-4">
                <h3 className="text-md font-semibold mb-2">{exercise} Progress</h3>

                {history && history.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="workout_date" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="avg_intensity" stroke="#FF9800" strokeWidth={2} name="Avg Intensity" />
                        <Line type="monotone" dataKey="estimated_1RM" stroke="#2196F3" strokeWidth={2} name="1RM Estimate" />
                    </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-400">No data for {exercise}.</p>
                )}
                </div>
            ))
            )}
        </div>
      )}
    </div>
  );
}