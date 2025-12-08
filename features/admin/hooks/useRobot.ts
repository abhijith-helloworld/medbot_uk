// hooks/useRobot.ts
import { useState, useEffect } from "react"; // ✅ ADDED
import useWebSocket from "./useWebSocket";
import { useTriggeredFetch } from "./useTriggeredFetch";

// ✅ ADDED: Import all API fetchers
import {
  fetchArmStatus,
  fetchJointStatus,
  fetchArmEndpose,
  fetchArmVelocity,
  fetchJointEffort,
  fetchJointPosition,
  fetchJointHeat,
} from "../api/robot";

const WS_BASE = (path: string) => {
  const base = process.env.NEXT_PUBLIC_WS_URL || "ws://192.168.1.27:8001";
  return `${base}/ws/socket-server/${path}`;
};

// ✅ UPDATED PARSER: Handles 'j1' vs 'joint_1' key mismatch
const parseDataPayload = (parsedJson: any) => {
  if (parsedJson && parsedJson.Type === "connection_established") {
    console.log("Received connection status message:", parsedJson);
    return null;
  }

  if (parsedJson && parsedJson.payload) {
    const payload = parsedJson.payload;
    // Normalize WS data (e.g., from 'j1' to 'joint_1') to match API
    if (payload.j1 !== undefined) {
      return {
        joint_1: payload.j1,
        joint_2: payload.j2,
        joint_3: payload.j3,
        joint_4: payload.j4,
        joint_5: payload.j5,
        joint_6: payload.j6,
      };
    }
    // If keys already match (e.g., 'x', 'y' or 'joint_1'), return as is
    return payload;
  }
  return null;
};

// --- Hooks for Data Streams (WITH API FALLBACK) ---

// This new reusable hook handles the fallback logic
function useApiThenWebSocket(
  wsPath: string,
  fetcher: () => Promise<any>
) {
  // 1. Connect to WebSocket
  const { data: wsData, ...rest } = useWebSocket({
    url: WS_BASE(wsPath),
    parse: parseDataPayload,
  });

  // 2. Fetch initial data from API
  const [apiData, setApiData] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  useEffect(() => {
    fetcher()
      .then(setApiData)
      .catch((err) =>
        console.error(`Failed to fetch API data for ${wsPath}`, err)
      )
      .finally(() => setIsLoadingApi(false));
  }, [fetcher, wsPath]); // Runs once on mount

  // 3. Return combined state
  return {
    data: wsData ?? apiData, // Prefer live WS data, use API data as fallback
    isLoading: isLoadingApi && !wsData, // Loading until *either* API or WS provides data
    ...rest,
  };
}

// ✅ MODIFIED: All streaming hooks now use the new logic
export function useArmEndpose() {
  return useApiThenWebSocket("arm-endpose-value/", fetchArmEndpose);
}

export function useArmVelocity() {
  return useApiThenWebSocket("joint-velocity-value/", fetchArmVelocity);
}

export function useJointEffort() {
  return useApiThenWebSocket("joint-effort-value/", fetchJointEffort);
}

export function useJointPosition() {
  return useApiThenWebSocket("joint-position-value/", fetchJointPosition);
}

export function useJointHeat() {
  return useApiThenWebSocket("joint-heat-value/", fetchJointHeat);
}

// --- Hooks for Trigger-and-Fetch Pattern (No changes here) ---
export function useJointStatus() {
  return useTriggeredFetch({
    wsUrl: WS_BASE("refresh-joint-data-value/"),
    fetcher: fetchJointStatus,
  });
}

export function useArmStatus() {
  return useTriggeredFetch({
    wsUrl: WS_BASE("refresh-arm-data-value/"),
    fetcher: fetchArmStatus,
  });
}