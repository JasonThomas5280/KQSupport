import { useState } from "react";
import { Field } from "../components/Field";
import type { AppState } from "../model/types";
import {
  closeBtnStyle,
  eyebrow,
  ghostBtn,
  inputStyle,
  overlayStyle,
  primaryBtn,
} from "../styles/tokens";

export function SettingsScreen({
  state,
  onClose,
  onPatch,
  onHardReset,
}: {
  state: AppState;
  onClose: () => void;
  onPatch: (patch: Partial<AppState>) => void;
  onHardReset: () => void;
}) {
  const [name, setName] = useState(state.profile.name);
  const [reason, setReason] = useState(state.profile.reason);
  const [spend, setSpend] = useState<string>(
    state.profile.dailySpend != null ? String(state.profile.dailySpend) : "",
  );
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
        ×
      </button>
      <div style={{ marginBottom: 22 }}>
        <div style={eyebrow}>Settings</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Name">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Your reason">
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: "none", lineHeight: 1.5 }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <Field label="Spend per day ($)" hint="Drives your money-saved total.">
          <input type="number" style={inputStyle} value={spend} onChange={(e) => setSpend(e.target.value)} />
        </Field>
        <button
          style={primaryBtn}
          onClick={() => {
            onPatch({
              profile: {
                ...state.profile,
                name: name.trim(),
                reason: reason.trim(),
                dailySpend: spend === "" ? null : Number(spend),
              },
            });
            onClose();
          }}
        >
          Save
        </button>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 0" }} />
        <button
          style={{ ...ghostBtn, color: "#d4685e", borderColor: "rgba(212,104,94,0.3)" }}
          onClick={() => {
            if (confirm("Erase everything and start over?")) onHardReset();
          }}
        >
          Reset all data
        </button>
        <div
          style={{
            fontSize: 11,
            color: "rgba(234,242,244,0.3)",
            lineHeight: 1.5,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          This app is a tracker and support tool, not medical care. It does not give dosing or treatment
          advice. Severe withdrawal can be dangerous — if you have chest pain, seizures, or thoughts of
          self-harm, seek medical help.
        </div>
      </div>
    </div>
  );
}
