// ============================================================
// CIENAH — Painel (Dashboard)
// ============================================================
import { useMemo } from "react";
import {
  BookOpen, MapPin, AlertCircle, Sparkles, Plus, ChevronRight,
  TrendingUp, Box, ArrowRight,
} from "lucide-react";
import { C, TIPOS_RECURSO } from "../lib/constants";
import { tipoInfo, estadoInfo, fmt } from "../lib/helpers";

export default function Painel({ data, setView, onCadastrar }) {
  const stats = useMemo(() => {
    const totalRecursos = data.resources.length;
    const totalExemplares = data.resources.reduce((acc, r) => acc + (r.quantidade || 1), 0);
    const totalSalas = data.rooms.length;
    const itensRuins = data.resources.filter(r => r.estado === "ruim").length;
    const itensSemFoto = data.resources.filter(r => !r.fotoUrl).length;

    // Por tipo
    const porTipo = TIPOS_RECURSO.map(t => ({
      ...t,
      count: data.resources.filter(r => r.tipo === t.id).length,
      exemplares: data.resources.filter(r => r.tipo === t.id).reduce((acc, r) => acc + (r.quantidade || 1), 0),
    })).filter(t => t.count > 0);

    // Por sala
    const porSala = data.rooms.map(sala => ({
      ...sala,
      count: data.resources.filter(r => r.salaId === sala.id).length,
      exemplares: data.resources.filter(r => r.salaId === sala.id).reduce((acc, r) => acc + (r.quantidade || 1), 0),
    })).sort((a, b) => b.count - a.count);

    // Recentes (últimos 5)
    const recentes = [...data.resources].slice(0, 5);

    return { totalRecursos, totalExemplares, totalSalas, itensRuins, itensSemFoto, porTipo, porSala, recentes };
  }, [data]);

  return (
    <div style={{ padding: "28px 36px", maxHeight: "100vh", overflowY: "auto" }}>
      <div style={s.headerBar}>
        <div>
          <div style={s.kicker}><Sparkles size={11} /> Visão geral</div>
          <h1 style={s.title}>Painel do Acervo</h1>
        </div>
        <button onClick={onCadastrar} style={s.btnPrimary}>
          <Plus size={14} /> Cadastrar recurso
        </button>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div style={s.statsGrid}>
        <StatCard label="Recursos cadastrados" value={stats.totalRecursos} icon={BookOpen} color={C.azul} />
        <StatCard label="Exemplares no total" value={stats.totalExemplares} icon={Box} color={C.verde} />
        <StatCard label="Salas ativas" value={stats.totalSalas} icon={MapPin} color={C.laranja} />
        <StatCard label="Itens em mau estado" value={stats.itensRuins} icon={AlertCircle} color={C.rosa} alert={stats.itensRuins > 0} />
      </div>

      {/* GRID 2 COLUNAS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20, marginTop: 24 }}>
        {/* DISTRIBUIÇÃO POR TIPO */}
        <Panel title="Distribuição por tipo" subtitle="Categorias do acervo">
          {stats.porTipo.length === 0 ? (
            <Empty icon={Box} msg="Nenhum recurso cadastrado ainda" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              {stats.porTipo.map(t => {
                const max = Math.max(...stats.porTipo.map(x => x.count));
                const pct = (t.count / max) * 100;
                return (
                  <div key={t.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.texto }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
                        {t.count} {t.count === 1 ? "tipo" : "tipos"} · {t.exemplares} exemplares
                      </div>
                    </div>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${pct}%`, background: t.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* TOP SALAS */}
        <Panel title="Acervo por sala" subtitle="Distribuição entre terapeutas" actionLabel="Ver inventário" onAction={() => setView("inventario")}>
          {stats.porSala.length === 0 || stats.totalRecursos === 0 ? (
            <Empty icon={MapPin} msg="Cadastre recursos para ver a distribuição" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
              {stats.porSala.slice(0, 8).map((sala, idx) => {
                const colors = [C.azul, C.verde, C.laranja, C.rosa, C.amarelo];
                const color = colors[idx % colors.length];
                return (
                  <div key={sala.id} style={s.salaRow}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: color + "1A", color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 12 }}>
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.texto, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sala.nome}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        {sala.terapeuta || "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'Fredoka', sans-serif", lineHeight: 1 }}>
                        {sala.count}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
                        {sala.exemplares} exemplares
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* RECENTES */}
        <Panel title="Cadastrados recentemente" subtitle="Últimos 5 recursos" actionLabel="Ver todos" onAction={() => setView("catalogo")}>
          {stats.recentes.length === 0 ? (
            <Empty icon={Sparkles} msg="Nenhum recurso ainda. Comece cadastrando o primeiro!" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
              {stats.recentes.map(r => {
                const t = tipoInfo(r.tipo);
                const e = estadoInfo(r.estado);
                return (
                  <div key={r.id} style={s.recenteRow}>
                    {r.fotoUrl ? (
                      <img src={r.fotoUrl} alt={r.nome} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: t.color + "1A", color: t.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 11 }}>
                        {r.code}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.texto, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.nome}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                        <span style={{ background: t.color + "20", color: t.color, padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{t.label}</span>
                        <span>{r.quantidade}× · {e.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* ATALHOS */}
        <Panel title="Atalhos" subtitle="Acesso rápido">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            <Quick label="Cadastrar novo recurso" icon={Plus} onClick={onCadastrar} color={C.laranja} />
            <Quick label="Explorar acervo completo" icon={BookOpen} onClick={() => setView("catalogo")} color={C.azul} />
            <Quick label="Inventário por sala" icon={MapPin} onClick={() => setView("inventario")} color={C.verde} />
            <Quick label="Gerar etiquetas" icon={TrendingUp} onClick={() => setView("etiquetas")} color={C.rosa} />
          </div>
        </Panel>
      </div>

      {/* ALERTAS */}
      {(stats.itensSemFoto > 0 || stats.itensRuins > 0) && (
        <div style={{ marginTop: 24, background: C.amarelo + "15", border: `1px solid ${C.amarelo}40`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#A47E1C", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            ⚠️ Atenção
          </div>
          {stats.itensRuins > 0 && (
            <div style={{ fontSize: 13, color: C.texto, marginBottom: 4 }}>
              • <strong>{stats.itensRuins}</strong> recurso(s) em mau estado precisam de atenção
            </div>
          )}
          {stats.itensSemFoto > 0 && (
            <div style={{ fontSize: 13, color: C.texto }}>
              • <strong>{stats.itensSemFoto}</strong> recurso(s) ainda sem foto cadastrada
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, alert }) {
  return (
    <div style={{ ...s.statCard, ...(alert ? { borderColor: color + "60" } : {}) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "1A", color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      </div>
      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 30, fontWeight: 800, lineHeight: 1, color: C.texto }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Panel({ title, subtitle, children, actionLabel, onAction }) {
  return (
    <section style={s.panel}>
      <div style={{ borderBottom: `1px solid ${C.borderSoft}`, paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={s.panelKicker}>{subtitle}</div>
          <div style={s.panelTitle}>{title}</div>
        </div>
        {actionLabel && (
          <button onClick={onAction} style={{ background: "transparent", border: "none", color: C.laranja, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            {actionLabel} <ArrowRight size={12} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Quick({ label, icon: Icon, onClick, color }) {
  return (
    <button onClick={onClick} style={s.quickAction}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: color + "1A", color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} strokeWidth={2.2} />
      </div>
      <span style={{ fontWeight: 600, fontSize: 13, color: C.texto }}>{label}</span>
      <ChevronRight size={13} style={{ marginLeft: "auto", color: C.muted }} />
    </button>
  );
}

function Empty({ icon: Icon, msg }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 12px", color: C.muted }}>
      <Icon size={28} style={{ opacity: 0.4 }} />
      <div style={{ fontSize: 12, marginTop: 8 }}>{msg}</div>
    </div>
  );
}

const s = {
  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  kicker: { fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 },
  title: { fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, margin: "6px 0 0", lineHeight: 1, color: C.azul },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.laranja, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 },
  statCard: { background: "white", border: `1px solid ${C.border}`, padding: 18, borderRadius: 14, position: "relative" },
  panel: { background: "white", border: `1px solid ${C.border}`, padding: 20, borderRadius: 14 },
  panelKicker: { fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, fontWeight: 700 },
  panelTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 17, fontWeight: 700, marginTop: 4, color: C.azul },
  barTrack: { height: 8, background: C.borderSoft, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4, transition: "width 0.5s" },
  salaRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderBottom: `1px solid ${C.borderSoft}` },
  recenteRow: { display: "flex", alignItems: "center", gap: 10, padding: "6px 0" },
  quickAction: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.offWhite, border: `1px solid ${C.borderSoft}`, borderRadius: 9, cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "left" },
};