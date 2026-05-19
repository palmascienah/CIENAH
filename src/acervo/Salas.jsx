// ============================================================
// CIENAH — Gerenciamento de Salas
// ============================================================
import { useState } from "react";
import { Plus, Edit3, Trash2, Check, X, MapPin, User, Sparkles } from "lucide-react";
import { C } from "../lib/constants";

export default function Salas({ rooms, resources, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const countResources = (salaId) =>
    resources.filter(r => r.salaId === salaId).length;

  const handleDelete = (sala) => {
    const count = countResources(sala.id);
    if (count > 0) {
      if (!window.confirm(`Esta sala tem ${count} recurso(s) associado(s). Eles ficarão sem sala. Remover mesmo assim?`)) return;
    } else {
      if (!window.confirm(`Remover a sala "${sala.nome}"?`)) return;
    }
    onDelete(sala.id);
  };

  return (
    <div style={{ padding: "28px 36px", maxHeight: "100vh", overflowY: "auto" }}>
      <div style={s.headerBar}>
        <div>
          <div style={s.kicker}><Sparkles size={11} /> Administração</div>
          <h1 style={s.title}>Salas / Terapeutas</h1>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {rooms.length} sala(s) cadastrada(s)
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={s.btnPrimary}>
          <Plus size={14} /> Nova sala
        </button>
      </div>

      {rooms.length === 0 ? (
        <div style={s.emptyState}>
          <MapPin size={32} color={C.azul} />
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, marginTop: 14 }}>
            Nenhuma sala cadastrada
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            Cadastre as salas/terapeutas da clínica
          </div>
        </div>
      ) : (
        <div style={s.grid}>
          {rooms.map((sala, idx) => {
            const colors = [C.azul, C.verde, C.laranja, C.rosa, C.amarelo];
            const color = colors[idx % colors.length];
            const count = countResources(sala.id);
            return (
              <div key={sala.id} style={s.card}>
                <div style={{ height: 4, background: color }} />
                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ ...s.iconBox, background: color + "1A", color }}>
                      <MapPin size={20} />
                    </div>
                    <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 24, fontWeight: 800, color }}>
                      {count}
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 17, fontWeight: 700, marginTop: 12, marginBottom: 4, color: C.texto }}>
                    {sala.nome}
                  </h3>
                  {sala.terapeuta && (
                    <div style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                      <User size={11} /> {sala.terapeuta}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                    {count === 0 ? "Sem recursos" : count === 1 ? "1 recurso" : `${count} recursos`}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}` }}>
                    <button onClick={() => { setEditing(sala); setShowForm(true); }} style={{ ...s.btnGhost, flex: 1 }}>
                      <Edit3 size={11} /> Editar
                    </button>
                    <button onClick={() => handleDelete(sala)} style={{ ...s.btnGhost, color: C.rosa, width: 32, padding: 0, justifyContent: "center" }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <SalaForm
          sala={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={(s) => {
            if (editing) onUpdate(editing.id, s);
            else onAdd(s);
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function SalaForm({ sala, onClose, onSave }) {
  const [nome, setNome] = useState(sala?.nome || "");
  const [terapeuta, setTerapeuta] = useState(sala?.terapeuta || "");

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, margin: 0, color: C.azul }}>
            {sala ? "Editar sala" : "Nova sala"}
          </h3>
          <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.muted }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Nome da sala *</label>
            <input value={nome} onChange={e => setNome(e.target.value)} style={s.input} placeholder="Ex: Sala Estefanny" autoFocus />
          </div>
          <div>
            <label style={s.label}>Terapeuta / Responsável</label>
            <input value={terapeuta} onChange={e => setTerapeuta(e.target.value)} style={s.input} placeholder="Ex: Estefanny" />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={onClose} style={s.btnGhost}>Cancelar</button>
          <button
            onClick={() => nome.trim() && onSave({ nome: nome.trim(), terapeuta: terapeuta.trim() })}
            disabled={!nome.trim()}
            style={{ ...s.btnPrimary, opacity: nome.trim() ? 1 : 0.5 }}
          >
            <Check size={13} /> {sala ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  kicker: { fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 },
  title: { fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, margin: "6px 0 0", lineHeight: 1, color: C.azul },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.laranja, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  btnGhost: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 12px", background: "white", color: C.texto, border: `1px solid ${C.border}`, borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "white", border: `1px dashed ${C.border}`, borderRadius: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 },
  card: { background: "white", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" },
  iconBox: { width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  backdrop: { position: "fixed", inset: 0, background: "rgba(5, 79, 111, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modal: { background: C.offWhite, borderRadius: 14, maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" },
  label: { fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: C.azul, display: "block", marginBottom: 6, fontWeight: 700 },
  input: { width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 14, background: "white", fontFamily: "'Inter', sans-serif", color: C.texto, boxSizing: "border-box" },
};