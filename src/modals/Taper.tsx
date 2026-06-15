import { useState } from "react";
import { Field } from "../components/Field";
import { todayISO } from "../model/dates";
import type { Taper, TaperUnit } from "../model/types";
import {
  ACCENT,
  TEXT,
  closeBtnStyle,
  eyebrow,
  inputStyle,
  overlayStyle,
  primaryBtn,
} from "../styles/tokens";

// Log-only. Records numbers the USER decides; never recommends a dose, rate, or
// schedule (build spec §2 — non-negotiable safety boundary).
export function TaperScreen({
  taper,
  onClose,
  onSave,
}: {
  taper: Taper;
  onClose: () => void;
  onSave: (taper: Taper) => void;
}) {
  const [startDose, setStartDose] = useState<string>(
    taper.startDose != null ? String(taper.startDose) : "",
  );
  const [currentDose, setCurrentDose] = useState<string>(
    taper.currentDose != null ? String(taper.currentDose) : "",
  );
  const [unit, setUnit] = useState<TaperUnit>(taper.unit || "g");
  const [goal, setGoal] = useState<string>(taper.goal != null ? String(taper.goal) : "0");
  const units: TaperUnit[] = ["g", "ml", "bottles"];
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
        ×
      </button>
      <div style={{ marginBottom: 22 }}>
        <div style={eyebrow}>Taper log</div>
        <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.3 }}>Track your own taper.</div>
        <div style={{ fontSize: 13, color: "rgba(234,242,244,0.5)", lineHeight: 1.5, marginTop: 8 }}>
          This records the numbers <em>you</em> decide on. It does not recommend doses or schedules — for a
          medical taper, talk to a clinician.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Starting dose">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="number" style={inputStyle} value={startDose} onChange={(e) => setStartDose(e.target.value)} placeholder="0" />
            <div style={{ display: "flex", gap: 4 }}>
              {units.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  style={{
                    padding: "10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 12,
                    color: TEXT,
                    background: unit === u ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)",
                    border: unit === u ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </Field>
        <Field label={`Today's dose (${unit})`} hint="Log it whenever you step down. Your trend line shows the descent.">
          <input type="number" style={inputStyle} value={currentDose} onChange={(e) => setCurrentDose(e.target.value)} placeholder="0" />
        </Field>
        <Field label={`Goal (${unit})`} hint="Usually 0.">
          <input type="number" style={inputStyle} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="0" />
        </Field>
      </div>
      <button
        style={{ ...primaryBtn, marginTop: 24 }}
        onClick={() => {
          onSave({
            active: true,
            unit,
            startDose: Number(startDose) || null,
            currentDose: Number(currentDose) || null,
            goal: Number(goal) || 0,
            history: [...(taper.history || []), { date: todayISO(), dose: Number(currentDose) || 0 }],
          });
          onClose();
        }}
      >
        Save taper log
      </button>
    </div>
  );
}
