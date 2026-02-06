export const urdfJoints = {
  joint1: { min: -150, max: 150 },    // Base rotation: ±150° (was ±154°)
  joint2: { min: 0, max: 180 },       // Shoulder: 0° ~ 180° (was 0° ~ 195°)
  joint3: { min: -170, max: 0 },      // Elbow: -170° ~ 0° (was -175° ~ 0°)
  joint4: { min: -100, max: 100 },    // Wrist 1: ±100° (was ±106°)
  joint5: { min: -70, max: 70 },      // Wrist 2: ±70° (was ±75°)
  joint6: { min: -120, max: 120 },    // Wrist 3: ±120° (was ±100°)
  gripper: { min: 0, max: 35 },       // Gripper (combines joint7 + joint8): 0-35mm
};