import { useState } from "react";
import { SeverityTrack } from "../components/SeverityTrack";
import { StepIndicator } from "../components/StepIndicator";
import { SYMPTOMS, MOOD_MAP } from "../model/constants";
import { todayISO } from "../model/dates";
import type { CheckinEntry } from "../model/types";
import {
  TEXT,
  closeBtnStyle,
  eyebrow,
  ghostBtn,
  inputStyle,
  overlayStyle,
  primaryBtn,
} from "../styles/tokens";

export function CheckInScreen({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (entry: CheckinEntry) => void;
}) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<string | null>(null);
  const [sev, setSev] = useState<Record<string, number | undefined>>({});
  const [note, setNote] = useState("");
  const moods = Object.entries(MOOD_MAP).map(([k, v]) => ({ key: k, ...v }));
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
        ×
      </button>
      <StepIndicator step={step - 1} total={2} label={step === 1 ? "How you feel" : "Symptoms & note"} />
      {step === 1 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          <div>
            <div style={eyebrow}>Check-in</div>
            <div style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.3 }}>How are you right now?</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {moods.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setMood(m.key);
                  setStep(2);
                }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "22px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  color: TEXT,
                }}
              >
                <span style={{ fontSize: 32 }}>{m.emoji}</span>
                <span style={{ fontSize: 14 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, paddingTop: 16 }}>
          {mood === "crisis" && (
            <div
              style={{
                background: "rgba(212,104,94,0.12)",
                border: "1px solid rgba(212,104,94,0.3)",
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Close to using? There's a tool for this exact moment.
              </div>
              <div style={{ fontSize: 13, color: "rgba(234,242,244,0.7)", lineHeight: 1.6 }}>
                Finish this check-in, or tap the red Help tab at the bottom to ride the craving out.
              </div>
            </div>
          )}
          <div>
            <div style={eyebrow}>What are you feeling — and how strong?</div>
            <div style={{ fontSize: 16, fontWeight: 300, color: "rgba(234,242,244,0.7)" }}>
              Tap a symptom, then rate 1–5. Rating it is how the app shows you it's fading over time.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SYMPTOMS.map((s) => (
              <SeverityTrack
                key={s.key}
                label={s.label}
                value={sev[s.key]}
                onChange={(v) => setSev((p) => ({ ...p, [s.key]: v }))}
              />
            ))}
          </div>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "none", lineHeight: 1.5 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything else? Optional."
          />
          <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
            <button style={{ ...ghostBtn, flex: 1 }} onClick={() => setStep(1)}>
              Back
            </button>
            <button
              style={{ ...primaryBtn, flex: 2 }}
              onClick={() => {
                const symptoms = Object.entries(sev)
                  .filter(([, v]) => v)
                  .map(([key, severity]) => ({ key, severity: severity as number }));
                onSubmit({
                  type: "checkin",
                  date: todayISO(),
                  mood: mood as string,
                  symptoms,
                  note: note.trim(),
                });
                onClose();
              }}
            >
              Log it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
