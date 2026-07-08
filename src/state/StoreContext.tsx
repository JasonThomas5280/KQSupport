import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { appReducer, type Action } from "./reducer";
import { loadState, saveState, resetStore } from "./storage";
import { DEFAULT_STATE } from "../model/constants";
import { Splash } from "../components/Splash";
import type { AppState } from "../model/types";

interface StoreValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  /** Clears persistence then resets in-memory state. */
  hardReset: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load once on mount; fall back to DEFAULT_STATE.
  useEffect(() => {
    // Ask the browser to shield this origin's storage from eviction —
    // Safari in particular deletes un-persisted IndexedDB after inactivity,
    // and this data is someone's entire recorded journey.
    void navigator.storage?.persist?.().catch(() => {});
    (async () => {
      const loaded = await loadState();
      if (loaded) dispatch({ type: "HYDRATE", state: loaded });
      setReady(true);
    })();
  }, []);

  // 300ms debounced save — coalesces rapid edits into one write (spec §3).
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  const hardReset = async () => {
    await resetStore();
    dispatch({ type: "HARD_RESET" });
  };

  if (!ready) {
    return <Splash />;
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, hardReset }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
