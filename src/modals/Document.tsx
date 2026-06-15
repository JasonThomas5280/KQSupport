import { useState } from "react";
import { Field } from "../components/Field";
import { todayISO } from "../model/dates";
import type { SetbackEntry } from "../model/types";
import { closeBtnStyle, eyebrow, inputStyle, overlayStyle, primaryBtn } from "../styles/tokens";

// "A slip is data, not a verdict." Never described as a reset (build spec §D).
export function DocumentScreen({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (entry: SetbackEntry) => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [what, setWhat] = useState("");
  const [learned, setLearned] = useState("");
  const [next, setNext] = useState("");
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
        ×
      </button>
      <div style={{ marginBottom: 26 }}>
        <div style={eyebrow}>Document a slip</div>
        <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.3, marginBottom: 8 }}>
          A slip is data, not a verdict.
        </div>
        <div style={{ fontSize: 14, color: "rgba(234,242,244,0.5)", lineHeight: 1.5 }}>
          Your cumulative progress stays. The count doesn't reset to zero. Most people who quit for good
          slipped on the way — what matters is what happens next.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="When?">
          <input type="date" style={inputStyle} value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="What led up to it?">
          <textarea
            style={{ ...inputStyle, minHeight: 64, resize: "none", lineHeight: 1.5 }}
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="The trigger, the moment. No judgment."
          />
        </Field>
        <Field label="What did you learn?">
          <textarea
            style={{ ...inputStyle, minHeight: 64, resize: "none", lineHeight: 1.5 }}
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            placeholder="Even one line."
          />
        </Field>
        <Field label="Next move?">
          <textarea
            style={{ ...inputStyle, minHeight: 64, resize: "none", lineHeight: 1.5 }}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="One small step."
          />
        </Field>
      </div>
      <button
        style={{ ...primaryBtn, marginTop: 24 }}
        onClick={() => {
          onSubmit({
            type: "setback",
            date,
            note: what.trim(),
            learned: learned.trim(),
            nextMove: next.trim(),
          });
          onClose();
        }}
      >
        Keep going
      </button>
    </div>
  );
}
