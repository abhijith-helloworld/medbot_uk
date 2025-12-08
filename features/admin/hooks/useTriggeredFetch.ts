// hooks/useTriggeredFetch.ts

import { useState, useEffect, useCallback } from "react";
import useWebSocket from "./useWebSocket"; // We still use the base hook for the connection

interface TriggeredFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseTriggeredFetchOptions<T> {
  wsUrl: string;
  fetcher: () => Promise<T>;
}

// This parser specifically looks for a `{"payload": true}` message
const parseTrigger = (parsedJson: any) => parsedJson?.payload === true;

export function useTriggeredFetch<T>({ wsUrl, fetcher }: UseTriggeredFetchOptions<T>) {
  const [state, setState] = useState<TriggeredFetchState<T>>({
    data: null,
    isLoading: true, // Start loading initially
    error: null,
  });

  // WebSocket hook to listen for the trigger
  const triggerSocket = useWebSocket<boolean>({
    url: wsUrl,
    parse: parseTrigger,
  });

  // A memoized function to fetch data from the API
  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const data = await fetcher();
      setState({ data, isLoading: false, error: null });
    } catch (err: any) {
      setState({ data: null, isLoading: false, error: err });
    }
  }, [fetcher]);

  // 1. Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Listen for a trigger from the WebSocket to refetch data
  useEffect(() => {
    // triggerSocket.data will become `true` when a valid trigger is received
    if (triggerSocket.data === true) {
      console.log(`Trigger received from ${wsUrl}, refetching data...`);
      fetchData();
    }
  }, [triggerSocket.data, fetchData, wsUrl]);

  return state;
}