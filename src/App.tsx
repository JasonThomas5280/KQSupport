import { useState } from "react";
import { useStore } from "./state/StoreContext";
import { deriveMetrics, deriveJourney, deriveSymptomTrend } from "./model/derive";
import type { CircleMember } from "./model/types";
import { Onboarding } from "./screens/Onboarding";
import { Today } from "./screens/Today";
import { Money } from "./screens/Money";
import { Path } from "./screens/Path";
import { Circle } from "./screens/Circle";
import {
  IconCircle,
  IconHelp,
  IconMoney,
  IconPath,
  IconSettings,
  IconToday,
  type IconProps,
} from "./components/icons";
import { UrgeScreen } from "./modals/Urge";
import { CheckInScreen } from "./modals/CheckIn";
import { DocumentScreen } from "./modals/Document";
import { TaperScreen } from "./modals/Taper";
import { CircleInviteScreen } from "./modals/CircleInvite";
import { SettingsScreen } from "./modals/Settings";
import { ACCENT, BG, TEXT } from "./styles/tokens";

type Screen = "home" | "progress" | "journey" | "connect";
type Modal = "urge" | "checkin" | "document" | "taper" | "invite" | "settings" | null;

// Open the SMS composer pre-addressed to the member, body prefilled (spec §8.1).
// "?&body=" is the form that works across iOS and Android.
function textCircle(member: CircleMember) {
  const body = encodeURIComponent("I'm having a hard moment, can you talk?");
  const to = member.phone.replace(/[^\d+]/g, "");
  window.location.href = `sms:${to}?&body=${body}`;
}

export default function App() {
  const { state, dispatch, hardReset } = useStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [modal, setModal] = useState<Modal>(null);

  if (!state.onboarded) {
    return (
      <Onboarding onComplete={(profile) => dispatch({ type: "COMPLETE_ONBOARDING", profile })} />
    );
  }

  const m = deriveMetrics(state);
  const journey = deriveJourney(state);
  const trend = deriveSymptomTrend(state);

  const tabs: { key: Screen; label: string; Icon: (p: IconProps) => JSX.Element }[] = [
    { key: "home", label: "Today", Icon: IconToday },
    { key: "progress", label: "Money", Icon: IconMoney },
    { key: "journey", label: "Path", Icon: IconPath },
    { key: "connect", label: "Circle", Icon: IconCircle },
  ];

  return (
    <>
      <div className="clear-desktop-brand">
        <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: 5, color: "rgba(234,242,244,0.8)" }}>CLEAR</div>
        <div style={{ fontSize: 12, color: "rgba(234,242,244,0.4)", marginTop: 4 }}>
          Track the whole path, not just the streak.
        </div>
      </div>
    <div
      className="clear-phone"
      style={{
        background: BG,
        color: TEXT,
        minHeight: "100vh",
        position: "relative",
        maxWidth: 430,
        margin: "0 auto",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {modal === "urge" && (
        <UrgeScreen
          state={state}
          onClose={() => setModal(null)}
          onResolve={(outcome) => dispatch({ type: "RESOLVE_URGE", outcome })}
          onTextCircle={textCircle}
        />
      )}
      {modal === "checkin" && (
        <CheckInScreen onClose={() => setModal(null)} onSubmit={(entry) => dispatch({ type: "ADD_ENTRY", entry })} />
      )}
      {modal === "document" && (
        <DocumentScreen onClose={() => setModal(null)} onSubmit={(entry) => dispatch({ type: "ADD_ENTRY", entry })} />
      )}
      {modal === "taper" && (
        <TaperScreen taper={state.taper} onClose={() => setModal(null)} onSave={(taper) => dispatch({ type: "SAVE_TAPER", taper })} />
      )}
      {modal === "invite" && (
        <CircleInviteScreen
          onClose={() => setModal(null)}
          onSave={(member) => dispatch({ type: "ADD_CIRCLE", member })}
        />
      )}
      {modal === "settings" && (
        <SettingsScreen
          state={state}
          onClose={() => setModal(null)}
          onPatch={(patch) => dispatch({ type: "PATCH", patch })}
          onHardReset={() => {
            void hardReset();
            setModal(null);
            setScreen("home");
          }}
        />
      )}

      <div className="clear-content" style={{ padding: "48px 24px 120px", minHeight: "100vh", boxSizing: "border-box" }}>
        <button
          onClick={() => setModal("settings")}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            borderRadius: 12,
            color: "rgba(234,242,244,0.65)",
            cursor: "pointer",
          }}
          aria-label="Settings"
        >
          <IconSettings size={20} />
        </button>

        {screen === "home" && (
          <Today
            state={state}
            m={m}
            onCheckIn={() => setModal("checkin")}
            onTaper={() => setModal("taper")}
            onDocument={() => setModal("document")}
          />
        )}
        {screen === "progress" && <Money state={state} m={m} onOpenSettings={() => setModal("settings")} />}
        {screen === "journey" && <Path m={m} journey={journey} trend={trend} />}
        {screen === "connect" && <Circle state={state} onInvite={() => setModal("invite")} />}
      </div>

      <div
        className="clear-tabbar"
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          boxSizing: "border-box",
          background: `linear-gradient(180deg, transparent, ${BG} 22%)`,
          padding: "18px 12px 26px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-end",
        }}
      >
        {/* Help: red-accented, always reachable, opens the urge tool — not a screen switch */}
        <button
          onClick={() => setModal("urge")}
          aria-label="I need help right now"
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 10px" }}
        >
          <span style={{ display: "flex", color: "#e87a70", filter: "drop-shadow(0 0 6px rgba(212,104,94,0.55))" }}>
            <IconHelp />
          </span>
          <span style={{ fontSize: 10, letterSpacing: 0.5, color: "#e87a70", fontWeight: 600 }}>Help</span>
        </button>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setScreen(t.key)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: screen === t.key ? ACCENT : "rgba(234,242,244,0.3)",
              padding: "4px 10px",
            }}
          >
            <span style={{ display: "flex" }}>
              <t.Icon />
            </span>
            <span style={{ fontSize: 10, letterSpacing: 0.5 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
    </>
  );
}
