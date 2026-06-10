/**
 * ConfirmDialog — modal de confirmação no estilo Food Pay.
 * Substitui window.confirm()/alert(). Uso controlado:
 *
 *   const [confirmState, setConfirmState] = useState(null);
 *   ...
 *   setConfirmState({ title, description, confirmLabel, variant, onConfirm });
 *   <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
 */
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 10, 8, 0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 9999,
  animation: "fp-fade-in 0.15s ease",
};

const dialog = {
  width: "100%",
  maxWidth: 440,
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 25px 60px -20px rgba(60, 14, 10, 0.55)",
  overflow: "hidden",
  animation: "fp-pop-in 0.18s ease",
};

const header = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  padding: "22px 22px 0",
};

const iconWrap = (variant) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: variant === "danger" ? "#fef2f2" : "#fdf2f1",
  color: variant === "danger" ? "#b91c1c" : "#c8202a",
  flexShrink: 0,
});

const closeBtn = {
  marginLeft: "auto",
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  padding: 6,
  borderRadius: 8,
  cursor: "pointer",
};

const body = {
  padding: "12px 22px 6px 80px",
};

const titleStyle = {
  margin: 0,
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "#1f2937",
  lineHeight: 1.3,
};

const descStyle = {
  margin: "8px 0 0",
  color: "#475569",
  fontSize: "0.92rem",
  lineHeight: 1.5,
};

const actions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  padding: "18px 22px 22px",
};

const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "10px 18px",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: "0.92rem",
  cursor: "pointer",
  border: "1px solid transparent",
  minHeight: 42,
  minWidth: 110,
  transition: "transform 0.12s ease, background 0.12s ease, border-color 0.12s ease",
};

const cancelBtn = {
  ...btnBase,
  background: "#f1f5f9",
  color: "#334155",
  borderColor: "#e2e8f0",
};

const confirmBtn = (variant) => ({
  ...btnBase,
  background:
    variant === "danger"
      ? "linear-gradient(135deg, #b91c1c, #dc2626)"
      : "linear-gradient(135deg, #c8202a, #ef5b3a)",
  color: "#fff",
  boxShadow: "0 8px 20px -10px rgba(185, 28, 28, 0.6)",
});

const keyframes = `
@keyframes fp-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes fp-pop-in { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
`;

export default function ConfirmDialog({ state, onClose }) {
  useEffect(() => {
    if (!state) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") handleConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state) return null;

  const {
    title = "Confirmar ação",
    description = "",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "danger",
    onConfirm,
  } = state;

  async function handleConfirm() {
    try {
      await onConfirm?.();
    } finally {
      onClose();
    }
  }

  return (
    <div style={overlay} onClick={onClose} role="dialog" aria-modal="true">
      <style>{keyframes}</style>
      <div style={dialog} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div style={iconWrap(variant)}>
            <AlertTriangle size={22} />
          </div>
          <h2 style={titleStyle}>{title}</h2>
          <button type="button" onClick={onClose} style={closeBtn} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        {description && <div style={body}><p style={descStyle}>{description}</p></div>}
        <div style={actions}>
          <button type="button" style={cancelBtn} onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" style={confirmBtn(variant)} onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
