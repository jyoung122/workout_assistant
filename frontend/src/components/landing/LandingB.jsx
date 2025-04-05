import { useNavigate } from "react-router-dom";

export default function LandingB() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-brandPrimary mb-6">
          Join the Resistance Training Revolution
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Thousands of fitness enthusiasts and trainers are already tracking their progress with us.
        </p>
        <img
          src="/placeholder-community-image.jpg"
          alt="Community Visual"
          className="w-full max-w-md mb-8 rounded-lg shadow-lg"
        />
        <button
          onClick={() => navigate("/signup")}
          className="px-8 py-4 bg-brandPrimary text-white text-lg rounded-lg shadow-md hover:bg-brandSecondary"
        >
          Sign Up Free
        </button>
      </div>
    </div>
  );
}
