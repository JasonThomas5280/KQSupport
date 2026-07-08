import { useState } from "react";
import { Field } from "../components/Field";
import { OnboardingArt } from "../components/OnboardingArt";
import { StepIndicator } from "../components/StepIndicator";
import { PRODUCTS } from "../model/constants";
import { todayISO } from "../model/dates";
import type { Method, Product, Profile } from "../model/types";
import {
  ACCENT,
  TEXT,
  ghostBtn,
  inputStyle,
  overlayStyle,
  primaryBtn,
} from "../styles/tokens";

export function Onboarding({ onComplete }: { onComplete: (profile: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [product, setProduct] = useState<Product>("Feel Free");
  const [method, setMethod] = useState<Method>("cold_turkey");
  const [quitDate, setQuitDate] = useState(todayISO());
  const [spendVal, setSpendVal] = useState("");
  const [spendUnit, setSpendUnit] = useState<"day" | "week">("day");

  const finish = () => {
    const perDay =
      spendVal === ""
        ? null
        : spendUnit === "week"
          ? Number(spendVal) / 7
          : Number(spendVal);
    onComplete({
      name: name.trim() || "Friend",
      reason: reason.trim(),
      product,
      method,
      quitDate,
      dailySpend: perDay,
    });
  };

  const steps = [
    <div key="0" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
      <OnboardingArt variant="path" />
      <div style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.3 }}>
        Getting off kratom isn't a streak.
        <br />
        It's a direction.
      </div>
      <div style={{ fontSize: 15, color: "rgba(234,242,244,0.6)", lineHeight: 1.6 }}>
        This tracks your whole path — not just days since a slip. It knows the withdrawal timeline, counts
        what you're saving, has a tool for the moment you're about to use, and never resets you to zero for
        being human.
      </div>
      <button style={primaryBtn} onClick={() => setStep(1)}>
        Start
      </button>
    </div>,
    <div key="1" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <OnboardingArt variant="wave" />
      <div style={{ fontSize: 22, fontWeight: 300 }}>What are you stepping away from?</div>
      <Field label="What were you using?">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {PRODUCTS.map((p) => (
            <button
              key={p}
              onClick={() => setProduct(p)}
              style={{
                padding: "13px 10px",
                borderRadius: 11,
                cursor: "pointer",
                fontSize: 13,
                color: TEXT,
                background: product === p ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)",
                border: product === p ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Your name">
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="First name or initial" />
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <button style={{ ...ghostBtn, flex: 1 }} onClick={() => setStep(0)}>
          Back
        </button>
        <button style={{ ...primaryBtn, flex: 2 }} onClick={() => setStep(2)}>
          Next
        </button>
      </div>
    </div>,
    <div key="2" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <OnboardingArt variant="sunrise" />
      <div style={{ fontSize: 22, fontWeight: 300 }}>Your reason.</div>
      <Field
        label="Why are you quitting?"
        hint="This leads your home screen instead of a number — and it's what the craving tool shows you mid-wave. Quitting won't fix everything underneath, and that's okay; it's still worth it."
      >
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: "none", lineHeight: 1.5 }}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Get my money back. Get my mornings back. Stop hiding it."
        />
      </Field>
      <Field label="When was your last use?">
        <input type="date" style={inputStyle} value={quitDate} max={todayISO()} onChange={(e) => setQuitDate(e.target.value)} />
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <button style={{ ...ghostBtn, flex: 1 }} onClick={() => setStep(1)}>
          Back
        </button>
        <button style={{ ...primaryBtn, flex: 2 }} onClick={() => setStep(3)} disabled={!reason.trim()}>
          Next
        </button>
      </div>
    </div>,
    <div key="3" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <OnboardingArt variant="savings" />
      <div style={{ fontSize: 22, fontWeight: 300 }}>The money.</div>
      <Field
        label="How much were you spending?"
        hint="For Feel Free especially this is brutal — and watching it convert to money saved is one of the strongest things people hold onto. Optional; editable later."
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 18, color: "rgba(234,242,244,0.5)" }}>$</span>
          <input type="number" style={inputStyle} value={spendVal} onChange={(e) => setSpendVal(e.target.value)} placeholder="0" />
          <div style={{ display: "flex", gap: 4 }}>
            {(["day", "week"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setSpendUnit(u)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  color: TEXT,
                  background: spendUnit === u ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)",
                  border: spendUnit === u ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                /{u}
              </button>
            ))}
          </div>
        </div>
      </Field>
      <Field label="How are you quitting?">
        <div style={{ display: "flex", gap: 8 }}>
          {([["cold_turkey", "Cold turkey"], ["taper", "Tapering down"]] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setMethod(v)}
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 11,
                cursor: "pointer",
                fontSize: 14,
                color: TEXT,
                background: method === v ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)",
                border: method === v ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <button style={{ ...ghostBtn, flex: 1 }} onClick={() => setStep(2)}>
          Back
        </button>
        <button style={{ ...primaryBtn, flex: 2 }} onClick={finish}>
          Begin
        </button>
      </div>
    </div>,
  ];

  return (
    <div style={{ ...overlayStyle, justifyContent: "flex-start" }}>
      <StepIndicator step={step} total={4} />
      {steps[step]}
    </div>
  );
}
