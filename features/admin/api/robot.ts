// lib/api/robot.ts

import api from "@/lib/api/apiClient";

export interface ArmEndpose {
  id: number;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  updated_at: string;
}

export interface ArmVelocity {
  id: number;
  joint_1: number;
  joint_2: number;
  joint_3: number;
  joint_4: number;
  joint_5: number;
  joint_6: number;
  updated_at: string;
}

export interface JointEffort {
  id: number;
  joint_1: number;
  joint_2: number;
  joint_3: number;
  joint_4: number;
  joint_5: number;
  joint_6: number;
  updated_at: string;
}

export interface JointPosition {
  id: number;
  joint_1: number;
  joint_2: number;
  joint_3: number;
  joint_4: number;
  joint_5: number;
  joint_6: number;
  updated_at: string;
}

// ✅ ADDED: Interface for Joint Heat
export interface JointHeat {
  id: number;
  joint_1: number;
  joint_2: number;
  joint_3: number;
  joint_4: number;
  joint_5: number;
  joint_6: number;
  updated_at: string;
}

export interface JointStatus {
  id: number;
  joint_number: string;
  limit: string;
  limit_timestamp: string;
  comms: string;
  comms_timestamp: string;
  motor: string;
  motor_timestamp: string;
  created_at: string;
}

export interface ArmStatus {
  id: number;
  ctrl_mode: string;
  ctrl_mode_timestamp: string;
  arm_status: string;
  arm_status_timestamp: string;
  mode_feed: string;
  mode_feed_timestamp: string;
  teach_mode: string;
  teach_mode_timestamp: string;
  motion_status: string;
  motion_status_timestamp: string;
  trajectory_num: string;
  trajectory_num_timestamp: string;
  arm_number: string;
  voltage_too_low: string;
  voltage_too_low_timestamp: string;
  motor_overheating: string;
  motor_overheating_timestamp: string;
  driver_overcurrent: string;
  driver_overcurrent_timestamp: string;
  driver_overheating: string;
  driver_overheating_timestamp: string;
  sensor_status: string;
  sensor_status_timestamp: string;
  driver_error_status: string;
  driver_error_status_timestamp: string;
  driver_enable_status: string;
  driver_enable_status_timestamp: string;
  homing_status: string;
  homing_status_timestamp: string;
  created_at: string;
}

export async function fetchArmEndpose(): Promise<ArmEndpose> {
  const { data } = await api.get("robot_management/arm-endpose/");
  return data.data;
}

export async function fetchArmVelocity(): Promise<ArmVelocity> {
  const { data } = await api.get("robot_management/joint-velocity/");
  return data.data;
}

export async function fetchJointEffort(): Promise<JointEffort> {
  const { data } = await api.get("robot_management/joint-effort/");
  return data.data;
}

export async function fetchJointPosition(): Promise<JointPosition> {
  const { data } = await api.get("robot_management/joint-position/");
  return data.data;
}

// ✅ ADDED: Fetch function for Joint Heat
export async function fetchJointHeat(): Promise<JointHeat> {
  // Note: Corrected your 'fetchHeatStatus' to use the right name and return type
  const { data } = await api.get("robot_management/joint-position/");
  return data.data;
}

export async function fetchJointStatus(): Promise<JointStatus> {
  const { data } = await api.get("robot_management/get-joint-status/");
  return data.data;
}

export async function fetchArmStatus(): Promise<ArmStatus> {
  const { data } = await api.get("robot_management/get-arm-status/");
  return data.data;
}