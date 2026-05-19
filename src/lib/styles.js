// ============================================================
// CIENAH — ESTILOS COMPARTILHADOS
// ============================================================
import { C } from "./constants";

// Estilos comuns reutilizáveis
export const sharedStyles = {
  // Botões
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    background: C.laranja,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 14px",
    background: "white",
    color: C.texto,
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 14px",
    background: C.rosa,
    color: "white",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
  },

  // Inputs
  input: {
    width: "100%",
    padding: "11px 14px",
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    fontSize: 14,
    background: "white",
    fontFamily: "'Inter', sans-serif",
    color: C.texto,
    boxSizing: "border-box",
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: C.azul,
    display: "block",
    marginBottom: 6,
    fontWeight: 700,
  },

  // Cards
  card: {
    background: "white",
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 18,
  },

  // Modal
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(5, 79, 111, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },
  modal: {
    background: C.offWhite,
    borderRadius: 16,
    maxWidth: 620,
    width: "100%",
    maxHeight: "92vh",
    overflowY: "auto",
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },

  // Toast
  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    padding: "12px 20px",
    color: "#fff",
    borderRadius: 10,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    zIndex: 200,
    fontWeight: 600,
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    border: `1px dashed ${C.border}`,
    borderRadius: 14,
  },
};

// Pattern de fundo decorativo (símbolos CIENAH)
export const decorativePattern = `
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(210, 122, 42, 0.04) 2px, transparent 3px),
    radial-gradient(circle at 80% 20%, rgba(123, 168, 64, 0.04) 2px, transparent 3px),
    radial-gradient(circle at 50% 80%, rgba(215, 126, 126, 0.04) 2px, transparent 3px);
  background-size: 80px 80px;
`;