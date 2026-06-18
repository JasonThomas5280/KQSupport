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
}: {
  onClose: () => void;
  onSave: (member: CircleMember) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Support person");
  const [isGoTo, setIsGoTo] = useState(true);
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
        <Field
          label="Phone number"
          hint="So the “Text them” button in a craving opens a message to them, pre-written. Optional, but that button needs it."
        >
          <input
            type="tel"
            style={inputStyle}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
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
          label="Your go-to person for hard moments?"
          hint="The one the craving tool reaches first. You can have more than one — this just sets who's first."
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => setIsGoTo(v)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 11,
                  cursor: "pointer",
                  fontSize: 14,
                  color: TEXT,
                  background: isGoTo === v ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)",
                  border: isGoTo === v ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {v ? "Yes" : "Not now"}
              </button>
            ))}
          </div>
        </Field>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 14,
            fontSize: 12,
            color: "rgba(234,242,244,0.5)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "rgba(234,242,244,0.7)" }}>Coming soon:</strong> letting them see the
          check-ins you choose to share, and a gentle nudge if you go quiet. Those need a secure account
          for both of you, so they're not on yet — for now, Circle keeps your people one tap away.
        </div>
      </div>
      <button
        style={{ ...primaryBtn, marginTop: 24 }}
        disabled={!name.trim()}
        onClick={() => {
          onSave({
            id: Date.now().toString(),
            name: name.trim(),
            phone: phone.trim(),
            role,
            isGoTo,
            quietAlertDays: 3,
          });
          onClose();
        }}
      >
        Add
      </button>
    </div>
  );
}
