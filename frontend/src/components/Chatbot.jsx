// src/components/Chatbot.jsx

import React, { useState } from "react";

export default function Chatbot({ setSelectedDate }) {
  const [description, setDescription] = useState("");
  const [serverResponse, setServerResponse] = useState(null);
   const [isLogging, setIsLogging] = useState(false); 

  async function handleLogWorkout() {

    setIsLogging(true);  // ✅ Disable button

    const token = localStorage.getItem("token");
    
    try {
      // Make a POST request to /workouts
      const res = await fetch("http://127.0.0.1:5001/workouts", {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          description: description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // If backend returned an error (4xx or 5xx), throw it
        throw new Error(data.error || "Failed to log workout");
      }

      // On success, store the entire response
      setServerResponse(data);
      // Clear the textarea
      setDescription("");
      setSelectedDate((prev) => new Date(prev)); // ✅ Refresh workout list
    } catch (error) {
      console.error("Error logging workout:", error);
      setServerResponse({ error: error.message });
    } finally {
        setIsLogging(false);  // ✅ Re-enable button after request completes
      }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Coach: Describe your workout
      </label>
      <textarea
        className="w-full h-24 p-2 border border-gray-300 rounded"
        placeholder="e.g. Did 3 sets of 10 reps bench press at 225 lbs"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleLogWorkout}
        disabled={isLogging}
      >
        {isLogging ? "Logging..." : "Log Workout"} 
      </button>

      {/* Display server response if any */}
      {serverResponse && (
        <div className="mt-2 p-2 border rounded text-sm">
          {serverResponse.error ? (
            <p className="text-red-500">Error: {serverResponse.error}</p>
          ) : (
            <div className="text-green-600">
              <p>{serverResponse.message}</p>
              {serverResponse.data && (
                <pre className="text-xs bg-gray-100 p-2 mt-1 rounded">
                  {JSON.stringify(serverResponse.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}