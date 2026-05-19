// ============================================================
// CIENAH — Inventário por Sala
// ============================================================
import { useState, useMemo } from "react";
import { Printer, MapPin, Box, Sparkles, ChevronDown, ChevronRight, Hash } from "lucide-react";
import { C } from "../lib/constants";
import { tipoInfo, estadoInfo } from "../Lib/helpers";

export default function Inventario({ data }) {
  const [expandedSalas, setExpandedSalas] = useState({});

  const salasComRecursos = useMemo(() => {
    const semSala = data.resources.filter(r => !r.salaId);
    const grouped = data.rooms
      .map(sala => ({
        ...sala,
        recursos: data.resources.filter(r => r.salaId === sala.id),
      }))
      .filter(s => s.recursos.length > 0 || data.rooms.length <= 13);

    if (semSala.length > 0) {
      grouped.push({
        id: "sem-sala",
        nome: "📦 Sem sala definida",
        terapeuta: "",
        recursos: semSala,
      });
    }
    return grouped;
  }, [data]);

  const toggleSala = (id) => {
    setExpandedSalas(e => ({ ...e, [id]: !e[id] }));
  };

  const expandAll = () => {
    const all = {};
    salasComRecursos.forEach(s => { all[s.id] = true; });
    setExpandedSalas(all);
  };

  const collapseAll = () => setExpandedSalas({});

  const printSala = (sala) => {
    const w = window.open("", "_blank");
    if (!w) {
      alert("Permita pop-ups para imprimir");
      return;
    }
    const totalExemplares = sala.recursos.reduce((acc, r) => acc + (r.quantidade || 1), 0);
    w.document.write(`
      <html>
        <head>
          <title>Inventário - ${sala.nome}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #054F6F; border-bottom: 3px solid #D27A2A; padding-bottom: 8px; }
            .meta { color: #666; margin-bottom: 24px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #054F6F; color: white; padding: 10px; text-align: left; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 30px; font-size: 11px; color: #999; text-align: center; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>${sala.nome}</h1>
          <div class="meta">
            ${sala.terapeuta ? `Responsável: <strong>${sala.terapeuta}</strong> · ` : ""}
            ${sala.recursos.length} tipo(s) · ${totalExemplares} exemplar(es)<br/>
            Gerado em ${new Date().toLocaleString("pt-BR")}
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${sala.recursos.map(r => `
                <tr>
                  <td><strong>${r.code}</strong></td>
                  <td>${r.nome}</td>
                  <td>${tipoInfo(r.tipo).label}</td>
                  <td>${r.quantidade}</td>
                  <td>${estadoInfo(r.estado).label}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="footer">CIENAH · Centro Interdisciplinar Especializado em Neurociência e Atendimento Humanizado</div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div style={{ padding: "28px 36px", maxHeight: "100vh", overflowY: "auto" }}>
      <div style={s.headerBar}>
        <div>
          <div style={s.kicker}><Sparkles size={11} /> Visão por sala</div>
          <h1 style={s.title}>Inventário</h1>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {salasComRecursos.length} sala(s) · {data.resources.length} recurso(s)
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={collapseAll} style={s.btnGhost}>
            Recolher todas
          </button>
          <button onClick={expandAll} style={s.btnGhost}>
            Expandir todas
          </button>
        </div>
      </div>

      {salasComRecursos.length === 0 ? (
        <div style={s.emptyState}>
          <MapPin size={32} color={C.azul} />
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, marginTop: 14 }}>
            Sem dados ainda
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            Cadastre recursos e associe-os às salas
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {salasComRecursos.map((sala, idx) => {
            const colors = [C.azul, C.verde, C.laranja, C.rosa, C.amarelo];
            const color = colors[idx % colors.length];
            const isExpanded = expandedSalas[sala.id];
            const totalExemplares = sala.recursos.reduce((acc, r) => acc + (r.quantidade || 1), 0);

            return (
              <div key={sala.id} style={s.salaBox}>
                <button onClick={() => toggleSala(sala.id)} style={{ ...s.salaHeader, borderLeft: `4px solid ${color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    {isExpanded ? <ChevronDown size={16} color={C.muted} /> : <ChevronRight size={16} color={C.muted} />}
                    <div style={{ ...s.salaIcon, background: color + "1A", color }}>
                      <MapPin size={16} />
                    </div>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.texto, fontFamily: "'Fredoka', sans-serif" }}>
                        {sala.nome}
                      </div>
                      {sala.terapeuta && (
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                          {sala.terapeuta}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>
                        {sala.recursos.length}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
                        {totalExemplares} exemplares
                      </div>
                    </div>
                    {sala.id !== "sem-sala" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); printSala(sala); }}
                        style={s.printBtn}
                        title="Imprimir inventário desta sala"
                      >
                        <Printer size={14} />
                      </button>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div style={s.salaContent}>
                    {sala.recursos.length === 0 ? (
                      <div style={{ padding: 16, color: C.muted, fontSize: 12, textAlign: "center", fontStyle: "italic" }}>
                        Nenhum recurso nesta sala
                      </div>
                    ) : (
                      <table style={s.table}>
                        <thead>
                          <tr>
                            <th style={s.th}>Código</th>
                            <th style={s.th}>Recurso</th>
                            <th style={s.th}>Tipo</th>
                            <th style={s.th}>Qtd</th>
                            <th style={s.th}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sala.recursos.map(r => {
                            const t = tipoInfo(r.tipo);
                            const e = estadoInfo(r.estado);
                            return (
                              <tr key={r.id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                                <td style={s.td}>
                                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: C.azul }}>
                                    <Hash size={9} style={{ verticalAlign: "middle" }} /> {r.code}
                                  </span>
                                </td>
                                <td style={s.td}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {r.fotoUrl ? (
                                      <img src={r.fotoUrl} alt="" style={{ width: 28, height: 28, borderRadius: 5, objectFit: "cover" }} />
                                    ) : (
                                      <div style={{ width: 28, height: 28, borderRadius: 5, background: t.color + "1A", display: "flex", alignItems: "center", justifyContent: "center", color: t.color }}>
                                        <Box size={14} />
                                      </div>
                                    )}
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.nome}</span>
                                  </div>
                                </td>
                                <td style={s.td}>
                                  <span style={{ background: t.color + "20", color: t.color, padding: "3px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                                    {t.label}
                                  </span>
                                </td>
                                <td style={{ ...s.td, fontWeight: 700, color: C.azul }}>{r.quantidade}×</td>
                                <td style={s.td}>
                                  <span style={{ background: e.color + "20", color: e.color, padding: "3px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                                    {e.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  kicker: { fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 },
  title: { fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, margin: "6px 0 0", lineHeight: 1, color: C.azul },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "white", color: C.texto, border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "white", border: `1px dashed ${C.border}`, borderRadius: 14 },
  salaBox: { background: "white", border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" },
  salaHeader: { width: "100%", display: "flex", alignItems: "center", padding: "14px 16px", background: "white", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  salaIcon: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  printBtn: { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: C.offWhite, border: `1px solid ${C.borderSoft}`, borderRadius: 8, cursor: "pointer", color: C.azul },
  salaContent: { borderTop: `1px solid ${C.borderSoft}`, overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, background: C.creamLight, borderBottom: `2px solid ${C.borderSoft}` },
  td: { padding: "10px 14px", fontSize: 13, color: C.texto },
};