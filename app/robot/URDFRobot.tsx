"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import URDFLoader from "urdf-loader";

export default function URDFRobot({ joints }: { joints: any }) {
  const group = useRef<THREE.Group>(null);
  const robotRef = useRef<any>(null);

  /* ===================== LOAD URDF ===================== */
  useEffect(() => {
    const loader = new URDFLoader();

    loader.packages = {
      piper_description: "/urdf",
    };

    loader.load("/urdf/arm_medbot.urdf", (robot:any) => {
      robot.rotation.x = -Math.PI / 2;

      robotRef.current = robot;

      if (group.current) {
        group.current.clear(); // 🔥 avoid duplicate add
        group.current.add(robot);
      }
    });
  }, []);

  /* ===================== UPDATE JOINTS ===================== */
  useEffect(() => {
    if (!robotRef.current) return;

    Object.entries(joints).forEach(([name, value]) => {
      const joint = robotRef.current.joints[name];
      if (!joint) return;

      if (joint.jointType === "prismatic") {
        joint.setJointValue(value / 1000); // mm → meters
      } else {
        // 🔥 safe deg / rad handling
        const rad =
          Math.abs(value) > Math.PI * 2
            ? (value * Math.PI) / 180
            : value;

        joint.setJointValue(rad);
      }
    });
  }, [joints]);

  return <group ref={group} />;
}
