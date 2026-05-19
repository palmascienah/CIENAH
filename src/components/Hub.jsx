// ============================================================
// CIENAH — Hub (seleção de apps)
// ============================================================
import { Library, Brain, FileText, ArrowRight, LogOut, Users as UsersIcon } from "lucide-react";
import { C, APPS, ROLE_LABELS } from "../lib/constants";

export default function Hub({ user, onNavigate, onLogout }) {
  const appsList = [
    {
      id: "acervo",
      label: "Acervo Terapêutico",
      desc: "Cadastro e organização de recursos clínicos por sala.",
      icon: Library,
      color: C.azul,
      ready: true,
    },
    {
      id: "aba",
      label: "Sistema ABA",
      desc: "Análise do Comportamento Aplicada (em construção).",
      icon: Brain,
      color: C.verde,
      ready: false,
    },
    {
      id: "laudos",
      label: "Laudos PAC",
      desc: "Laudos de Processamento Auditivo Central.",
      icon: FileText,
      color: C.laranja,
      ready: false,
    },
  ];

  const userApps = user.apps || [];

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <div style={s.headerKicker}>Sistemas CIENAH</div>
          <div style={s.headerTitle}>Olá, {user.name?.split(" ")[0] || "equipe"}!</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={s.userChip}>
            <div style={s.avatar}>{user.name?.charAt(0)?.toUpperCase() || "?"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.texto }}>{user.name}</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          {user.role === "admin" && (
            <button onClick={() => onNavigate("equipe")} style={s.adminBtn}>
              <UsersIcon size={14} /> Equipe
            </button>
          )}
          <button onClick={onLogout} style={s.logoutBtn}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      <main style={s.main}>
        <h1 style={s.h1}>Qual sistema você quer acessar?</h1>
        <p style={{ color: C.muted, marginTop: 8, marginBottom: 32, fontSize: 14 }}>
          Escolha um dos sistemas abaixo para começar.
        </p>

        <div style={s.appsGrid}>
          {appsList.map((app) => {
            const Icon = app.icon;
            const hasAccess = userApps.includes(app.id);
            return (
              <button
                key={app.id}
                onClick={() => hasAccess && app.ready && onNavigate(app.id)}
                disabled={!hasAccess || !app.ready}
                style={{
                  ...s.appCard,
                  background: hasAccess && app.ready ? "white" : C.borderSoft,
                  cursor: hasAccess && app.ready ? "pointer" : "not-allowed",
                  opacity: hasAccess && app.ready ? 1 : 0.6,
                }}
              >
                <div style={{ ...s.appIcon, background: app.color + "1A", color: app.color }}>
                  <Icon size={32} strokeWidth={2} />
                </div>
                <div style={s.appTitle}>{app.label}</div>
                <p style={s.appDesc}>{app.desc}</p>
                <div style={s.appFooter}>
                  {!hasAccess && (
                    <span style={{ ...s.appBadge, background: C.muted + "20", color: C.muted }}>
                      Sem acesso
                    </span>
                  )}
                  {hasAccess && !app.ready && (
                    <span style={{ ...s.appBadge, background: C.amarelo + "30", color: "#A47E1C" }}>
                      Em breve
                    </span>
                  )}
                  {hasAccess && app.ready && (
                    <>
                      <span style={{ ...s.appBadge, background: C.verde + "20", color: C.verde }}>
                        Disponível
                      </span>
                      <ArrowRight size={16} color={app.color} />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// Renderiza tela quando usuário não tem acesso a um app
export function NoAccess({ onBack }) {
  return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 40, maxWidth: 480 }}>
        <div style={{ ...s.appIcon, background: C.rosa + "1A", color: C.rosa, margin: "0 auto 20px" }}>
          <Library size={36} />
        </div>
        <h2 style={{ fontFamily: "'Fredoka', sans-serif", color: C.azul, fontSize: 28 }}>
          Sem acesso
        </h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
          Você não tem permissão para acessar este sistema. Solicite acesso ao administrador da clínica.
        </p>
        <button onClick={onBack} style={s.adminBtn}>
          Voltar ao Hub
        </button>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter', sans-serif" },
  header: { padding: "1rem 2.5rem", background: "white", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  headerKicker: { fontSize: 10, letterSpacing: 2, color: C.laranja, fontWeight: 700, textTransform: "uppercase" },
  headerTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, color: C.azul, marginTop: 2, lineHeight: 1 },
  userChip: { display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", background: C.offWhite, borderRadius: 100, border: `1px solid ${C.border}` },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: C.laranja, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fredoka', sans-serif", fontSize: 16, fontWeight: 700 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.texto },
  adminBtn: { display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: C.azul, color: "white", border: "none", borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 700, marginTop: 14 },
  main: { padding: "3rem 2.5rem", maxWidth: 1300, margin: "0 auto" },
  h1: { fontFamily: "'Fredoka', sans-serif", fontSize: 32, fontWeight: 700, color: C.azul, margin: 0, lineHeight: 1.1 },
  appsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 },
  appCard: { padding: "32px 28px 24px", borderRadius: 20, border: `1px solid ${C.border}`, textAlign: "left", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 14, fontFamily: "'Inter', sans-serif" },
  appIcon: { width: 64, height: 64, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center" },
  appTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, margin: 0, color: C.azul },
  appDesc: { fontSize: 13.5, color: C.textoSuave, lineHeight: 1.6, margin: 0, flex: 1 },
  appFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` },
  appBadge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
};