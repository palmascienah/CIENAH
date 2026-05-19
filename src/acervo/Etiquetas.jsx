// ============================================================
// CIENAH — Etiquetas com Código de Barras (CODE-128)
// ============================================================
import { useState, useMemo } from "react";
import { Printer, Hash, Search, Check, X, Sparkles } from "lucide-react";
import { C } from "../lib/constants";
import { tipoInfo } from "../lib/helpers";

// ============================================================
// Gerador simples de barras estilo CODE-128
// (visualmente convincente; pra produção real, biblioteca dedicada)
// ============================================================
function Barcode({ value, height = 50 }) {
  const bars = useMemo(() => {
    const seed = String(value || "0000");
    const arr = [];
    // Padrão start
    arr.push({ w: 2, fill: true });
    arr.push({ w: 1, fill: false });
    arr.push({ w: 1, fill: true });
    arr.push({ w: 1, fill: false });
    arr.push({ w: 1, fill: true });
    arr.push({ w: 2, fill: false });

    // Dados
    for (let i = 0; i < seed.length * 4; i++) {
      const w = ((seed.charCodeAt(i % seed.length) + i * 3) % 3) + 1;
      arr.push({ w, fill: i % 2 === 0 });
      arr.push({ w: 1, fill: i % 2 !== 0 });
    }

    // Padrão stop
    arr.push({ w: 2, fill: true });
    arr.push({ w: 1, fill: false });
    arr.push({ w: 1, fill: true });
    return arr;
  }, [value]);

  const totalW = bars.reduce((acc, b) => acc + b.w + 0.5, 0);

  let x = 0;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${totalW} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      {bars.map((b, i) => {
        const rect = b.fill ? <rect key={i} x={x} y="0" width={b.w} height={height} fill="#000" /> : null;
        x += b.w + 0.5;
        return rect;
      })}
    </svg>
  );
}

export default function Etiquetas({ resources, rooms }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [filterSala, setFilterSala] = useState("all");
  const [size, setSize] = useState("medium");

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const matchSearch = !search || (
        r.nome.toLowerCase().includes(search.toLowerCase()) ||
        (r.code || "").toLowerCase().includes(search.toLowerCase())
      );
      const matchSala = filterSala === "all" || r.salaId === filterSala;
      return matchSearch && matchSala;
    });
  }, [resources, search, filterSala]);

  const toSelect = filtered.filter(r => selected.size === 0 || selected.has(r.id));

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAll = () => setSelected(new Set(filtered.map(r => r.id)));
  const clearSelection = () => setSelected(new Set());

  const sizes = {
    small: { w: 180, h: 90, fontSize: 11, barH: 40 },
    medium: { w: 230, h: 120, fontSize: 13, barH: 55 },
    large: { w: 290, h: 150, fontSize: 15, barH: 70 },
  };
  const cfg = sizes[size];

  return (
    <div style={{ padding: "28px 36px", maxHeight: "100vh", overflowY: "auto" }}>
      <div className="no-print" style={s.headerBar}>
        <div>
          <div style={s.kicker}><Sparkles size={11} /> Etiquetas</div>
          <h1 style={s.title}>Códigos de Barras</h1>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {toSelect.length} etiqueta(s) prontas para imprimir
          </div>
        </div>
        <button onClick={() => window.print()} style={s.btnPrimary} disabled={toSelect.length === 0}>
          <Printer size={14} /> Imprimir
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="no-print" style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color={C.muted} />
          <input
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
        </div>
        <select value={filterSala} onChange={e => setFilterSala(e.target.value)} style={s.select}>
          <option value="all">Todas as salas</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
        </select>
        <select value={size} onChange={e => setSize(e.target.value)} style={s.select}>
          <option value="small">Pequeno</option>
          <option value="medium">Médio</option>
          <option value="large">Grande</option>
        </select>
      </div>

      {/* AÇÕES DE SELEÇÃO */}
      <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
          {selected.size > 0 ? `${selected.size} selecionado(s)` : "Nenhum selecionado · imprimindo todos os filtrados"}
        </span>
        {selected.size > 0 ? (
          <button onClick={clearSelection} style={s.btnGhost}>
            <X size={12} /> Limpar
          </button>
        ) : (
          filtered.length > 0 && (
            <button onClick={selectAll} style={s.btnGhost}>
              <Check size={12} /> Selecionar todos visíveis
            </button>
          )
        )}
      </div>

      {/* GRID */}
      {toSelect.length === 0 ? (
        <div style={s.emptyState}>
          <Hash size={32} color={C.azul} />
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, marginTop: 14 }}>
            Nenhuma etiqueta
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            Cadastre recursos para gerar etiquetas
          </div>
        </div>
      ) : (
        <div style={{ ...s.grid, gridTemplateColumns: `repeat(auto-fill, minmax(${cfg.w}px, 1fr))` }} id="etiquetas-print">
          {toSelect.map(r => {
            const t = tipoInfo(r.tipo);
            const sala = rooms.find(s => s.id === r.salaId);
            const isSelected = selected.has(r.id);
            return (
              <div
                key={r.id}
                onClick={() => toggle(r.id)}
                style={{
                  ...s.etiqueta,
                  width: cfg.w,
                  minHeight: cfg.h,
                  borderColor: isSelected ? C.laranja : C.border,
                  borderWidth: isSelected ? 2 : 1,
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: t.color }} />
                <div className="no-print" style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 5, background: isSelected ? C.laranja : "white", border: `1.5px solid ${isSelected ? C.laranja : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSelected && <Check size={11} color="white" strokeWidth={3} />}
                </div>
                <div style={{ fontSize: cfg.fontSize, fontWeight: 700, color: C.texto, marginBottom: 4, paddingRight: 18, lineHeight: 1.2 }}>
                  {r.nome}
                </div>
                {sala && (
                  <div style={{ fontSize: cfg.fontSize - 2, color: C.muted, marginBottom: 4 }}>
                    📍 {sala.nome}
                  </div>
                )}
                <div style={{ marginTop: "auto" }}>
                  <Barcode value={r.code} height={cfg.barH} />
                  <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: cfg.fontSize - 1, fontWeight: 700, marginTop: 4, letterSpacing: 2, color: C.azul }}>
                    {r.code}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSS PRINT */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #etiquetas-print, #etiquetas-print * { visibility: visible; }
          #etiquetas-print { position: absolute; left: 0; top: 0; padding: 10px; }
        }
      `}</style>
    </div>
  );
}

const s = {
  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  kicker: { fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 },
  title: { fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, margin: "6px 0 0", lineHeight: 1, color: C.azul },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.laranja, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "white", color: C.texto, border: `1px solid ${C.border}`, borderRadius: 7, cursor: "pointer", fontSize: 11.5, fontWeight: 600 },
  toolbar: { display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" },
  searchBox: { flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9 },
  searchInput: { flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: "'Inter', sans-serif", color: C.texto, outline: "none" },
  select: { padding: "10px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, cursor: "pointer", fontWeight: 500, color: C.texto, fontFamily: "'Inter', sans-serif" },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "white", border: `1px dashed ${C.border}`, borderRadius: 14 },
  grid: { display: "grid", gap: 10, justifyContent: "start" },
  etiqueta: { background: "white", border: "1px solid", borderRadius: 8, padding: "10px 14px", position: "relative", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" },
};