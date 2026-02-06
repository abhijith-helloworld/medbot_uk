"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import URDFLoader from "urdf-loader";

interface URDFRobotProps {
  joints: Record<string, number>;
}

interface URDFJoint {
  jointType: "revolute" | "prismatic" | "fixed" | "continuous";
  setJointValue: (value: number) => void;
}

interface URDFRobotType extends THREE.Object3D {
  joints: Record<string, URDFJoint>;
}

export default function URDFRobot({ joints }: URDFRobotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const robotRef = useRef<URDFRobotType | null>(null);
  const isMounted = useRef(true);

  /* ===================== LOAD URDF ===================== */
  useEffect(() => {
    isMounted.current = true;
    const loader = new URDFLoader();

    loader.packages = {
      piper_description: "/urdf",
    };

    loader.load(
      "/urdf/arm_medbot.urdf",
      (robot: URDFRobotType) => {
        if (!isMounted.current) {
          // Clean up if component unmounted during load
          robot.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry?.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material?.dispose();
              }
            }
          });
          return;
        }

        robot.rotation.x = -Math.PI / 2;
        robotRef.current = robot;

        if (groupRef.current) {
          // Clear existing children to avoid duplicates
          while (groupRef.current.children.length > 0) {
            const child = groupRef.current.children[0];
            groupRef.current.remove(child);
            
            // Dispose of geometries and materials
            child.traverse((obj) => {
              if (obj instanceof THREE.Mesh) {
                obj.geometry?.dispose();
                if (Array.isArray(obj.material)) {
                  obj.material.forEach((mat) => mat.dispose());
                } else {
                  obj.material?.dispose();
                }
              }
            });
          }
          
          groupRef.current.add(robot);
        }
      },
      undefined,
      (error) => {
        console.error("Error loading URDF:", error);
      }
    );

    return () => {
      isMounted.current = false;
      
      // Clean up robot and materials
      if (robotRef.current) {
        robotRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
      
      // Clear group
      if (groupRef.current) {
        while (groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
      }
      
      robotRef.current = null;
    };
  }, []);

  /* ===================== UPDATE JOINTS ===================== */
  useEffect(() => {
    if (!robotRef.current || !isMounted.current) return;

    Object.entries(joints).forEach(([name, value]) => {
      const joint = robotRef.current?.joints[name];
      if (!joint) return;

      try {
        if (joint.jointType === "prismatic") {
          // Convert mm to meters
          joint.setJointValue(value / 1000);
        } else {
          // Safe degree to radian conversion
          // If value seems to be in radians (small absolute value), use as-is
          // Otherwise convert from degrees
          const rad =
            Math.abs(value) > Math.PI * 2
              ? (value * Math.PI) / 180
              : value;

          joint.setJointValue(rad);
        }
      } catch (error) {
        console.error(`Error setting joint ${name}:`, error);
      }
    });
  }, [joints]);

  return <group ref={groupRef} />;
}