// src/components/Calendar.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarComponent({ selectedDate, setSelectedDate }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/") // or 5000, whichever port your Flask app is on
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Health check failed with status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Health check data:", data);
        // e.g., data.message === "Workout Assistant API is running!"
        setIsConnected(true);
      })
      .catch((error) => {
        console.error("Health check error:", error);
        setIsConnected(false);
      });
  }, []);

  return (
    <div className="rounded-lg shadow-md p-4 bg-white">
      {/* Connectivity Indicator */}
      <div className="flex items-center mb-4">
        <span
          className={`inline-block w-3 h-3 rounded-full mr-2 ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm font-semibold">
          {isConnected ? "Connected" : "Not Connected"}
        </span>
      </div>

      <h2 className="text-xl font-semibold mb-3">Select a Date</h2>
      <Calendar value={selectedDate} onChange={(date) => setSelectedDate(date)} />
    </div>
  );
}