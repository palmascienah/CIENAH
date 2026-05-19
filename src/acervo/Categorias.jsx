// ============================================================
// CIENAH — Gerenciamento de Categorias (objetivos terapêuticos)
// ============================================================
import { useState } from "react";
import { Plus, Edit3, Trash2, Check, X, Tag, Sparkles } from "lucide-react";
import { C } from "../lib/constants";

const CORES_DISPONIVEIS = [
  "#054F6F", "#0A6B7C", "#7BA840", "#A4B83A", "#CD8438",
  "#E89B4F", "#D77E7E", "#5B5BA3", "#9B59B6", "#E67E22",
  "#E6C84A", "#D27A2A",
];

export default function Categorias({ categories, resources, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const countUsage = (catNome) =>
    resources.filter(r => (r.objetivos || []).includes(catNome)).length;

  const handleDelete = (cat) => {
    const count = countUsage(cat.nome);
    if (count > 0) {
      if (!window.confirm(`Esta categoria está em uso em ${count} recurso(s). Remover mesmo assim?`)) return;
    } else {
      if (!window.confirm(`Remover a categoria "${cat.nome}"?`)) return;
    }
    onDelete(cat.id);
  };

  return (
    <div style={{ padding: "28px 36px", maxHeight: "100vh", overflowY: "auto" }}>
      <div style={s.headerBar}>
        <div>
          <div style={s.kicker}><Sparkles size={11} /> Administração</div>
          <h1 style={s.title}>Categorias de Objetivos</h1>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {categories.length} categoria(s) · usadas como tags nos recursos
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={s.btnPrimary}>
          <Plus size={14} /> Nova categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <div style={s.emptyState}>
          <Tag size={32} color={C.azul} />
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, marginTop: 14 }}>
            Nenhuma categoria cadastrada
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4, maxWidth: 360, margin: "4px auto 0" }}>
            Crie categorias como "Linguagem oral" ou "Motricidade fina" pra agrupar objetivos terapêuticos.
          </div>
        </div>
      ) : (
        <div style={s.grid}>
          {categories.map(cat => {
            const count = countUsage(cat.nome);
            return (
              <div key={cat.id} style={s.card}>
                <div style={{ height: 4, background: cat.cor }} />
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ ...s.iconBox, background: cat.cor + "1A", color: cat.cor }}>
                      <Tag size={18} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 800, color: cat.cor, lineHeight: 1 }}>
                        {count}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
                        {count === 1 ? "uso" : "usos"}
                      </div>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: C.texto, fontFamily: "'Fredoka', sans-serif" }}>
                    {cat.nome}
                  </h3>
                  <div style={{ display: "flex", gap: 5, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}` }}>
                    <button onClick={() => { setEditing(cat); setShowForm(true); }} style={{ ...s.btnGhost, flex: 1 }}>
                      <Edit3 size={11} /> Editar
                    </button>
                    <button onClick={() => handleDelete(cat)} style={{ ...s.btnGhost, color: C.rosa, width: 32, padding: 0, justifyContent: "center" }}>
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
        <CategoriaForm
          cat={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={(c) => {
            if (editing) onUpdate(editing.id, c);
            else onAdd(c);
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CategoriaForm({ cat, onClose, onSave }) {
  const [nome, setNome] = useState(cat?.nome || "");
  const [cor, setCor] = useState(cat?.cor || CORES_DISPONIVEIS[0]);

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, margin: 0, color: C.azul }}>
            {cat ? "Editar categoria" : "Nova categoria"}
          </h3>
          <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.muted }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={s.label}>Nome da categoria *</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              style={s.input}
              placeholder="Ex: Linguagem oral, Motricidade fina..."
              autoFocus
            />
          </div>
          <div>
            <label style={s.label}>Cor visual</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {CORES_DISPONIVEIS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: c,
                    border: cor === c ? `3px solid ${C.azul}` : `3px solid transparent`,
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "transform 0.1s",
                    transform: cor === c ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {nome.trim() && (
            <div style={{ marginTop: 18, padding: 12, background: cor + "15", border: `1px solid ${cor}40`, borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Pré-visualização:
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", background: cor, color: "white", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                {nome.trim()}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={onClose} style={s.btnGhost}>Cancelar</button>
          <button
            onClick={() => nome.trim() && onSave({ nome: nome.trim(), cor })}
            disabled={!nome.trim()}
            style={{ ...s.btnPrimary, opacity: nome.trim() ? 1 : 0.5 }}
          >
            <Check size={13} /> {cat ? "Salvar" : "Cadastrar"}
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  card: { background: "white", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" },
  iconBox: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  backdrop: { position: "fixed", inset: 0, background: "rgba(5, 79, 111, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modal: { background: C.offWhite, borderRadius: 14, maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" },
  label: { fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: C.azul, display: "block", marginBottom: 6, fontWeight: 700 },
  input: { width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 14, background: "white", fontFamily: "'Inter', sans-serif", color: C.texto, boxSizing: "border-box" },
};