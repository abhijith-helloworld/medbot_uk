"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import URDFLoader from "urdf-loader";

interface URDFRobotProps {
  joints: Record<string, number>;
  onRobotLoaded?: () => void;
  onError?: (error: Error) => void;
}

interface URDFJoint {
  jointType: "revolute" | "prismatic" | "fixed" | "continuous" | "planar" | "floating";
  setJointValue: (value: number) => void;
}

interface URDFRobotType extends THREE.Object3D {
  joints: { [key: string]: URDFJoint };
}

export default function URDFRobot({ joints, onRobotLoaded, onError }: URDFRobotProps) {
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

        // Notify parent that robot is loaded
        onRobotLoaded?.();
      },
      undefined,
      (error) => {
        console.error("Error loading URDF:", error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
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
  }, [onRobotLoaded, onError]);

  /* ===================== UPDATE JOINTS ===================== */
  useEffect(() => {
    if (!robotRef.current || !isMounted.current) return;

    Object.entries(joints).forEach(([name, value]) => {
      // Handle gripper as single input controlling both joint7 and joint8
      if (name === "gripper") {
        const joint7 = robotRef.current?.joints["joint7"];
        const joint8 = robotRef.current?.joints["joint8"];
        
        if (joint7 && joint8) {
          try {
            // Convert mm to meters
            const meterValue = value / 1000;
            joint7.setJointValue(meterValue);        // joint7: 0 to 0.035m
            joint8.setJointValue(-meterValue);       // joint8: 0 to -0.035m (mirrored)
          } catch (error) {
            console.error("Error setting gripper joints:", error);
          }
        }
        return;
      }

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