// src/pages/Login.jsx
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Google login success:", credentialResponse);
    navigate("/dashboard");
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/sunset.jpg')" }} 
      /* ^ If you placed sunset.jpg in /public/assets, 
         then "url('/assets/sunset.jpg')" should work. 
         Adjust if your file structure is different. */
    >
      {/* Semi-transparent container */}
      <div className="bg-white bg-opacity-80 shadow-md rounded-lg p-8 max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Workout Tracker</h1>
        <GoogleLogin
            onSuccess={(response) => {
                console.log("Google Login Response:", response); // Debugging
                const tokenId = response.tokenId || response.credential;  // Ensure we extract the right field
                if (!tokenId) {
                    console.error("No ID token received from Google.");
                    return;
                }
            
                fetch("http://127.0.0.1:5001/login/google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_token: tokenId }),
                })
                .then((res) => res.json())
                .then((data) => {
                    if (data.token) {
                        localStorage.setItem("token", data.token); // Store JWT token
                        window.location.href = "/dashboard"; // Redirect to dashboard
                    } else {
                        console.error("Login failed:", data.error);
                    }
                })
                .catch((err) => console.error("Login error:", err));
            }}
            />
      </div>
    </div>
  );
}