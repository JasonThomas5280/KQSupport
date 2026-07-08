import { useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Field } from "../components/Field";
import { IconDownload } from "../components/icons";
import { Overlay } from "../components/Overlay";
import { serializeState } from "../model/backup";
import { todayISO } from "../model/dates";
import type { AppState } from "../model/types";
import { eyebrow, ghostBtn, inputStyle, primaryBtn } from "../styles/tokens";

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
  const [confirmingReset, setConfirmingReset] = useState(false);

  const downloadBackup = () => {
    const blob = new Blob([serializeState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clear-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Overlay onClose={onClose} style={{ overflow: "auto" }}>
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
        <div>
          <div style={{ ...eyebrow, letterSpacing: 0.5 }}>Your data</div>
          <button
            style={{ ...ghostBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onClick={downloadBackup}
          >
            <IconDownload size={17} />
            Download a backup (JSON)
          </button>
          <div style={{ fontSize: 12, color: "rgba(234,242,244,0.4)", lineHeight: 1.5, marginTop: 8 }}>
            Everything stays on this device. A backup file is the only copy that exists anywhere else.
          </div>
        </div>
        <button
          style={{ ...ghostBtn, color: "#d4685e", borderColor: "rgba(212,104,94,0.3)" }}
          onClick={() => setConfirmingReset(true)}
        >
          Reset all data
        </button>
        {confirmingReset && (
          <ConfirmDialog
            title="Erase everything?"
            body="This permanently clears all data on this device — check-ins, taper log, and Circle. Consider downloading a backup first."
            confirmLabel="Erase all data"
            danger
            extraAction={{ label: "Download backup first", onClick: downloadBackup }}
            onConfirm={() => {
              setConfirmingReset(false);
              onHardReset();
            }}
            onCancel={() => setConfirmingReset(false)}
          />
        )}
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
    </Overlay>
  );
}
