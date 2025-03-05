import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

export default function ModelViewer({ selectedDate, token }) {
  const { scene } = useGLTF("/models/muscles.glb"); // ✅ Loads the muscle model
  const [muscleActivation, setMuscleActivation] = useState({});

  // 🛠 Fetch muscle activation data when the date changes
  useEffect(() => {
    if (!selectedDate) return;

    const formattedDate = selectedDate.toISOString().split("T")[0]; // Convert date to YYYY-MM-DD

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login"; // Redirect if user is not logged in
      return;
    }

    fetch(`http://127.0.0.1:5001/muscle-activation/${formattedDate}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,  // ✅ Use authentication
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.muscleActivation) {
          setMuscleActivation(data.muscleActivation);
        } else {
          setMuscleActivation({}); // No activation data, reset
        }
      })
      .catch((error) => {
        console.error("Error fetching muscle activation:", error);
        setMuscleActivation({}); // Reset in case of error
      });
  }, [selectedDate, token]);

  // 🎨 Apply muscle activation colors when the scene is ready
  useEffect(() => {
    if (!scene) return;

    console.log("✅ Model Loaded Successfully!");

    let foundAny = false;

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = obj.material.clone(); // Clone to avoid modifying shared materials
        obj.material.needsUpdate = true;

        if (muscleActivation.hasOwnProperty(obj.name)) {
          obj.material.color.set(0xff0000); // Highlight in red
          obj.material.transparent = true;
          obj.material.opacity = Math.max(muscleActivation[obj.name], 0.051); // Ensure minimum visibility

          console.log(`🔥 Highlighted: ${obj.name} → Opacity: ${obj.material.opacity} at ${muscleActivation[obj.name] * 100}%`);
          foundAny = true;
        } else {
          obj.material.transparent = true;
          obj.material.opacity = 0.051; // Dim non-active muscles
        }
      }
    });

    if (!foundAny) {
      console.warn("❌ No Target Muscles Found in the Model!");
    }
  }, [scene, muscleActivation]); // 🔄 Run when `scene` or `muscleActivation` updates

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 5, 5]} intensity={1.5} />

        <Suspense fallback={<p className="text-white">Loading Model...</p>}>
          <primitive object={scene} scale={1.5} position={[0, -1, 0]} />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}