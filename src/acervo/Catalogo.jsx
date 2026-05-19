// ============================================================
// CIENAH — Catálogo (visualização de recursos)
// ============================================================
import { useState, useMemo } from "react";
import {
  Search, Plus, Filter, Edit3, Trash2, BookOpen,
  Sparkles, Box, Hash, MapPin, X,
} from "lucide-react";
import { C, TIPOS_RECURSO, ESTADOS } from "../lib/constants";
import { tipoInfo, estadoInfo, faixaInfo } from "../Lib/helpers";

export default function Catalogo({ data, perms, onEdit, onDelete, onCadastrar }) {
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [filtroSala, setFiltroSala] = useState("all");
  const [filtroEstado, setFiltroEstado] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return data.resources.filter(r => {
      const matchSearch = !search || (
        r.nome.toLowerCase().includes(search.toLowerCase()) ||
        (r.code || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.observacoes || "").toLowerCase().includes(search.toLowerCase())
      );
      const matchTipo = filtroTipo === "all" || r.tipo === filtroTipo;
      const matchSala = filtroSala === "all" || r.salaId === filtroSala;
      const matchEstado = filtroEstado === "all" || r.estado === filtroEstado;
      return matchSearch && matchTipo && matchSala && matchEstado;
    });
  }, [data.resources, search, filtroTipo, filtroSala, filtroEstado]);

  const clearFilters = () => {
    setFiltroTipo("all");
    setFiltroSala("all");
    setFiltroEstado("all");
    setSearch("");
  };

  const activeFilters = [filtroTipo, filtroSala, filtroEstado].filter(f => f !== "all").length;

  return (
    <div style={{ padding: "28px 36px", maxHeight: "100vh", overflowY: "auto" }}>
      <div style={s.headerBar}>
        <div>
          <div style={s.kicker}><Sparkles size={11} /> Catalogação</div>
          <h1 style={s.title}>Acervo Terapêutico</h1>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {filtered.length} de {data.resources.length} recursos
          </div>
        </div>
        {perms.canEdit && (
          <button onClick={onCadastrar} style={s.btnPrimary}>
            <Plus size={14} /> Novo recurso
          </button>
        )}
      </div>

      {/* TOOLBAR */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color={C.muted} />
          <input
            placeholder="Buscar por nome, código ou observação..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ ...s.btnGhost, background: showFilters || activeFilters > 0 ? C.azul + "1A" : "white", borderColor: showFilters || activeFilters > 0 ? C.azul : C.border, color: showFilters || activeFilters > 0 ? C.azul : C.texto }}>
          <Filter size={14} />
          Filtros
          {activeFilters > 0 && (
            <span style={{ background: C.azul, color: "white", borderRadius: 100, padding: "2px 7px", fontSize: 10, fontWeight: 800 }}>
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* FILTROS */}
      {showFilters && (
        <div style={s.filterPanel}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Tipo</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={s.select}>
              <option value="all">Todos os tipos</option>
              {TIPOS_RECURSO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Sala</label>
            <select value={filtroSala} onChange={e => setFiltroSala(e.target.value)} style={s.select}>
              <option value="all">Todas as salas</option>
              {data.rooms.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </div>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Estado</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={s.select}>
              <option value="all">Todos os estados</option>
              {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
          </div>
          {activeFilters > 0 && (
            <button onClick={clearFilters} style={{ ...s.btnGhost, color: C.rosa, borderColor: C.rosa + "40" }}>
              <X size={14} /> Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* GRID DE RECURSOS */}
      {filtered.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}><BookOpen size={32} color={C.azul} /></div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, marginTop: 14 }}>
            {data.resources.length === 0 ? "Acervo vazio" : "Nenhum recurso encontrado"}
          </div>
          <div style={{ color: C.muted, marginTop: 5, fontSize: 13, maxWidth: 360, margin: "5px auto 0" }}>
            {data.resources.length === 0 ? "Comece cadastrando o primeiro recurso terapêutico." : "Tente ajustar os filtros ou a busca."}
          </div>
          {data.resources.length === 0 && perms.canEdit && (
            <button onClick={onCadastrar} style={{ ...s.btnPrimary, marginTop: 16 }}>
              <Plus size={14} /> Cadastrar primeiro recurso
            </button>
          )}
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map(r => (
            <RecursoCard
              key={r.id}
              recurso={r}
              rooms={data.rooms}
              perms={perms}
              onEdit={() => onEdit(r)}
              onDelete={() => { if (window.confirm(`Remover "${r.nome}"?`)) onDelete(r.id); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecursoCard({ recurso, rooms, perms, onEdit, onDelete }) {
  const tipo = tipoInfo(recurso.tipo);
  const estado = estadoInfo(recurso.estado);
  const faixa = faixaInfo(recurso.faixaEtaria);
  const sala = rooms.find(r => r.id === recurso.salaId);

  return (
    <article style={s.card}>
      {/* FOTO ou placeholder */}
      <div style={{ ...s.cardImg, background: recurso.fotoUrl ? "transparent" : tipo.color + "12" }}>
        {recurso.fotoUrl ? (
          <img src={recurso.fotoUrl} alt={recurso.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center", color: tipo.color }}>
            <Box size={36} strokeWidth={1.5} />
            <div style={{ fontSize: 10, marginTop: 4, fontWeight: 700 }}>Sem foto</div>
          </div>
        )}
        {/* Código */}
        <div style={s.codeBadge}>
          <Hash size={10} strokeWidth={2.5} />
          {recurso.code}
        </div>
        {/* Estado pill */}
        <div style={{ ...s.statusPill, background: estado.color + "EE", color: "white" }}>
          {estado.label}
        </div>
      </div>

      {/* INFO */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ ...s.chipTipo, background: tipo.color, color: "white" }}>{tipo.label}</span>
          {recurso.quantidade > 1 && (
            <span style={s.chipQtd}>{recurso.quantidade}× exemplares</span>
          )}
        </div>

        <h3 style={s.cardTitle}>{recurso.nome}</h3>

        <div style={s.cardMeta}>
          {sala && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
              <MapPin size={11} color={C.muted} />
              <span>{sala.nome}</span>
            </div>
          )}
          {recurso.faixaEtaria && recurso.faixaEtaria !== "todas" && (
            <div style={{ marginBottom: 3 }}>👶 {faixa.label}</div>
          )}
        </div>

        {recurso.objetivos && recurso.objetivos.length > 0 && (
          <div style={s.tags}>
            {recurso.objetivos.slice(0, 3).map(obj => (
              <span key={obj} style={s.tag}>{obj}</span>
            ))}
            {recurso.objetivos.length > 3 && (
              <span style={{ ...s.tag, background: C.muted + "20", color: C.muted }}>+{recurso.objetivos.length - 3}</span>
            )}
          </div>
        )}

        {recurso.observacoes && (
          <div style={s.notes}>{recurso.observacoes}</div>
        )}

        <div style={s.actions}>
          {perms.canEdit && (
            <button onClick={onEdit} style={s.btnEdit}>
              <Edit3 size={12} /> Editar
            </button>
          )}
          {perms.canDelete && (
            <button onClick={onDelete} style={s.btnDel}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

const s = {
  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  kicker: { fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 },
  title: { fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, margin: "6px 0 0", lineHeight: 1, color: C.azul },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.laranja, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "white", color: C.texto, border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" },
  toolbar: { display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" },
  searchBox: { flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9 },
  searchInput: { flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: "'Inter', sans-serif", color: C.texto, outline: "none" },
  filterPanel: { background: "white", border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" },
  filterGroup: { flex: "1 1 180px" },
  filterLabel: { fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.azul, display: "block", marginBottom: 5, fontWeight: 700 },
  select: { width: "100%", padding: "9px 12px", background: "white", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500, color: C.texto, fontFamily: "'Inter', sans-serif" },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "white", border: `1px dashed ${C.border}`, borderRadius: 14 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, background: C.azul + "12", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 },
  card: { background: "white", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.15s" },
  cardImg: { width: "100%", height: 160, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  codeBadge: { position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,0.92)", color: C.azul, padding: "4px 9px", borderRadius: 7, fontSize: 10, fontWeight: 800, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 3, backdropFilter: "blur(4px)" },
  statusPill: { position: "absolute", top: 8, right: 8, padding: "3px 9px", borderRadius: 11, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  chipTipo: { padding: "3px 8px", borderRadius: 11, fontSize: 10, fontWeight: 700 },
  chipQtd: { padding: "3px 8px", borderRadius: 11, fontSize: 10, fontWeight: 700, background: C.azul + "1A", color: C.azul },
  cardTitle: { fontSize: 15.5, fontWeight: 700, margin: 0, color: C.texto, lineHeight: 1.25, fontFamily: "'Fredoka', sans-serif" },
  cardMeta: { fontSize: 11.5, color: C.muted, marginTop: 6, fontWeight: 600 },
  tags: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 },
  tag: { fontSize: 10, padding: "2px 8px", background: C.verde + "1A", borderRadius: 9, color: C.verde, display: "inline-flex", alignItems: "center", fontWeight: 600 },
  notes: { fontSize: 12, color: C.texto, marginTop: 8, fontStyle: "italic", lineHeight: 1.5, paddingLeft: 9, borderLeft: `2px solid ${C.borderSoft}` },
  actions: { display: "flex", gap: 5, marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.borderSoft}` },
  btnEdit: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 9px", background: C.azul, color: "white", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11.5, fontWeight: 700 },
  btnDel: { width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: C.offWhite, border: `1px solid ${C.borderSoft}`, borderRadius: 7, cursor: "pointer", color: C.rosa },
};