import localforage from "localforage";
import type { AppState } from "../model/types";

// Production persistence (build spec §7). Identical signatures to the prototype's
// window.storage seam — the ONLY swap point. No component imports localforage.
// Later, layer an encrypted backend behind these same three functions.

const STORE = localforage.createInstance({ name: "clear" });
const KEY = "clear_recovery_state_v1";

export async function loadState(): Promise<AppState | null> {
  try {
    return ((await STORE.getItem<AppState>(KEY)) as AppState) ?? null;
  } catch {
    return null;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await STORE.setItem(KEY, state);
  } catch (e) {
    console.error("persist failed", e);
  }
}

export async function resetStore(): Promise<void> {
  try {
    await STORE.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
