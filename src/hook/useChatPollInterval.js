import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useIsFocused } from "@react-navigation/native";

/**
 * The Dashboard polls unconditionally (it's a browser tab). On mobile that
 * drains battery and data, so polling only runs while the screen is focused
 * AND the app is in the foreground.
 *
 * Returns the value to pass to Apollo's `pollInterval` (0 disables polling).
 */

export function useChatPollInterval(intervalMs) {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  return isFocused && appState === "active" ? intervalMs : 0;
}
