import type { CSSProperties } from "react";

// Visual tokens — ported verbatim from the prototype. The prototype is the
// source of truth for color and styling; do not redesign.
export const BG = "#0f1822";
export const PANEL = "rgba(255,255,255,0.04)";
export const TEXT = "#eaf2f4";
export const ACCENT = "#5fb0a5";
export const ACCENT2 = "#3d8b80";
export const WARM = "#d89c5a";

export const inputStyle: CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: "13px 14px",
  color: TEXT,
  fontSize: 15,
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

export const primaryBtn: CSSProperties = {
  padding: "15px 0",
  borderRadius: 13,
  border: "none",
  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
  color: "#06120f",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
};

export const ghostBtn: CSSProperties = {
  padding: "13px 0",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: TEXT,
  fontSize: 15,
  cursor: "pointer",
  width: "100%",
};

export const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "#0c141d",
  color: TEXT,
  display: "flex",
  flexDirection: "column",
  zIndex: 100,
  padding: "60px 24px 40px",
  maxWidth: 430,
  margin: "0 auto",
  fontFamily: "'Inter', -apple-system, sans-serif",
};

export const closeBtnStyle: CSSProperties = {
  position: "absolute",
  top: 20,
  right: 20,
  background: "none",
  border: "none",
  color: "rgba(234,242,244,0.5)",
  fontSize: 28,
  cursor: "pointer",
  lineHeight: 1,
};

export const eyebrow: CSSProperties = {
  fontSize: 13,
  color: "rgba(234,242,244,0.45)",
  marginBottom: 8,
  letterSpacing: 1,
  textTransform: "uppercase",
};
