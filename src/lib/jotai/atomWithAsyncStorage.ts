import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { getItem, removeItem, setItem } from "@/lib/storage";

/**
 * Phase_0 stub.
 *
 * CardNexus uses a sync storage (MMKV) behind Jotai. For this take-home we’ll
 * likely use async persistence (AsyncStorage) for TODOs and SecureStore for
 * auth-related metadata, but we’ll implement the actual persistence in Phase_2.
 */
export const atomWithAsyncStorage = <T>(key: string, initialValue: T) => {
  const storage = createJSONStorage<T>(() => ({
    getItem,
    setItem,
    removeItem,
  }));

  return atomWithStorage<T>(key, initialValue, storage);
};
