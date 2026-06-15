import { useEffect, useRef, useState } from "react";
import {
  ACCENT,
  PANEL,
  TEXT,
  closeBtnStyle,
  ghostBtn,
  overlayStyle,
  primaryBtn,
} from "../styles/tokens";
import type { AppState, CircleMember, UrgeOutcome } from "../model/types";

// The core intervention. Supports & redirects only — never assesses, diagnoses,
// scores risk, or replaces a human/hotline (build spec §2).
export function UrgeScreen({
  state,
  onClose,
  onResolve,
  onTextCircle,
}: {
  state: AppState;
  onClose: () => void;
  onResolve: (outcome: UrgeOutcome) => void;
  onTextCircle: (member: CircleMember) => void;
}) {
  const [phase, setPhase] = useState<"hold" | "breathe" | "after">("hold");
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reason = state.profile.reason;
  const shareable = state.circle.filter((c) => c.sharedVisibility);

  useEffect(() => {
    if (phase !== "breathe") return;
    timerRef.current = setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "breathe") return;
    const seq: [typeof breathPhase, number][] = [
      ["in", 4000],
      ["hold", 4000],
      ["out", 6000],
    ];
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setBreathPhase(seq[i][0]);
      const d = seq[i][1];
      i = (i + 1) % seq.length;
      t = setTimeout(tick, d);
    };
    tick();
    return () => clearTimeout(t);
  }, [phase]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const breathLabel =
    breathPhase === "in" ? "Breathe in" : breathPhase === "hold" ? "Hold" : "Breathe out";
  const breathScale = breathPhase === "out" ? 0.85 : 1.25;
  const elapsed = 20 * 60 - secondsLeft;

  return (
    <div style={{ ...overlayStyle, background: "#0a1118" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
        ×
      </button>

      {phase === "hold" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
          <div style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.35 }}>
            This craving is a wave.
            <br />
            It crests and it falls.
          </div>
          <div style={{ fontSize: 15, color: "rgba(234,242,244,0.7)", lineHeight: 1.65 }}>
            A craving usually peaks and passes within about 20–30 minutes — whether or not you use. You
            don't have to fight it or fix it. You just have to outlast this one wave. Let's ride it
            together.
          </div>
          {reason && (
            <div
              style={{
                background: "rgba(95,176,165,0.1)",
                border: `1px solid rgba(95,176,165,0.25)`,
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: ACCENT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>
                Why you started this
              </div>
              <div style={{ fontSize: 17, fontWeight: 300, fontStyle: "italic", lineHeight: 1.4 }}>"{reason}"</div>
            </div>
          )}
          <button style={primaryBtn} onClick={() => setPhase("breathe")}>
            Ride the wave with me
          </button>
          {shareable.length > 0 && (
            <button style={ghostBtn} onClick={() => onTextCircle(shareable[0])}>
              Text {shareable[0].name} right now
            </button>
          )}
          <div style={{ fontSize: 12, color: "rgba(234,242,244,0.45)", textAlign: "center", lineHeight: 1.6 }}>
            In crisis? SAMHSA <strong>1-800-662-4357</strong> · Text <strong>HOME to 741741</strong>
          </div>
        </div>
      )}

      {phase === "breathe" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 30 }}>
          <div style={{ fontSize: 13, color: "rgba(234,242,244,0.5)", letterSpacing: 1 }}>The wave passes in</div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 1 }}>
            {mins}:{String(secs).padStart(2, "0")}
          </div>
          <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(95,176,165,0.25), rgba(95,176,165,0.05))`,
                border: `2px solid ${ACCENT}`,
                transform: `scale(${breathScale})`,
                transition: `transform ${breathPhase === "out" ? 6 : 4}s ease-in-out`,
              }}
            />
            <div style={{ fontSize: 18, fontWeight: 400, zIndex: 1 }}>{breathLabel}</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(234,242,244,0.6)", textAlign: "center", lineHeight: 1.6, maxWidth: 280 }}>
            Follow the circle. Cravings shrink while you breathe — you're already {Math.floor(elapsed / 60)}m{" "}
            {elapsed % 60}s through this one.
          </div>
          <button style={{ ...primaryBtn, maxWidth: 280 }} onClick={() => setPhase("after")}>
            I'm steadier now
          </button>
        </div>
      )}

      {phase === "after" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
          <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.35 }}>How did the wave end?</div>
          <div style={{ fontSize: 14, color: "rgba(234,242,244,0.6)", lineHeight: 1.6 }}>
            However it went, opening this instead of using is the muscle. No wrong answer — this is just for
            your record.
          </div>
          {(
            [
              { o: "rode_it", label: "I rode it out", sub: "The craving passed and I didn't use" },
              { o: "reached_out", label: "I reached out", sub: "I contacted someone in my Circle" },
              {
                o: "used",
                label: "I used this time",
                sub: "It's logged as a slip — not a reset. You still showed up here.",
              },
            ] as const
          ).map((x) => (
            <button
              key={x.o}
              onClick={() => {
                onResolve(x.o);
                onClose();
              }}
              style={{
                textAlign: "left",
                background: PANEL,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 16,
                cursor: "pointer",
                color: TEXT,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600 }}>{x.label}</div>
              <div style={{ fontSize: 12, color: "rgba(234,242,244,0.5)", marginTop: 3, lineHeight: 1.4 }}>{x.sub}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
