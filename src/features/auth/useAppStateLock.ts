import { useSetAtom, useStore } from "jotai/react";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { lockAuthAtom, refreshAuthAtom } from "./_atoms/auth";

/**
 * Subscribes to AppState and locks auth when the app goes to background or inactive,
 * so the next protected action will require re-authentication.
 * Mount once at app root (e.g. in _layout.tsx).
 */
export function useAppStateLock() {
  const store = useStore();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "background" || nextState === "inactive") {
          store.set(lockAuthAtom);
        }
      }
    );
    return () => subscription.remove();
  }, [store]);
}

/**
 * Mount once at app root: loads persisted auth state on start and subscribes to AppState lock.
 */
export function useAuthInit() {
  useAppStateLock();
  const refreshAuth = useSetAtom(refreshAuthAtom);
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);
}
