// ============================================================
// CIENAH — Placeholder pros apps ABA e Laudos (em construção)
// ============================================================
import { ArrowLeft, Brain, FileText, LogOut } from "lucide-react";
import { C } from "../lib/constants";

export default function Placeholder({ app, user, onLogout, onHub }) {
  const config = {
    aba: { icon: Brain, color: C.verde, label: "Sistema ABA", desc: "Análise do Comportamento Aplicada" },
    laudos: { icon: FileText, color: C.laranja, label: "Laudos PAC", desc: "Laudos de Processamento Auditivo Central" },
  }[app] || { icon: Brain, color: C.azul, label: "App", desc: "Em construção" };

  const Icon = config.icon;

  return (
    <div style={s.page}>
      <header style={{ padding: "1rem 2.5rem", background: "white", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onHub} style={s.backBtn}>
          <ArrowLeft size={14} /> Voltar ao Hub
        </button>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.texto }}>
          <LogOut size={14} /> Sair
        </button>
      </header>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)" }}>
        <div style={s.box}>
          <div style={{ ...s.icon, background: config.color + "1A", color: config.color }}>
            <Icon size={48} strokeWidth={1.5} />
          </div>
          <h1 style={s.h1}>{config.label}</h1>
          <p style={s.sub}>{config.desc}</p>
          <div style={{ ...s.badge, background: C.amarelo + "30", color: "#A47E1C" }}>
            🚧 Em construção
          </div>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 20, lineHeight: 1.6 }}>
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            Volte ao Hub para acessar outros sistemas.
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter', sans-serif" },
  backBtn: { background: "transparent", border: "none", cursor: "pointer", color: C.azul, fontSize: 13, fontWeight: 600, padding: 6, display: "flex", alignItems: "center", gap: 6 },
  box: { textAlign: "center", padding: "3rem 2rem", maxWidth: 600 },
  icon: { width: 100, height: 100, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  h1: { fontFamily: "'Fredoka', sans-serif", fontSize: 36, fontWeight: 700, color: C.azul, margin: "0 0 12px" },
  sub: { fontSize: 15, color: C.textoSuave, lineHeight: 1.6, margin: "0 0 20px" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 700 },
};