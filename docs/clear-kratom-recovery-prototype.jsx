import { useState, useEffect, useRef, useCallback } from "react";

/**
 * CLEAR — Kratom & Feel Free Recovery  (v1.25)
 * --------------------------------------------
 * Secular, withdrawal-aware recovery tracker for the kratom / 7-OH / Feel Free
 * community. Functional reference for Claude Code: every flow writes real state
 * and persists across sessions via window.storage.
 *
 * SWAP-POINT for production: loadState / saveState / resetStore only.
 *
 * v1.25 "25% better" additions:
 *  - URGE TOOL: always-visible "I need help right now" button -> urge-surfing flow
 *    (wave timer, breathing pacer, their reason, one-tap Circle text, helplines).
 *    Supports & redirects; never assesses, diagnoses, or replaces a human/hotline.
 *  - SYMPTOM SEVERITY OVER TIME: check-ins capture 1-5 severity; Saved screen
 *    plots intensity vs. days-since-quit so the line visibly DESCENDS.
 *  - MILESTONES: withdrawal-meaningful clean-time + money-saved thresholds.
 */

// ============================================================
// PERSISTENCE  (swap for real backend in production)
// ============================================================
const STORAGE_KEY = "clear_recovery_state_v1";
async function loadState() {
  try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveState(s) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(s)); }
  catch (e) { console.error("persist failed", e); }
}
async function resetStore() { try { await window.storage.delete(STORAGE_KEY); } catch {} }

// ============================================================
// MODEL
// ============================================================
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

const SYMPTOMS = [
  { key: "cravings", label: "Cravings" },
  { key: "anxiety", label: "Anxiety" },
  { key: "sleep", label: "Can't sleep" },
  { key: "energy", label: "Low energy" },
  { key: "restless", label: "Restless / RLS" },
  { key: "gi", label: "Stomach / nausea" },
  { key: "mood", label: "Low mood" },
  { key: "irritable", label: "Irritable" },
];

function phaseFor(dayNum) {
  if (dayNum <= 0) return { tag: "Starting", msg: "Day one is a decision you can make again every hour. You don't have to feel good to be doing this right." };
  if (dayNum === 1) return { tag: "Day 1", msg: "Symptoms often begin now. They build before they break. Hydrate, rest, ride the waves — each one ends." };
  if (dayNum === 2) return { tag: "Day 2", msg: "Climbing toward the peak. This is hard and it is temporary. The discomfort is your body recalibrating, not a sign you're failing." };
  if (dayNum >= 3 && dayNum <= 4) return { tag: `Day ${dayNum} — the peak`, msg: "This is usually the hardest stretch — and the one people most often quit during, because relief is one dose away. It lifts from here. Hold on." };
  if (dayNum >= 5 && dayNum <= 7) return { tag: `Day ${dayNum}`, msg: "The acute peak is breaking. Physical symptoms ease over the next few days. Sleep may still be rough — that's normal and it passes." };
  if (dayNum >= 8 && dayNum <= 14) return { tag: `Day ${dayNum}`, msg: "Through the acute phase. Energy and sleep are rebuilding. Cravings come in waves now, not constant — each one you ride teaches your brain it can." };
  if (dayNum >= 15 && dayNum <= 42) return { tag: `Day ${dayNum} — rebuilding`, msg: "You may hit flat, low-energy, low-motivation stretches (PAWS). This is not relapse and not failure — it's the long tail of healing. It keeps getting better." };
  return { tag: `Day ${dayNum}`, msg: "You're well past the hardest part. The brain keeps healing for months. Notice how far this is from day one." };
}

function cleanMilestones(streak) {
  const defs = [
    { d: 1, label: "First day down" }, { d: 4, label: "Through the peak" },
    { d: 7, label: "Acute phase behind you" }, { d: 14, label: "Two weeks clear" },
    { d: 30, label: "One month" }, { d: 60, label: "Two months" }, { d: 90, label: "Ninety days" },
  ];
  return defs.map(x => ({ ...x, hit: streak >= x.d }));
}
function moneyMilestones(saved) {
  if (saved == null) return [];
  return [100, 250, 500, 1000, 2000, 5000].map(v => ({ v, hit: saved >= v }));
}

const DEFAULT_STATE = {
  onboarded: false,
  profile: { name: "", reason: "", product: "Feel Free", method: "cold_turkey", quitDate: todayISO(), dailySpend: null },
  entries: [],
  urgesRidden: [],
  taper: { active: false, startDose: null, currentDose: null, unit: "g", goal: 0, history: [] },
  circle: [],
  settings: { reminderTime: "20:00", quietAlertDefaultDays: 3 },
};

function deriveMetrics(s) {
  const start = s.profile.quitDate, today = todayISO();
  const totalDaysTracked = Math.max(1, daysBetween(start, today) + 1);
  const setbackDates = new Set(s.entries.filter(e => e.type === "setback").map(e => e.date));
  const setbackCount = setbackDates.size;
  const cleanDays = Math.max(0, totalDaysTracked - setbackCount);
  const cumulativePct = Math.round((cleanDays / totalDaysTracked) * 100);
  let lastSetback = null;
  s.entries.filter(e => e.type === "setback").forEach(e => { if (!lastSetback || e.date > lastSetback) lastSetback = e.date; });
  const currentStreak = lastSetback ? daysBetween(lastSetback, today) : totalDaysTracked - 1;
  const moneySaved = s.profile.dailySpend ? Math.round(s.profile.dailySpend * cleanDays) : null;
  const urgesRidden = (s.urgesRidden || []).filter(u => u.outcome !== "used").length;
  return { totalDaysTracked, cleanDays, cumulativePct, currentStreak, setbackCount, daysSinceLastUse: currentStreak, moneySaved, urgesRidden };
}

function deriveJourney(s) {
  const start = new Date(s.profile.quitDate), today = new Date();
  const setbackDates = new Set(s.entries.filter(e => e.type === "setback").map(e => e.date));
  const months = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= today) {
    const y = cur.getFullYear(), mo = cur.getMonth();
    const mStart = new Date(y, mo, 1), mEnd = new Date(y, mo + 1, 0);
    const rStart = mStart < start ? start : mStart, rEnd = mEnd > today ? today : mEnd;
    const total = daysBetween(rStart, rEnd) + 1;
    let sb = 0; setbackDates.forEach(d => { const dd = new Date(d); if (dd >= rStart && dd <= rEnd) sb++; });
    months.push({ label: cur.toLocaleString("en", { month: "short" }), clean: Math.max(0, total - sb), total });
    cur = new Date(y, mo + 1, 1);
  }
  return months;
}

function deriveSymptomTrend(s) {
  const quit = s.profile.quitDate;
  const byDay = {};
  s.entries.filter(e => e.type === "checkin" && e.symptoms?.length).forEach(e => {
    const day = daysBetween(quit, e.date);
    const sev = e.symptoms.reduce((a, x) => a + (x.severity || 0), 0) / e.symptoms.length;
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(sev);
  });
  return Object.entries(byDay)
    .map(([day, arr]) => ({ day: Number(day), avg: arr.reduce((a, b) => a + b, 0) / arr.length }))
    .sort((a, b) => a.day - b.day);
}

const MOOD_MAP = {
  strong: { color: "#6db4a8", label: "Strong", emoji: "💪" },
  okay:   { color: "#5b8fc7", label: "Okay", emoji: "🙂" },
  rough:  { color: "#d89c5a", label: "Rough", emoji: "🌧️" },
  crisis: { color: "#d4685e", label: "Slipping", emoji: "🆘" },
};
const PRODUCTS = ["Feel Free", "Kratom (leaf/powder)", "7-OH extract / shots", "Other"];

// ============================================================
// STYLES
// ============================================================
const BG = "#0f1822", PANEL = "rgba(255,255,255,0.04)", TEXT = "#eaf2f4";
const ACCENT = "#5fb0a5", ACCENT2 = "#3d8b80", WARM = "#d89c5a";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 14px", color: TEXT, fontSize: 15, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };
const primaryBtn = { padding: "15px 0", borderRadius: 13, border: "none", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: "#06120f", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%" };
const ghostBtn = { padding: "13px 0", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: TEXT, fontSize: 15, cursor: "pointer", width: "100%" };
const overlayStyle = { position: "fixed", inset: 0, background: "#0c141d", color: TEXT, display: "flex", flexDirection: "column", zIndex: 100, padding: "60px 24px 40px", maxWidth: 430, margin: "0 auto", fontFamily: "'Inter', -apple-system, sans-serif" };
const closeBtnStyle = { position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "rgba(234,242,244,0.5)", fontSize: 28, cursor: "pointer", lineHeight: 1 };
const eyebrow = { fontSize: 13, color: "rgba(234,242,244,0.45)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" };

function Field({ label, children, hint }) {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <label style={{ fontSize: 14, fontWeight: 600, color: "rgba(234,242,244,0.8)" }}>{label}</label>
    {children}{hint && <span style={{ fontSize: 12, color: "rgba(234,242,244,0.4)", lineHeight: 1.4 }}>{hint}</span>}
  </div>);
}

function GradientRing({ percentage, size = 210, strokeWidth = 14 }) {
  const r = (size - strokeWidth) / 2, c = 2 * Math.PI * r, off = c - (percentage / 100) * c, ctr = size / 2;
  return (<svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
    <defs>
      <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={WARM} /><stop offset="45%" stopColor="#5b8fc7" /><stop offset="100%" stopColor={ACCENT} /></linearGradient>
      <filter id="gl"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <circle cx={ctr} cy={ctr} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
    <circle cx={ctr} cy={ctr} r={r} fill="none" stroke="url(#rg)" strokeWidth={strokeWidth} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" filter="url(#gl)" style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
  </svg>);
}

// ============================================================
// URGE-SURFING TOOL  (the core intervention)
// ============================================================
function UrgeScreen({ state, onClose, onResolve, onTextCircle }) {
  const [phase, setPhase] = useState("hold");
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [breathPhase, setBreathPhase] = useState("in");
  const timerRef = useRef(null);
  const reason = state.profile.reason;
  const shareable = state.circle.filter(c => c.sharedVisibility);

  useEffect(() => {
    if (phase !== "breathe") return;
    timerRef.current = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== "breathe") return;
    const seq = [["in", 4000], ["hold", 4000], ["out", 6000]];
    let i = 0, t;
    const tick = () => { setBreathPhase(seq[i][0]); const d = seq[i][1]; i = (i + 1) % seq.length; t = setTimeout(tick, d); };
    tick();
    return () => clearTimeout(t);
  }, [phase]);

  const mins = Math.floor(secondsLeft / 60), secs = secondsLeft % 60;
  const breathLabel = breathPhase === "in" ? "Breathe in" : breathPhase === "hold" ? "Hold" : "Breathe out";
  const breathScale = breathPhase === "out" ? 0.85 : 1.25;
  const elapsed = 20 * 60 - secondsLeft;

  return (
    <div style={{ ...overlayStyle, background: "#0a1118" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">×</button>

      {phase === "hold" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
          <div style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.35 }}>This craving is a wave.<br />It crests and it falls.</div>
          <div style={{ fontSize: 15, color: "rgba(234,242,244,0.7)", lineHeight: 1.65 }}>A craving usually peaks and passes within about 20–30 minutes — whether or not you use. You don't have to fight it or fix it. You just have to outlast this one wave. Let's ride it together.</div>
          {reason && (<div style={{ background: "rgba(95,176,165,0.1)", border: `1px solid rgba(95,176,165,0.25)`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: ACCENT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Why you started this</div>
            <div style={{ fontSize: 17, fontWeight: 300, fontStyle: "italic", lineHeight: 1.4 }}>"{reason}"</div>
          </div>)}
          <button style={primaryBtn} onClick={() => setPhase("breathe")}>Ride the wave with me</button>
          {shareable.length > 0 && <button style={ghostBtn} onClick={() => onTextCircle(shareable[0])}>Text {shareable[0].name} right now</button>}
          <div style={{ fontSize: 12, color: "rgba(234,242,244,0.45)", textAlign: "center", lineHeight: 1.6 }}>In crisis? SAMHSA <strong>1-800-662-4357</strong> · Text <strong>HOME to 741741</strong></div>
        </div>
      )}

      {phase === "breathe" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 30 }}>
          <div style={{ fontSize: 13, color: "rgba(234,242,244,0.5)", letterSpacing: 1 }}>The wave passes in</div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 1 }}>{mins}:{String(secs).padStart(2, "0")}</div>
          <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, rgba(95,176,165,0.25), rgba(95,176,165,0.05))`, border: `2px solid ${ACCENT}`, transform: `scale(${breathScale})`, transition: `transform ${breathPhase === "out" ? 6 : 4}s ease-in-out` }} />
            <div style={{ fontSize: 18, fontWeight: 400, zIndex: 1 }}>{breathLabel}</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(234,242,244,0.6)", textAlign: "center", lineHeight: 1.6, maxWidth: 280 }}>Follow the circle. Cravings shrink while you breathe — you're already {Math.floor(elapsed / 60)}m {elapsed % 60}s through this one.</div>
          <button style={{ ...primaryBtn, maxWidth: 280 }} onClick={() => setPhase("after")}>I'm steadier now</button>
        </div>
      )}

      {phase === "after" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
          <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.35 }}>How did the wave end?</div>
          <div style={{ fontSize: 14, color: "rgba(234,242,244,0.6)", lineHeight: 1.6 }}>However it went, opening this instead of using is the muscle. No wrong answer — this is just for your record.</div>
          {[
            { o: "rode_it", label: "I rode it out", sub: "The craving passed and I didn't use" },
            { o: "reached_out", label: "I reached out", sub: "I contacted someone in my Circle" },
            { o: "used", label: "I used this time", sub: "It's logged as a slip — not a reset. You still showed up here." },
          ].map(x => (
            <button key={x.o} onClick={() => { onResolve(x.o); onClose(); }} style={{ textAlign: "left", background: PANEL, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, cursor: "pointer", color: TEXT }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{x.label}</div>
              <div style={{ fontSize: 12, color: "rgba(234,242,244,0.5)", marginTop: 3, lineHeight: 1.4 }}>{x.sub}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHECK-IN (mood + symptom + SEVERITY 1-5)
// ============================================================
function CheckInScreen({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(null);
  const [sev, setSev] = useState({});
  const [note, setNote] = useState("");
  const moods = Object.entries(MOOD_MAP).map(([k, v]) => ({ key: k, ...v }));
  const setSeverity = (k, v) => setSev(p => ({ ...p, [k]: p[k] === v ? undefined : v }));
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">×</button>
      {step === 1 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          <div><div style={eyebrow}>Check-in</div><div style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.3 }}>How are you right now?</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {moods.map(m => (<button key={m.key} onClick={() => { setMood(m.key); setStep(2); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "22px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", color: TEXT }}><span style={{ fontSize: 32 }}>{m.emoji}</span><span style={{ fontSize: 14 }}>{m.label}</span></button>))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, paddingTop: 16 }}>
          {mood === "crisis" && (<div style={{ background: "rgba(212,104,94,0.12)", border: "1px solid rgba(212,104,94,0.3)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Close to using? There's a tool for this exact moment.</div>
            <div style={{ fontSize: 13, color: "rgba(234,242,244,0.7)", lineHeight: 1.6 }}>Finish this check-in, or tap the red Help tab at the bottom to ride the craving out.</div>
          </div>)}
          <div><div style={eyebrow}>What are you feeling — and how strong?</div><div style={{ fontSize: 16, fontWeight: 300, color: "rgba(234,242,244,0.7)" }}>Tap a symptom, then rate 1–5. Rating it is how the app shows you it's fading over time.</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SYMPTOMS.map(s => (
              <div key={s.key} style={{ background: PANEL, borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>{s.label}</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[1, 2, 3, 4, 5].map(n => (<button key={n} onClick={() => setSeverity(s.key, n)} aria-label={`${s.label} severity ${n}`} style={{ width: 26, height: 26, borderRadius: 7, cursor: "pointer", fontSize: 12, color: sev[s.key] >= n ? "#06120f" : "rgba(234,242,244,0.5)", background: sev[s.key] >= n ? `linear-gradient(135deg, ${WARM}, ${ACCENT})` : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>{n}</button>))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "none", lineHeight: 1.5 }} value={note} onChange={e => setNote(e.target.value)} placeholder="Anything else? Optional." />
          <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
            <button style={{ ...ghostBtn, flex: 1 }} onClick={() => setStep(1)}>Back</button>
            <button style={{ ...primaryBtn, flex: 2 }} onClick={() => { const symptoms = Object.entries(sev).filter(([, v]) => v).map(([key, severity]) => ({ key, severity })); onSubmit({ type: "checkin", date: todayISO(), mood, symptoms, note: note.trim() }); onClose(); }}>Log it</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SETBACK
// ============================================================
function DocumentScreen({ onClose, onSubmit }) {
  const [date, setDate] = useState(todayISO());
  const [what, setWhat] = useState("");
  const [learned, setLearned] = useState("");
  const [next, setNext] = useState("");
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">×</button>
      <div style={{ marginBottom: 26 }}>
        <div style={eyebrow}>Document a slip</div>
        <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.3, marginBottom: 8 }}>A slip is data, not a verdict.</div>
        <div style={{ fontSize: 14, color: "rgba(234,242,244,0.5)", lineHeight: 1.5 }}>Your cumulative progress stays. The count doesn't reset to zero. Most people who quit for good slipped on the way — what matters is what happens next.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="When?"><input type="date" style={inputStyle} value={date} max={todayISO()} onChange={e => setDate(e.target.value)} /></Field>
        <Field label="What led up to it?"><textarea style={{ ...inputStyle, minHeight: 64, resize: "none", lineHeight: 1.5 }} value={what} onChange={e => setWhat(e.target.value)} placeholder="The trigger, the moment. No judgment." /></Field>
        <Field label="What did you learn?"><textarea style={{ ...inputStyle, minHeight: 64, resize: "none", lineHeight: 1.5 }} value={learned} onChange={e => setLearned(e.target.value)} placeholder="Even one line." /></Field>
        <Field label="Next move?"><textarea style={{ ...inputStyle, minHeight: 64, resize: "none", lineHeight: 1.5 }} value={next} onChange={e => setNext(e.target.value)} placeholder="One small step." /></Field>
      </div>
      <button style={{ ...primaryBtn, marginTop: 24 }} onClick={() => { onSubmit({ type: "setback", date, note: what.trim(), learned: learned.trim(), nextMove: next.trim() }); onClose(); }}>Keep going</button>
    </div>
  );
}

// ============================================================
// TAPER (log-only)
// ============================================================
function TaperScreen({ taper, onClose, onSave }) {
  const [startDose, setStartDose] = useState(taper.startDose ?? "");
  const [currentDose, setCurrentDose] = useState(taper.currentDose ?? "");
  const [unit, setUnit] = useState(taper.unit || "g");
  const [goal, setGoal] = useState(taper.goal ?? 0);
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">×</button>
      <div style={{ marginBottom: 22 }}>
        <div style={eyebrow}>Taper log</div>
        <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.3 }}>Track your own taper.</div>
        <div style={{ fontSize: 13, color: "rgba(234,242,244,0.5)", lineHeight: 1.5, marginTop: 8 }}>This records the numbers <em>you</em> decide on. It does not recommend doses or schedules — for a medical taper, talk to a clinician.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Starting dose"><div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="number" style={inputStyle} value={startDose} onChange={e => setStartDose(e.target.value)} placeholder="0" /><div style={{ display: "flex", gap: 4 }}>{["g", "ml", "bottles"].map(u => (<button key={u} onClick={() => setUnit(u)} style={{ padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 12, color: TEXT, background: unit === u ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)", border: unit === u ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)" }}>{u}</button>))}</div></div></Field>
        <Field label={`Today's dose (${unit})`} hint="Log it whenever you step down. Your trend line shows the descent."><input type="number" style={inputStyle} value={currentDose} onChange={e => setCurrentDose(e.target.value)} placeholder="0" /></Field>
        <Field label={`Goal (${unit})`} hint="Usually 0."><input type="number" style={inputStyle} value={goal} onChange={e => setGoal(e.target.value)} placeholder="0" /></Field>
      </div>
      <button style={{ ...primaryBtn, marginTop: 24 }} onClick={() => { onSave({ active: true, unit, startDose: Number(startDose) || null, currentDose: Number(currentDose) || null, goal: Number(goal) || 0, history: [...(taper.history || []), { date: todayISO(), dose: Number(currentDose) || 0 }] }); onClose(); }}>Save taper log</button>
    </div>
  );
}

// ============================================================
// CIRCLE INVITE
// ============================================================
function CircleInviteScreen({ onClose, onSave, defaultQuietDays }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Support person");
  const [shared, setShared] = useState(true); const [quietDays, setQuietDays] = useState(defaultQuietDays);
  const roles = ["Support person", "Sponsor / counselor", "Family", "Quit buddy"];
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">×</button>
      <div style={{ marginBottom: 22 }}><div style={eyebrow}>Add to your Circle</div><div style={{ fontSize: 24, fontWeight: 300 }}>Who's in this with you?</div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="Name"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Their name" /></Field>
        <Field label="Who are they?"><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{roles.map(r => <button key={r} onClick={() => setRole(r)} style={{ padding: "12px 10px", borderRadius: 11, cursor: "pointer", fontSize: 13, color: TEXT, background: role === r ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)", border: role === r ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)" }}>{r}</button>)}</div></Field>
        <Field label="Share your check-ins with them?" hint="They see only what you share. Revocable anytime. The person you'd text mid-craving should be shared.">
          <div style={{ display: "flex", gap: 8 }}>{[true, false].map(v => <button key={String(v)} onClick={() => setShared(v)} style={{ flex: 1, padding: "12px 0", borderRadius: 11, cursor: "pointer", fontSize: 14, color: TEXT, background: shared === v ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)", border: shared === v ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)" }}>{v ? "Yes, share" : "Keep private"}</button>)}</div>
        </Field>
        <Field label={`Nudge them if I go quiet for ${quietDays} days`} hint="Isolation is where relapse hides."><input type="range" min="1" max="7" value={quietDays} onChange={e => setQuietDays(Number(e.target.value))} style={{ width: "100%", accentColor: ACCENT }} /></Field>
      </div>
      <button style={{ ...primaryBtn, marginTop: 24 }} disabled={!name.trim()} onClick={() => { onSave({ id: Date.now().toString(), name: name.trim(), role, sharedVisibility: shared, quietAlertDays: quietDays }); onClose(); }}>Add</button>
    </div>
  );
}

// ============================================================
// SETTINGS
// ============================================================
function SettingsScreen({ state, onClose, onPatch, onHardReset }) {
  const [name, setName] = useState(state.profile.name);
  const [reason, setReason] = useState(state.profile.reason);
  const [spend, setSpend] = useState(state.profile.dailySpend ?? "");
  return (
    <div style={{ ...overlayStyle, overflow: "auto" }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">×</button>
      <div style={{ marginBottom: 22 }}><div style={eyebrow}>Settings</div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Name"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Your reason"><textarea style={{ ...inputStyle, minHeight: 70, resize: "none", lineHeight: 1.5 }} value={reason} onChange={e => setReason(e.target.value)} /></Field>
        <Field label="Spend per day ($)" hint="Drives your money-saved total."><input type="number" style={inputStyle} value={spend} onChange={e => setSpend(e.target.value)} /></Field>
        <button style={primaryBtn} onClick={() => { onPatch({ profile: { ...state.profile, name: name.trim(), reason: reason.trim(), dailySpend: spend === "" ? null : Number(spend) } }); onClose(); }}>Save</button>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 0" }} />
        <button style={{ ...ghostBtn, color: "#d4685e", borderColor: "rgba(212,104,94,0.3)" }} onClick={() => { if (confirm("Erase everything and start over?")) onHardReset(); }}>Reset all data</button>
        <div style={{ fontSize: 11, color: "rgba(234,242,244,0.3)", lineHeight: 1.5, textAlign: "center", marginTop: 8 }}>This app is a tracker and support tool, not medical care. It does not give dosing or treatment advice. Severe withdrawal can be dangerous — if you have chest pain, seizures, or thoughts of self-harm, seek medical help.</div>
      </div>
    </div>
  );
}

// ============================================================
// CHARTS
// ============================================================
function JourneyChart({ data }) {
  const maxDays = 31;
  if (!data.length) return null;
  return (<div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120 }}>
    {data.map((m, i) => { const h = (m.clean / maxDays) * 100, full = m.clean === m.total;
      return (<div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: "100%", maxWidth: 28, borderRadius: 6, minHeight: 8, height: `${h}%`, background: full ? `linear-gradient(180deg, ${ACCENT}, ${ACCENT2})` : `linear-gradient(180deg, ${WARM}, #b87f42)`, transition: "height .8s ease-out" }} />
        <span style={{ fontSize: 9, color: "rgba(234,242,244,0.5)", whiteSpace: "nowrap" }}>{m.label}</span>
      </div>); })}
  </div>);
}

function SymptomTrendChart({ points }) {
  if (points.length < 2) return null;
  const W = 320, H = 130, pad = 24;
  const maxDay = Math.max(...points.map(p => p.day), 1);
  const x = d => pad + (d / maxDay) * (W - pad * 2);
  const y = v => pad + (1 - (v - 1) / 4) * (H - pad * 2);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.avg).toFixed(1)}`).join(" ");
  const first = points[0].avg, last = points[points.length - 1].avg, falling = last < first;
  return (
    <div style={{ background: PANEL, borderRadius: 16, padding: 18 }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Symptom intensity over time">
        <defs><linearGradient id="sl" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={WARM} /><stop offset="100%" stopColor={ACCENT} /></linearGradient></defs>
        {[1, 3, 5].map(v => (<g key={v}><line x1={pad} y1={y(v)} x2={W - pad} y2={y(v)} stroke="rgba(255,255,255,0.06)" /><text x={4} y={y(v) + 3} fill="rgba(234,242,244,0.3)" fontSize="9">{v}</text></g>))}
        <path d={path} fill="none" stroke="url(#sl)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => <circle key={i} cx={x(p.day)} cy={y(p.avg)} r="3" fill={i === points.length - 1 ? ACCENT : WARM} />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(234,242,244,0.4)", marginTop: 4 }}>
        <span>Day {points[0].day}</span><span>severity over days clean</span><span>Day {points[points.length - 1].day}</span>
      </div>
      {falling && <div style={{ fontSize: 13, color: ACCENT, marginTop: 10, lineHeight: 1.5 }}>Your symptoms are measurably lighter than when you started. That's the healing, on a graph.</div>}
    </div>
  );
}

// ============================================================
// ONBOARDING
// ============================================================
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(""); const [reason, setReason] = useState("");
  const [product, setProduct] = useState("Feel Free"); const [method, setMethod] = useState("cold_turkey");
  const [quitDate, setQuitDate] = useState(todayISO());
  const [spendVal, setSpendVal] = useState(""); const [spendUnit, setSpendUnit] = useState("day");
  const finish = () => { const perDay = spendVal === "" ? null : (spendUnit === "week" ? Number(spendVal) / 7 : Number(spendVal)); onComplete({ profile: { name: name.trim() || "Friend", reason: reason.trim(), product, method, quitDate, dailySpend: perDay } }); };
  const steps = [
    <div key="0" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
      <div style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.3 }}>Getting off kratom isn't a streak.<br />It's a direction.</div>
      <div style={{ fontSize: 15, color: "rgba(234,242,244,0.6)", lineHeight: 1.6 }}>This tracks your whole path — not just days since a slip. It knows the withdrawal timeline, counts what you're saving, has a tool for the moment you're about to use, and never resets you to zero for being human.</div>
      <button style={primaryBtn} onClick={() => setStep(1)}>Start</button>
    </div>,
    <div key="1" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <div style={{ fontSize: 22, fontWeight: 300 }}>What are you stepping away from?</div>
      <Field label="What were you using?"><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{PRODUCTS.map(p => <button key={p} onClick={() => setProduct(p)} style={{ padding: "13px 10px", borderRadius: 11, cursor: "pointer", fontSize: 13, color: TEXT, background: product === p ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)", border: product === p ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)" }}>{p}</button>)}</div></Field>
      <Field label="Your name"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="First name or initial" /></Field>
      <div style={{ display: "flex", gap: 12 }}><button style={{ ...ghostBtn, flex: 1 }} onClick={() => setStep(0)}>Back</button><button style={{ ...primaryBtn, flex: 2 }} onClick={() => setStep(2)}>Next</button></div>
    </div>,
    <div key="2" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <div style={{ fontSize: 22, fontWeight: 300 }}>Your reason.</div>
      <Field label="Why are you quitting?" hint="This leads your home screen instead of a number — and it's what the craving tool shows you mid-wave. Quitting won't fix everything underneath, and that's okay; it's still worth it.">
        <textarea style={{ ...inputStyle, minHeight: 90, resize: "none", lineHeight: 1.5 }} value={reason} onChange={e => setReason(e.target.value)} placeholder="Get my money back. Get my mornings back. Stop hiding it." />
      </Field>
      <Field label="When was your last use?"><input type="date" style={inputStyle} value={quitDate} max={todayISO()} onChange={e => setQuitDate(e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 12 }}><button style={{ ...ghostBtn, flex: 1 }} onClick={() => setStep(1)}>Back</button><button style={{ ...primaryBtn, flex: 2 }} onClick={() => setStep(3)} disabled={!reason.trim()}>Next</button></div>
    </div>,
    <div key="3" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <div style={{ fontSize: 22, fontWeight: 300 }}>The money.</div>
      <Field label="How much were you spending?" hint="For Feel Free especially this is brutal — and watching it convert to money saved is one of the strongest things people hold onto. Optional; editable later.">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 18, color: "rgba(234,242,244,0.5)" }}>$</span><input type="number" style={inputStyle} value={spendVal} onChange={e => setSpendVal(e.target.value)} placeholder="0" /><div style={{ display: "flex", gap: 4 }}>{["day", "week"].map(u => <button key={u} onClick={() => setSpendUnit(u)} style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13, color: TEXT, background: spendUnit === u ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)", border: spendUnit === u ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)" }}>/{u}</button>)}</div></div>
      </Field>
      <Field label="How are you quitting?"><div style={{ display: "flex", gap: 8 }}>{[["cold_turkey", "Cold turkey"], ["taper", "Tapering down"]].map(([v, l]) => <button key={v} onClick={() => setMethod(v)} style={{ flex: 1, padding: "13px 0", borderRadius: 11, cursor: "pointer", fontSize: 14, color: TEXT, background: method === v ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)", border: method === v ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)" }}>{l}</button>)}</div></Field>
      <div style={{ display: "flex", gap: 12 }}><button style={{ ...ghostBtn, flex: 1 }} onClick={() => setStep(2)}>Back</button><button style={{ ...primaryBtn, flex: 2 }} onClick={finish}>Begin</button></div>
    </div>,
  ];
  return (<div style={{ ...overlayStyle, justifyContent: "flex-start" }}><div style={{ display: "flex", gap: 6, marginBottom: 28 }}>{[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? ACCENT : "rgba(255,255,255,0.1)", transition: "background .3s" }} />)}</div>{steps[step]}</div>);
}

// ============================================================
// MAIN
// ============================================================
export default function App() {
  const [state, setState] = useState(null);
  const [screen, setScreen] = useState("home");
  const [modal, setModal] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => { (async () => { const l = await loadState(); setState(l || DEFAULT_STATE); })(); }, []);
  useEffect(() => { if (!state) return; clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => saveState(state), 300); }, [state]);

  const patch = useCallback(p => setState(s => ({ ...s, ...p })), []);
  const addEntry = useCallback(e => setState(s => ({ ...s, entries: [e, ...s.entries] })), []);
  const saveTaper = useCallback(t => setState(s => ({ ...s, taper: t })), []);
  const addCircle = useCallback(m => setState(s => ({ ...s, circle: [...s.circle, m] })), []);
  const hardReset = useCallback(async () => { await resetStore(); setState({ ...DEFAULT_STATE }); setModal(null); setScreen("home"); }, []);

  const resolveUrge = useCallback((outcome) => {
    setState(s => {
      const urge = { date: todayISO(), ts: Date.now(), outcome };
      const next = { ...s, urgesRidden: [urge, ...(s.urgesRidden || [])] };
      if (outcome === "used") next.entries = [{ type: "setback", date: todayISO(), note: "Logged from an urge moment.", learned: "", nextMove: "" }, ...s.entries];
      return next;
    });
  }, []);
  const textCircle = useCallback((member) => { alert(`Opening a message to ${member.name}…\n(Production: sms: deep link, prefilled "I'm having a hard moment, can you talk?")`); }, []);

  if (!state) return <div style={{ ...overlayStyle, justifyContent: "center", alignItems: "center" }}><div style={{ color: "rgba(234,242,244,0.5)" }}>Loading…</div></div>;
  if (!state.onboarded) return <Onboarding onComplete={({ profile }) => setState(s => ({ ...s, onboarded: true, profile }))} />;

  const m = deriveMetrics(state);
  const journey = deriveJourney(state);
  const trend = deriveSymptomTrend(state);
  const checkins = state.entries.filter(e => e.type === "checkin");
  const phase = phaseFor(m.daysSinceLastUse);
  const checkedInToday = state.entries.some(e => e.date === todayISO() && e.type === "checkin");
  const cMiles = cleanMilestones(m.currentStreak);
  const mMiles = moneyMilestones(m.moneySaved);
  const nextClean = cMiles.find(x => !x.hit);
  const lastClean = [...cMiles].reverse().find(x => x.hit);

  const tabs = [
    { key: "home", label: "Today", icon: "◉" }, { key: "progress", label: "Saved", icon: "↗" },
    { key: "journey", label: "Path", icon: "◫" }, { key: "connect", label: "Circle", icon: "◎" },
  ];

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", position: "relative", maxWidth: 430, margin: "0 auto", overflow: "hidden", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {modal === "urge" && <UrgeScreen state={state} onClose={() => setModal(null)} onResolve={resolveUrge} onTextCircle={textCircle} />}
      {modal === "checkin" && <CheckInScreen onClose={() => setModal(null)} onSubmit={addEntry} />}
      {modal === "document" && <DocumentScreen onClose={() => setModal(null)} onSubmit={addEntry} />}
      {modal === "taper" && <TaperScreen taper={state.taper} onClose={() => setModal(null)} onSave={saveTaper} />}
      {modal === "invite" && <CircleInviteScreen defaultQuietDays={state.settings.quietAlertDefaultDays} onClose={() => setModal(null)} onSave={addCircle} />}
      {modal === "settings" && <SettingsScreen state={state} onClose={() => setModal(null)} onPatch={patch} onHardReset={hardReset} />}

      <div style={{ padding: "48px 24px 120px", minHeight: "100vh", boxSizing: "border-box" }}>
        <button onClick={() => setModal("settings")} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "rgba(234,242,244,0.4)", fontSize: 20, cursor: "pointer" }} aria-label="Settings">⚙</button>

        {screen === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ textAlign: "center", paddingTop: 4 }}><div style={{ ...eyebrow, textAlign: "center" }}>Your reason</div><div style={{ fontSize: 19, fontWeight: 300, fontStyle: "italic", lineHeight: 1.4, color: "rgba(234,242,244,0.85)" }}>"{state.profile.reason}"</div></div>
            <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
              <GradientRing percentage={m.cumulativePct} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{m.currentStreak}</div>
                <div style={{ fontSize: 12, color: "rgba(234,242,244,0.5)", marginTop: 4 }}>days clear</div>
                <div style={{ fontSize: 11, color: "rgba(234,242,244,0.35)", marginTop: 2 }}>{m.cumulativePct}% of {m.totalDaysTracked} tracked</div>
              </div>
            </div>
            {(lastClean || nextClean) && (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 12, color: "rgba(234,242,244,0.55)" }}>{lastClean && <span style={{ color: ACCENT }}>✓ {lastClean.label}</span>}{nextClean && <span>· next: {nextClean.label} (day {nextClean.d})</span>}</div>)}
            <div style={{ background: "rgba(91,143,199,0.1)", border: "1px solid rgba(91,143,199,0.25)", borderRadius: 16, padding: "16px 18px" }}><div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>{phase.tag}</div><div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(234,242,244,0.8)" }}>{phase.msg}</div></div>
            {m.moneySaved != null && (<div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700, color: ACCENT }}>${m.moneySaved.toLocaleString()}</div><div style={{ fontSize: 11, color: "rgba(234,242,244,0.45)", marginTop: 2 }}>saved</div></div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700 }}>{m.urgesRidden}</div><div style={{ fontSize: 11, color: "rgba(234,242,244,0.45)", marginTop: 2 }}>urges ridden</div></div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700 }}>{m.setbackCount}</div><div style={{ fontSize: 11, color: "rgba(234,242,244,0.45)", marginTop: 2 }}>slips</div></div>
            </div>)}
            <button style={{ ...primaryBtn, background: "linear-gradient(135deg, rgba(95,176,165,0.16), rgba(95,176,165,0.08))", border: `1px solid rgba(95,176,165,0.3)`, color: ACCENT }} onClick={() => setModal("checkin")}>{checkedInToday ? "Check in again" : "Check in"}</button>
            {state.profile.method === "taper" && <button style={ghostBtn} onClick={() => setModal("taper")}>{state.taper.active ? `Taper: ${state.taper.currentDose ?? "—"}${state.taper.unit} → ${state.taper.goal}${state.taper.unit}` : "Set up taper log"}</button>}
            <div>
              <div style={{ ...eyebrow, letterSpacing: 0.5 }}>Recent check-ins</div>
              {checkins.length === 0 ? <div style={{ fontSize: 14, color: "rgba(234,242,244,0.4)", padding: "14px 0", textAlign: "center", lineHeight: 1.5 }}>No check-ins yet. The first one starts your pattern.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {checkins.slice(0, 5).map((c, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: PANEL, borderRadius: 12, padding: "12px 14px" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: MOOD_MAP[c.mood]?.color || "#888", flexShrink: 0 }} /><div style={{ flex: 1, fontSize: 14 }}>{c.note || MOOD_MAP[c.mood]?.label}{c.symptoms?.length > 0 && <span style={{ fontSize: 11, color: "rgba(234,242,244,0.4)" }}> · {c.symptoms.length} symptom{c.symptoms.length > 1 ? "s" : ""}</span>}</div><div style={{ fontSize: 11, color: "rgba(234,242,244,0.35)" }}>{c.date.slice(5)}</div></div>))}
                </div>
              )}
            </div>
            <button style={{ ...ghostBtn, background: "transparent", borderColor: "rgba(255,255,255,0.06)", color: "rgba(234,242,244,0.35)", fontSize: 13 }} onClick={() => setModal("document")}>Document a slip</button>
          </div>
        )}

        {screen === "progress" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div><div style={eyebrow}>What you're getting back</div><div style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.3 }}>The cost of quitting is zero. The cost of using was not.</div></div>
            {m.moneySaved != null ? (
              <div style={{ background: PANEL, borderRadius: 16, padding: 22, textAlign: "center" }}>
                <div style={{ fontSize: 44, fontWeight: 700, color: ACCENT }}>${m.moneySaved.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: "rgba(234,242,244,0.5)", marginTop: 4 }}>kept over {m.cleanDays} clean days</div>
                <div style={{ fontSize: 12, color: "rgba(234,242,244,0.35)", marginTop: 10, lineHeight: 1.5 }}>${Math.round(state.profile.dailySpend)}/day · ~${Math.round(state.profile.dailySpend * 30).toLocaleString()}/mo · ${Math.round(state.profile.dailySpend * 365).toLocaleString()}/yr</div>
                {mMiles.some(x => x.hit) && (<div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 14 }}>{mMiles.map(x => <span key={x.v} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 20, background: x.hit ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)", color: x.hit ? ACCENT : "rgba(234,242,244,0.3)", border: x.hit ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.06)" }}>{x.hit ? "✓ " : ""}${x.v.toLocaleString()}</span>)}</div>)}
              </div>
            ) : <button style={ghostBtn} onClick={() => setModal("settings")}>Add your daily spend to see money saved →</button>}
            <div>
              <div style={{ ...eyebrow, letterSpacing: 0.5 }}>Symptoms over time</div>
              {trend.length < 2 ? <div style={{ fontSize: 14, color: "rgba(234,242,244,0.4)", padding: "14px 0", lineHeight: 1.5 }}>Rate your symptoms in a few check-ins. Once there are two days of data, you'll see the line — and watch it fall as withdrawal recedes.</div> : <SymptomTrendChart points={trend} />}
            </div>
          </div>
        )}

        {screen === "journey" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div><div style={eyebrow}>Your path</div><div style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.3 }}>Every month, the honest version.</div></div>
            <div style={{ background: PANEL, borderRadius: 16, padding: 20 }}><JourneyChart data={journey} /><div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, fontSize: 11, color: "rgba(234,242,244,0.4)" }}><span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: ACCENT }} /> Full month clear</span><span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: WARM }} /> Had a slip</span></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{[{ value: `${m.cumulativePct}%`, label: "Clean days" }, { value: m.currentStreak, label: "Current streak" }, { value: m.moneySaved != null ? `$${m.moneySaved.toLocaleString()}` : "—", label: "Money saved" }, { value: m.urgesRidden, label: "Urges ridden" }].map((s, i) => (<div key={i} style={{ background: PANEL, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div><div style={{ fontSize: 11, color: "rgba(234,242,244,0.45)", marginTop: 4 }}>{s.label}</div></div>))}</div>
            <div style={{ background: "rgba(95,176,165,0.08)", border: "1px solid rgba(95,176,165,0.2)", borderRadius: 14, padding: 16 }}><div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(234,242,244,0.75)" }}>{m.setbackCount > 0 ? <>You've stayed clean <strong style={{ color: ACCENT }}>{m.cumulativePct}% of your days</strong>. {m.setbackCount} slip{m.setbackCount > 1 ? "s" : ""} — logged, learned from, behind you. The line still goes up.</> : <>You're <strong style={{ color: ACCENT }}>{m.currentStreak} days</strong> in with no slips logged. And if one comes, it still won't reset you to zero.</>}</div></div>
          </div>
        )}

        {screen === "connect" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div><div style={eyebrow}>Your Circle</div><div style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.3 }}>Quitting alone is the hardest way.</div></div>
            {state.circle.length === 0 ? <div style={{ fontSize: 14, color: "rgba(234,242,244,0.45)", textAlign: "center", padding: "18px 0", lineHeight: 1.5 }}>No one here yet. Add a quit buddy, family member, or counselor — ideally someone you'd text mid-craving.</div> : state.circle.map(c => (<div key={c.id} style={{ background: PANEL, borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, rgba(95,176,165,0.2), rgba(91,143,199,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.name[0].toUpperCase()}</div><div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div><div style={{ fontSize: 12, color: "rgba(234,242,244,0.45)", marginTop: 2 }}>{c.role} · {c.sharedVisibility ? "Sees check-ins" : "Private"} · {c.quietAlertDays}d nudge</div></div></div>))}
            <button style={primaryBtn} onClick={() => setModal("invite")}>+ Add to Circle</button>
            <div style={{ background: "rgba(91,143,199,0.08)", border: "1px solid rgba(91,143,199,0.2)", borderRadius: 14, padding: 16 }}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>How Circle works</div><div style={{ fontSize: 13, color: "rgba(234,242,244,0.6)", lineHeight: 1.6 }}>You choose who sees what — opt-in per person, revocable anytime. The "text right now" button in a craving reaches a shared person. Go quiet past your threshold and they get a gentle nudge.</div></div>
            <div style={{ background: PANEL, borderRadius: 14, padding: 16 }}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Free support lines</div><div style={{ fontSize: 13, color: "rgba(234,242,244,0.6)", lineHeight: 1.7 }}>SAMHSA National Helpline · <strong>1-800-662-4357</strong> · free, confidential, 24/7<br />Crisis Text Line · text <strong>HOME to 741741</strong></div></div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, boxSizing: "border-box", background: `linear-gradient(180deg, transparent, ${BG} 22%)`, padding: "18px 12px 26px", display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
        {/* Help: red-accented, always reachable, opens the urge tool — not a screen switch */}
        <button onClick={() => setModal("urge")} aria-label="I need help right now" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 10px" }}>
          <span style={{ fontSize: 22, lineHeight: 1, filter: "drop-shadow(0 0 6px rgba(212,104,94,0.55))" }}>🆘</span>
          <span style={{ fontSize: 10, letterSpacing: 0.5, color: "#e87a70", fontWeight: 600 }}>Help</span>
        </button>
        {tabs.map(t => (<button key={t.key} onClick={() => setScreen(t.key)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: screen === t.key ? ACCENT : "rgba(234,242,244,0.3)", padding: "4px 10px" }}><span style={{ fontSize: 20 }}>{t.icon}</span><span style={{ fontSize: 10, letterSpacing: 0.5 }}>{t.label}</span></button>))}
      </div>
    </div>
  );
}
