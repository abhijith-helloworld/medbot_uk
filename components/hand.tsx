"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Bounds, Center } from "@react-three/drei";
import { useState } from "react";

/* ===================== 3D MODEL ===================== */
function ArmModel({ joints }) {
  const { scene } = useGLTF("/Arm/arm_medbot.glb");

  // Traverse all bones/meshes and apply rotations from UI
  scene.traverse((child) => {
    if (child.isBone || child.isObject3D) {
      switch (child.name) {
        // LEFT ARM
        case "L_J1":
          child.rotation.z = joints.L_J1 * (Math.PI / 180);
          break;
        case "L_J2":
          child.rotation.y = joints.L_J2 * (Math.PI / 180);
          break;
        case "L_J3":
          child.rotation.y = joints.L_J3 * (Math.PI / 180);
          break;
        case "L_J4":
          child.rotation.x = joints.L_J4 * (Math.PI / 180);
          break;
        case "L_J5":
          child.rotation.y = joints.L_J5 * (Math.PI / 180);
          break;
        case "L_J6":
          child.rotation.x = joints.L_J6 * (Math.PI / 180);
          break;
        case "L_J7":
          child.rotation.z = joints.L_J7 * (Math.PI / 180);
          break;
        case "L_EE":
          child.rotation.x = joints.L_EE * (Math.PI / 180);
          break;
      }
    }
  });

  return (
    <Center>
      <primitive object={scene} rotation={[0, Math.PI, 0]} />
    </Center>
  );
}

/* ===================== JOINT CONTROL ===================== */
function Joint({ label, value, onChange }) {
  const isLeftArm = label.startsWith("L_");

  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-xs text-gray-200">{label}</span>
      <input
        type="range"
        min={-180}
        max={180}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-1 ${isLeftArm ? "accent-cyan-400" : "accent-orange-400"}`}
      />
      <input
        type="number"
        min={-180}
        max={180}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 rounded bg-gray-700 text-xs text-center text-white px-1"
      />
    </div>
  );
}

/* ===================== MAIN VIEW ===================== */
export default function RobotArmView() {
  const [joints, setJoints] = useState({
    L_J1: 0, R_J1: 0,
    L_J2: 0, R_J2: 0,
    L_J3: 0, R_J3: 0,
    L_J4: 0, R_J4: 0,
    L_J5: 0, R_J5: 0,
    L_J6: 0, R_J6: 0,
    L_J7: 0, R_J7: 0,
    L_EE: 0, R_EE: 0,
  });

  const updateJoint = (jointName: string, value: any) => {
    setJoints(prev => ({ ...prev, [jointName]: value }));
  };

  return (
    <div className="flex w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* 🔧 CONTROL PANEL */}
      <div className="w-1/2 shrink-0 border-r border-slate-700 p-4 overflow-y-auto scrollbar-thin">
        <h3 className="mb-4 text-sm font-semibold tracking-wide">OpenArm 01</h3>

        <div className="space-y-6">
          {/* LEFT ARM */}
          <div>
            <h4 className="text-xs font-semibold text-cyan-400 mb-3">LEFT ARM</h4>
            <div className="space-y-3">
              {["L_J1","L_J2","L_J3","L_J4","L_J5","L_J6","L_J7","L_EE"].map((j: unknown) => (
                <Joint key={j} label={j} value={joints[j]} onChange={(v:any) => updateJoint(j, v)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🦾 3D VIEW */}
      <div className="w-1/2">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />

          <Bounds fit clip observe margin={1.5}>
            <ArmModel joints={joints} />
          </Bounds>

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={3}
            maxDistance={1000}
            enableZoom={false}
          />
        </Canvas>
      </div>
    </div>
  );
}
