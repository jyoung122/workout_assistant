import React, { useState, useEffect } from "react";
import CalendarComponent from "../components/Calendar";
import WorkoutList from "../components/WorkoutList";
import Chatbot from "../components/Chatbot";
import WorkoutProgress from "../components/WorkoutProgress";
import ModelViewer from "../components/ModelViewer";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    // Convert selected date to match your DB format or "today" if that works
    const formattedDate = selectedDate.toISOString().split("T")[0];
    // yields something like "2025-03-01"

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login"; // Redirect if user is not logged in
      return;
    }

    fetch(`http://127.0.0.1:5001/workouts/${formattedDate}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // Send JWT token for authentication
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // data should be the workouts array (or a message)
        setWorkouts(data);
      })
      .catch((error) => {
        console.error("Error fetching workouts:", error);
        setWorkouts([]);
      });
  }, [selectedDate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear JWT token
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Section: Calendar & Chatbot */}
      <div className="w-1/3 p-4 space-y-4">
        <CalendarComponent
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* Chatbot Card */}
        <div className="rounded-lg shadow-md p-4 bg-white">
          <h2 className="text-xl font-semibold mb-3">Coach</h2>
          <Chatbot setSelectedDate={setSelectedDate} />
        </div>
      </div>

{/* Right Section: Workouts Display */}
<div className="flex-1 flex flex-col p-4">
  {/* Header: Title & Logout */}
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold">Workouts for {selectedDate.toDateString()}</h2>
    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
      Logout
    </button>
  </div>

  {/* Main Content (ModelViewer + Workout List) */}
  <div className="rounded-lg shadow-md p-4 bg-white flex-1 overflow-y-auto">
    {/* ModelViewer at the top, full width */}
    <div className="sticky top-0 bg-white z-10 p-2 shadow-md">
      <div className="w-[300px] h-[400px] bg-white shadow-md rounded-lg overflow-hidden flex items-center justify-center">
        <ModelViewer selectedDate={selectedDate} />
      </div>
    </div>

    {/* Workout List below ModelViewer */}
    <WorkoutList workouts={workouts} />
  </div>
</div>
    </div>
  );
}