import { todayISO } from "../model/dates";
import { DEFAULT_STATE } from "../model/constants";
import type {
  AppState,
  CircleMember,
  Entry,
  Profile,
  Taper,
  UrgeOutcome,
} from "../model/types";

export type Action =
  | { type: "HYDRATE"; state: AppState }
  | { type: "COMPLETE_ONBOARDING"; profile: Profile }
  | { type: "PATCH"; patch: Partial<AppState> }
  | { type: "ADD_ENTRY"; entry: Entry }
  | { type: "SAVE_TAPER"; taper: Taper }
  | { type: "ADD_CIRCLE"; member: CircleMember }
  | { type: "RESOLVE_URGE"; outcome: UrgeOutcome }
  | { type: "HARD_RESET" };

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "COMPLETE_ONBOARDING":
      return { ...state, onboarded: true, profile: action.profile };
    case "PATCH":
      return { ...state, ...action.patch };
    case "ADD_ENTRY":
      return { ...state, entries: [action.entry, ...state.entries] };
    case "SAVE_TAPER":
      return { ...state, taper: action.taper };
    case "ADD_CIRCLE":
      return { ...state, circle: [...state.circle, action.member] };
    case "RESOLVE_URGE": {
      const urge = { date: todayISO(), ts: Date.now(), outcome: action.outcome };
      const next: AppState = {
        ...state,
        urgesRidden: [urge, ...(state.urgesRidden || [])],
      };
      // "used" ALSO logs a setback — preserves progress, never a "reset".
      if (action.outcome === "used") {
        next.entries = [
          {
            type: "setback",
            date: todayISO(),
            note: "Logged from an urge moment.",
            learned: "",
            nextMove: "",
          },
          ...state.entries,
        ];
      }
      return next;
    }
    case "HARD_RESET":
      return { ...DEFAULT_STATE, profile: { ...DEFAULT_STATE.profile, quitDate: todayISO() } };
    default:
      return state;
  }
}
