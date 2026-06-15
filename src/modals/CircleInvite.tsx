import { useState } from "react";
import { Field } from "../components/Field";
import type { CircleMember } from "../model/types";
import {
  ACCENT,
  TEXT,
  closeBtnStyle,
  eyebrow,
  inputStyle,
  overlayStyle,
  primaryBtn,
} from "../styles/tokens";

export function CircleInviteScreen({
  onClose,
  onSave,
  defaultQuietDays,
}: {
  onClose: () => void;
  onSave: (member: CircleMember) => void;
  defaultQuietDays: number;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Support person");
  const [shared, setShared] = useState(true);
  const [quietDays, setQuietDays] = useState(defaultQuietDays);
  const roles = ["Support person", "Sponsor / counselor", "Family", "Quit buddy"];
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
        ×
      </button>
      <div style={{ marginBottom: 22 }}>
        <div style={eyebrow}>Add to your Circle</div>
        <div style={{ fontSize: 24, fontWeight: 300 }}>Who's in this with you?</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="Name">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name" />
        </Field>
        <Field label="Who are they?">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: "12px 10px",
                  borderRadius: 11,
                  cursor: "pointer",
                  fontSize: 13,
                  color: TEXT,
                  background: role === r ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)",
                  border: role === r ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </Field>
        <Field
          label="Share your check-ins with them?"
          hint="They see only what you share. Revocable anytime. The person you'd text mid-craving should be shared."
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => setShared(v)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 11,
                  cursor: "pointer",
                  fontSize: 14,
                  color: TEXT,
                  background: shared === v ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)",
                  border: shared === v ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {v ? "Yes, share" : "Keep private"}
              </button>
            ))}
          </div>
        </Field>
        <Field label={`Nudge them if I go quiet for ${quietDays} days`} hint="Isolation is where relapse hides.">
          <input
            type="range"
            min="1"
            max="7"
            value={quietDays}
            onChange={(e) => setQuietDays(Number(e.target.value))}
            style={{ width: "100%", accentColor: ACCENT }}
          />
        </Field>
      </div>
      <button
        style={{ ...primaryBtn, marginTop: 24 }}
        disabled={!name.trim()}
        onClick={() => {
          onSave({
            id: Date.now().toString(),
            name: name.trim(),
            role,
            sharedVisibility: shared,
            quietAlertDays: quietDays,
          });
          onClose();
        }}
      >
        Add
      </button>
    </div>
  );
}
