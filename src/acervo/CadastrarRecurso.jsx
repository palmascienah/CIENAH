// ============================================================
// CIENAH — Cadastrar Recurso (Wizard de 3 passos)
// ============================================================
import { useState, useRef, useEffect } from "react";
import {
  X, Check, ChevronLeft, ChevronRight, Camera, Upload,
  Trash2, Plus, Image as ImageIcon, AlertCircle,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { C, TIPOS_RECURSO, ESTADOS, FAIXAS_ETARIAS } from "../lib/constants";
import { slugify } from "../lib/helpers";

export default function CadastrarRecurso({ resource, rooms, categories, onClose, onSave }) {
  const isEdit = !!resource;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    nome: resource?.nome || "",
    tipo: resource?.tipo || "brinquedo",
    quantidade: resource?.quantidade || 1,
    estado: resource?.estado || "bom",
    salaId: resource?.salaId || "",
    objetivos: resource?.objetivos || [],
    faixaEtaria: resource?.faixaEtaria || "todas",
    fotoUrl: resource?.fotoUrl || "",
    observacoes: resource?.observacoes || "",
  });

  const [novoObjetivo, setNovoObjetivo] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ============================================================
  // UPLOAD DE FOTO PRO SUPABASE STORAGE
  // ============================================================
  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem muito grande (máximo 5MB)");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const nomeArquivo = `${Date.now()}-${slugify(form.nome || "recurso")}.${ext}`;
      const path = `${nomeArquivo}`;

      const { error: uploadErr } = await supabase.storage
        .from("recursos")
        .upload(path, file, { upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("recursos")
        .getPublicUrl(path);

      set("fotoUrl", publicUrl);
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar foto: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFoto = () => set("fotoUrl", "");

  const addObjetivo = () => {
    if (!novoObjetivo.trim()) return;
    if (form.objetivos.includes(novoObjetivo.trim())) return;
    set("objetivos", [...form.objetivos, novoObjetivo.trim()]);
    setNovoObjetivo("");
  };

  const removeObjetivo = (obj) => {
    set("objetivos", form.objetivos.filter(o => o !== obj));
  };

  const addCategoria = (cat) => {
    if (form.objetivos.includes(cat.nome)) return;
    set("objetivos", [...form.objetivos, cat.nome]);
  };

  const canAdvance = () => {
    if (step === 1) return true; // foto opcional
    if (step === 2) return form.nome.trim() && form.tipo;
    if (step === 3) return true;
    return false;
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      setError("Nome é obrigatório");
      setStep(2);
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div style={s.header}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, fontWeight: 700 }}>
              {isEdit ? "Editar" : "Cadastrar"}
            </div>
            <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, margin: 0, color: C.azul, lineHeight: 1.1 }}>
              {isEdit ? form.nome : "Novo recurso"}
            </h3>
          </div>
          <button onClick={onClose} style={s.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* PROGRESS */}
        <div style={s.progress}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{
                ...s.stepCircle,
                background: step >= n ? C.laranja : C.borderSoft,
                color: step >= n ? "white" : C.muted,
              }}>
                {step > n ? <Check size={13} strokeWidth={3} /> : n}
              </div>
              <div style={{
                ...s.stepLabel,
                color: step >= n ? C.azul : C.muted,
                fontWeight: step === n ? 700 : 500,
              }}>
                {n === 1 ? "Foto" : n === 2 ? "Identificação" : "Detalhes"}
              </div>
              {n < 3 && <div style={{ flex: 1, height: 2, background: step > n ? C.laranja : C.borderSoft, margin: "0 8px" }} />}
            </div>
          ))}
        </div>

        {/* ERRO */}
        {error && (
          <div style={s.error}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* CONTEÚDO */}
        <div style={s.content}>
          {/* PASSO 1 — FOTO */}
          {step === 1 && (
            <div>
              <h4 style={s.stepTitle}>Foto do recurso</h4>
              <p style={s.stepDesc}>
                Uma boa foto ajuda a equipe a identificar o material rapidamente. Pode pular se não tiver agora — adicionar depois é fácil.
              </p>

              {form.fotoUrl ? (
                <div style={s.fotoBox}>
                  <img src={form.fotoUrl} alt="Preview" style={{ width: "100%", maxHeight: 340, objectFit: "contain", borderRadius: 12 }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
                    <button onClick={() => fileInputRef.current?.click()} style={s.btnGhost}>
                      <Upload size={14} /> Trocar foto
                    </button>
                    <button onClick={removeFoto} style={{ ...s.btnGhost, color: C.rosa, borderColor: C.rosa + "40" }}>
                      <Trash2 size={14} /> Remover
                    </button>
                  </div>
                </div>
              ) : (
                <div style={s.dropzone} onClick={() => fileInputRef.current?.click()}>
                  {uploading ? (
                    <>
                      <div className="spin" style={{ width: 40, height: 40, border: `3px solid ${C.borderSoft}`, borderTopColor: C.laranja, borderRadius: "50%" }} />
                      <div style={{ marginTop: 12, fontSize: 13, color: C.azul, fontWeight: 600 }}>Enviando...</div>
                    </>
                  ) : (
                    <>
                      <Camera size={48} color={C.azul} strokeWidth={1.5} />
                      <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: C.azul }}>
                        Clique para escolher uma foto
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                        JPG, PNG ou WEBP até 5MB
                      </div>
                    </>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={e => handleFile(e.target.files[0])}
              />

              <div style={{ marginTop: 16, padding: 12, background: C.amarelo + "15", border: `1px solid ${C.amarelo}40`, borderRadius: 10, fontSize: 12, color: C.texto }}>
                💡 <strong>Dica:</strong> Você pode pular este passo e adicionar foto depois pela tela de edição.
              </div>
            </div>
          )}

          {/* PASSO 2 — IDENTIFICAÇÃO */}
          {step === 2 && (
            <div>
              <h4 style={s.stepTitle}>Identificação básica</h4>
              <p style={s.stepDesc}>Informações principais do recurso.</p>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Nome do recurso *</label>
                <input
                  value={form.nome}
                  onChange={e => set("nome", e.target.value)}
                  style={s.input}
                  placeholder="Ex: Caixa registradora colorida"
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Tipo de material *</label>
                <div style={s.tipoGrid}>
                  {TIPOS_RECURSO.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set("tipo", t.id)}
                      style={{
                        ...s.tipoBtn,
                        background: form.tipo === t.id ? t.color : "white",
                        color: form.tipo === t.id ? "white" : C.texto,
                        borderColor: form.tipo === t.id ? t.color : C.border,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={s.label}>Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantidade}
                    onChange={e => set("quantidade", parseInt(e.target.value) || 1)}
                    style={s.input}
                  />
                </div>
                <div>
                  <label style={s.label}>Estado</label>
                  <select value={form.estado} onChange={e => set("estado", e.target.value)} style={s.input}>
                    {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={s.label}>Sala / Localização</label>
                <select value={form.salaId} onChange={e => set("salaId", e.target.value)} style={s.input}>
                  <option value="">— Selecione uma sala —</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.nome}{r.terapeuta ? ` (${r.terapeuta})` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* PASSO 3 — DETALHES CLÍNICOS */}
          {step === 3 && (
            <div>
              <h4 style={s.stepTitle}>Detalhes clínicos</h4>
              <p style={s.stepDesc}>Informações que ajudam terapeutas a localizar o material certo.</p>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Faixa etária recomendada</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6 }}>
                  {FAIXAS_ETARIAS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => set("faixaEtaria", f.id)}
                      style={{
                        ...s.tipoBtn,
                        background: form.faixaEtaria === f.id ? C.azul : "white",
                        color: form.faixaEtaria === f.id ? "white" : C.texto,
                        borderColor: form.faixaEtaria === f.id ? C.azul : C.border,
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Objetivos terapêuticos</label>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input
                    value={novoObjetivo}
                    onChange={e => setNovoObjetivo(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addObjetivo())}
                    style={{ ...s.input, flex: 1 }}
                    placeholder="Digite um objetivo e pressione Enter"
                  />
                  <button type="button" onClick={addObjetivo} style={s.btnAdd}>
                    <Plus size={14} />
                  </button>
                </div>

                {/* Sugestões de categorias */}
                {categories.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>
                      Sugestões:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {categories.filter(c => !form.objetivos.includes(c.nome)).map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => addCategoria(c)}
                          style={{ ...s.sugBtn, background: c.cor + "15", color: c.cor, borderColor: c.cor + "30" }}
                        >
                          + {c.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objetivos selecionados */}
                {form.objetivos.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                    {form.objetivos.map(obj => (
                      <span key={obj} style={s.tagSelected}>
                        {obj}
                        <button onClick={() => removeObjetivo(obj)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, marginLeft: 4, display: "flex" }}>
                          <X size={10} color="white" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={s.label}>Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={e => set("observacoes", e.target.value)}
                  style={{ ...s.input, minHeight: 70, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
                  placeholder="Detalhes adicionais sobre o recurso..."
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER COM AÇÕES */}
        <div style={s.footer}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} style={s.btnGhost}>
              <ChevronLeft size={14} /> Anterior
            </button>
          ) : (
            <button onClick={onClose} style={s.btnGhost}>Cancelar</button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              style={{ ...s.btnPrimary, opacity: canAdvance() ? 1 : 0.5, cursor: canAdvance() ? "pointer" : "not-allowed" }}
            >
              Próximo <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving || !form.nome.trim()} style={{ ...s.btnPrimary, opacity: saving || !form.nome.trim() ? 0.5 : 1 }}>
              {saving ? "Salvando..." : <>{isEdit ? "Salvar alterações" : "Cadastrar recurso"} <Check size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(5, 79, 111, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modal: { background: C.offWhite, borderRadius: 16, maxWidth: 680, width: "100%", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.border}` },
  closeBtn: { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", color: C.muted },
  progress: { display: "flex", padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: "white" },
  stepCircle: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  stepLabel: { fontSize: 12, marginLeft: 8 },
  error: { margin: "12px 24px 0", padding: "10px 14px", background: C.rosa + "15", color: C.rosa, borderRadius: 9, fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 },
  content: { padding: "24px", overflowY: "auto", flex: 1 },
  stepTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, color: C.azul, margin: "0 0 6px" },
  stepDesc: { color: C.muted, fontSize: 13, marginBottom: 18, lineHeight: 1.5 },
  label: { fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: C.azul, display: "block", marginBottom: 6, fontWeight: 700 },
  input: { width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 14, background: "white", fontFamily: "'Inter', sans-serif", color: C.texto, boxSizing: "border-box" },
  dropzone: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", border: `2px dashed ${C.azul}40`, borderRadius: 16, background: C.azul + "08", cursor: "pointer", textAlign: "center", minHeight: 220 },
  fotoBox: { padding: 16, background: "white", borderRadius: 14, border: `1px solid ${C.border}` },
  tipoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 6 },
  tipoBtn: { padding: "10px 12px", borderRadius: 9, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, border: "1px solid", textAlign: "center" },
  btnAdd: { padding: "11px 14px", background: C.laranja, color: "white", border: "none", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center" },
  sugBtn: { padding: "5px 10px", borderRadius: 100, border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 600 },
  tagSelected: { display: "inline-flex", alignItems: "center", padding: "4px 10px", background: C.verde, color: "white", borderRadius: 100, fontSize: 11, fontWeight: 700 },
  footer: { display: "flex", justifyContent: "space-between", gap: 8, padding: "16px 24px", borderTop: `1px solid ${C.border}`, background: "white", borderRadius: "0 0 16px 16px" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 20px", background: C.laranja, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "white", color: C.texto, border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" },
};