// src/pages/Login.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = urlParams.get("id_token");

    if (idToken) {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/login/azure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            localStorage.setItem("token", data.token); // Store JWT token
            navigate("/dashboard"); // Redirect to dashboard
          } else {
            console.error("Login failed:", data.error);
          }
        })
        .catch((err) => console.error("Login error:", err));
    }
  }, [navigate]);

  const handleAzureLogin = () => {
    const tenant = process.env.REACT_APP_AZURE_B2C_TENANT;
    const clientId = process.env.REACT_APP_AZURE_B2C_CLIENT_ID;
    const policy = process.env.REACT_APP_AZURE_B2C_POLICY;
    const redirectUri = encodeURIComponent(window.location.origin + "/login");
    const azureB2CUrl = `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${policy}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=id_token&redirect_uri=${redirectUri}&scope=openid&response_mode=fragment`;

    window.location.href = azureB2CUrl;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/sunset.jpg')" }}
    >
      <div className="bg-white bg-opacity-80 shadow-md rounded-lg p-8 max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Workout Tracker</h1>
        <button
          onClick={handleAzureLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login with Azure B2C
        </button>
      </div>
    </div>
  );
}