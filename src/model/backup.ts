import type { AppState } from "./types";

/** Full app state as pretty-printed JSON — the downloadable backup body. */
export function serializeState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}
