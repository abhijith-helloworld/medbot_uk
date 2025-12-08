"use client";

import { useEffect, useRef, useState } from "react";
import { appConfig } from "@/config/appConfig";

interface AlertPayload {
  icon: string;
  notification: string;
}

export function useAlertSocket() {
  const [alertMessage, setAlertMessage] = useState<AlertPayload | null>(null);
  const [notifications, setNotifications] = useState<AlertPayload[]>([]);

  const helpSocketRef = useRef<WebSocket | null>(null);
  const notifSocketRef = useRef<WebSocket | null>(null);

  const isReconnecting = useRef(false);

  const createSockets = () => {
    if (isReconnecting.current) return;
    isReconnecting.current = true;

    console.log("🔌 Connecting WebSockets...");

    // 👉 URLs from ENV (no hardcoding)
    helpSocketRef.current = new WebSocket(appConfig.ws.help);
    notifSocketRef.current = new WebSocket(appConfig.ws.notification);

    const handleMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const payload = parsed.payload;

        if (!payload) return;

        const finalPayload: AlertPayload =
          typeof payload === "string"
            ? { icon: "warning", notification: payload }
            : { icon: payload.icon || "info", notification: payload.notification };

        setAlertMessage(finalPayload);
        setNotifications((prev) => [finalPayload, ...prev]);
      } catch (error) {
        console.error("WS Parsing Error:", error);
      }
    };

    const reconnect = () => {
      console.warn("⚠️ WS Closed. Reconnecting...");
      isReconnecting.current = false;
      createSockets();
    };

    // OPEN
    helpSocketRef.current.onopen = () => {
      console.log("✅ HELP WebSocket Connected");
      isReconnecting.current = false;
    };

    notifSocketRef.current.onopen = () => {
      console.log("✅ NOTIFICATION WebSocket Connected");
      isReconnecting.current = false;
    };

    // MESSAGE
    helpSocketRef.current.onmessage = handleMessage;
    notifSocketRef.current.onmessage = handleMessage;

    // ERROR + CLOSE = RECONNECT
    helpSocketRef.current.onerror = reconnect;
    helpSocketRef.current.onclose = reconnect;

    notifSocketRef.current.onerror = reconnect;
    notifSocketRef.current.onclose = reconnect;
  };

  // INIT
  useEffect(() => {
    createSockets();

    return () => {
      helpSocketRef.current?.close();
      notifSocketRef.current?.close();
    };
  }, []);

  return { alertMessage, setAlertMessage, notifications };
}
