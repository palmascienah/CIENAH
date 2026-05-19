// ============================================================
// CIENAH — Fontes e estilos globais
// ============================================================
import { C } from "../lib/constants";

export default function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; font-family: 'Inter', sans-serif; }
      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: ${C.azul} !important;
        box-shadow: 0 0 0 3px ${C.azul}15;
      }
      button { font-family: inherit; }
      button:hover:not(:disabled) { transform: translateY(-1px); }
      button:disabled { opacity: 0.5; cursor: not-allowed; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: ${C.creamLight}; }
      ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      .mobile-menu-btn { display: none; }
      @media (max-width: 768px) {
        .mobile-menu-btn { display: flex !important; }
        .nav-links { display: none !important; }
        .nav-links.open {
          display: flex !important;
          flex-direction: column;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: ${C.offWhite};
          padding: 20px;
          gap: 14px !important;
          border-bottom: 1px solid ${C.linha};
        }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .spin { animation: spin 1s linear infinite; }
      .pulse { animation: pulse 1.5s ease-in-out infinite; }
    `}</style>
  );
}

// Componente de pattern decorativo (símbolos CIENAH no fundo)
export function PatternBg({ opacity = 0.05, dark = false }) {
  const color = dark ? "rgba(245,241,232," : "rgba(5,79,111,";
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="cienahPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill={`${color}${opacity})`} />
          <circle cx="60" cy="40" r="1.5" fill={`${color}${opacity})`} />
          <circle cx="80" cy="80" r="2.5" fill={`${color}${opacity})`} />
          <path d="M 30 60 Q 35 55 40 60" stroke={`${color}${opacity})`} strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cienahPattern)" />
    </svg>
  );
}