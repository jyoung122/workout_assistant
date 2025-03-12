import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three"; // ✅ Import Three.js explicitly

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

    fetch(`workoutassistant-production.up.railway.app/muscle-activation/${formattedDate}`, {
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
        obj.material = new THREE.MeshStandardMaterial(); // ✅ Force a new material
        obj.material.needsUpdate = true;
        obj.material.colorWrite = true;
    
        // 🚨 Remove any existing texture (prevents conflicts)
        obj.material.map = null;
        obj.material.needsUpdate = true;
    
        if (muscleActivation.hasOwnProperty(obj.name)) {
          let activation = muscleActivation[obj.name]; // Activation value (0.6 - 1.0)
    
          // 🎨 Color gradient from blue to red based on activation
          let r = 0.5 + (activation * 0.5);  // From 0.5 (blue) → 1 (red)
          let g = 0.7 * (1 - activation);     // From 0.7 (blue) → 0 (red)
          let b = 1 * (1 - activation);       // From 1 (blue) → 0 (red)
    
          obj.material.color.setRGB(r, g, b);
          obj.material.needsUpdate = true;
        } else {
          // 🔹 Inactive muscles stay pastel sky blue
          obj.material.color.setRGB(0.1, 0.5, 1);
          obj.material.needsUpdate = true;
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