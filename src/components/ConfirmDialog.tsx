import { ghostBtn, primaryBtn } from "../styles/tokens";

// In-app replacement for window.confirm(): a scrim plus a small centered
// card in the app's visual language. Clicking the scrim cancels.
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  extraAction,
  onConfirm,
  onCancel,
}: {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  extraAction?: { label: string; onClick: () => void };
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="clear-fade"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(6,12,18,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#101b26",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18,
          padding: 22,
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div id="confirm-title" style={{ fontSize: 18, fontWeight: 600 }}>
          {title}
        </div>
        {body && (
          <div style={{ fontSize: 14, color: "rgba(234,242,244,0.6)", lineHeight: 1.6 }}>{body}</div>
        )}
        {extraAction && (
          <button style={{ ...ghostBtn, fontSize: 14 }} onClick={extraAction.onClick}>
            {extraAction.label}
          </button>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...ghostBtn, flex: 1 }} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            style={
              danger
                ? {
                    ...ghostBtn,
                    flex: 1,
                    color: "#d4685e",
                    borderColor: "rgba(212,104,94,0.4)",
                    background: "rgba(212,104,94,0.08)",
                  }
                : { ...primaryBtn, flex: 1 }
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
