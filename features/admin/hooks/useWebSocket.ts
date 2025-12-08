// hooks/useWebSocket.ts

import { useEffect, useRef, useState, useCallback } from "react";

type WSState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

type UseWebSocketOptions<T> = {
  url: string;
  parse?: (payload: any) => T | null; // Allow parser to return null
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number; // base ms
};

export function useWebSocket<T = any>(options: UseWebSocketOptions<T>) {
  const {
    url,
    parse = (p: any) => p as T,
    autoConnect = true,
    maxReconnectAttempts = 10,
    reconnectInterval = 1000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const [state, setState] = useState<WSState<T>>({
    data: null,
    isLoading: !!autoConnect,
    error: null,
  });

  const connect = useCallback(() => {
    if (wsRef.current) return;
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setState((s) => ({ ...s, isLoading: true, error: null }));

      ws.onopen = () => {
        attemptsRef.current = 0;
        setState((s) => ({ ...s, isLoading: false }));
      };

      ws.onmessage = (ev) => {
        try {
          // 1. Clean the incoming data string to ensure it's valid JSON
          let cleanDataString = ev.data;
          const lastBraceIndex = cleanDataString.lastIndexOf("}");
          if (lastBraceIndex !== -1) {
            cleanDataString = cleanDataString.substring(0, lastBraceIndex + 1);
          }
          
          const parsed = JSON.parse(cleanDataString);
          const mapped = parse(parsed); // The parser might return null for non-data messages

          // 2. Only update the component state if the parser returned valid data.
          // If 'mapped' is null (e.g., it was a connection message), this block is skipped.
          if (mapped !== null && mapped !== undefined) {
            setState({ data: mapped, isLoading: false, error: null });
          }

        } catch (err: any) {
          console.error("Failed to parse WebSocket message:", ev.data, err);
          setState((s) => ({ ...s, error: new Error("Failed to parse message") }));
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (attemptsRef.current < maxReconnectAttempts) {
          const timeout = reconnectInterval * Math.pow(2, attemptsRef.current);
          attemptsRef.current += 1;
          // @ts-ignore setTimeout returns NodeJS.Timer in some envs
          timeoutRef.current = window.setTimeout(() => {
            connect();
          }, timeout);
        } else {
          setState((s) => ({
            ...s,
            error: new Error("Max reconnect attempts reached"),
          }));
        }
      };

      ws.onerror = (ev) => {
        // capture error but keep reconnect logic in onclose
        setState((s) => ({ ...s, error: new Error("WebSocket error") }));
      };
    } catch (err: any) {
      setState((s) => ({ ...s, error: err, isLoading: false }));
    }
  }, [url, parse, maxReconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return { ...state, reconnect: connect, disconnect } as WSState<T> & {
    reconnect: () => void;
    disconnect: () => void;
  };
}

export default useWebSocket;