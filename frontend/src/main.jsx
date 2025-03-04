import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

// Replace "YOUR_GOOGLE_CLIENT_ID" with an actual client ID once you have it.
// For now, it can be a dummy string and still render the button.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="505754151265-4lscvjc5loinvbk7e03kbo8bpdkpnu4r.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);