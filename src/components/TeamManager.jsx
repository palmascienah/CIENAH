// ============================================================
// CIENAH — Gerenciamento de Equipe (admin only)
// ============================================================
import { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Search, Trash2, Edit3, Check, X, MoreVertical,
  Mail, User, Library, Brain, FileText, Shield, LogOut, Users as UsersIcon,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { C, APPS, ROLE_LABELS } from "../lib/constants";

export default function TeamManager({ user, onLogout, onHub }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar: " + err.message, "error");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (member) => {
    try {
      if (editing?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({
            name: member.name,
            role: member.role,
            apps: member.apps,
          })
          .eq("id", editing.id);
        if (error) throw error;
        showToast("Membro atualizado");
      } else {
        showToast("Para criar novos membros, use Auth → Users no Supabase", "error");
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const handleDelete = async (m) => {
    if (m.id === user.id) {
      showToast("Você não pode remover a si mesma", "error");
      return;
    }
    if (!window.confirm(`Remover ${m.name} do sistema?`)) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", m.id);
      if (error) throw error;
      showToast("Membro removido");
      load();
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const filtered = members.filter((m) => {
    const matchSearch = (m.name + " " + m.email).toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || m.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = {
    total: members.length,
    admin: members.filter((m) => m.role === "admin").length,
    biblio: members.filter((m) => m.role === "bibliotecario").length,
    terapeuta: members.filter((m) => m.role === "terapeuta").length,
  };

  return (
    <div style={s.page}>
      <header style={{ padding: "1rem 2.5rem", background: "white", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onHub} style={s.backBtn}>
          <ArrowLeft size={14} /> Voltar ao Hub
        </button>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: C.laranja, fontWeight: 700, textTransform: "uppercase" }}>
            Administração
          </div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, color: C.azul, lineHeight: 1 }}>
            Equipe
          </div>
        </div>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.texto }}>
          <LogOut size={14} /> Sair
        </button>
      </header>

      <main style={s.main}>
        <div style={s.statsGrid}>
          <StatBox label="Total" value={stats.total} icon={UsersIcon} color={C.azul} />
          <StatBox label="Administradores" value={stats.admin} icon={Shield} color={C.laranja} />
          <StatBox label="Bibliotecários" value={stats.biblio} icon={Library} color={C.verde} />
          <StatBox label="Terapeutas" value={stats.terapeuta} icon={User} color={C.rosa} />
        </div>

        <div style={s.toolbar}>
          <div style={s.searchBox}>
            <Search size={15} color={C.muted} />
            <input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.searchInput}
            />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={s.select}>
            <option value="all">Todas as funções</option>
            <option value="admin">Administrador</option>
            <option value="bibliotecario">Bibliotecário</option>
            <option value="terapeuta">Terapeuta</option>
            <option value="leitor">Leitor</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.muted }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}><UsersIcon size={32} color={C.azul} /></div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, marginTop: 14 }}>
              Nenhum membro encontrado
            </div>
          </div>
        ) : (
          <div style={s.cardsGrid}>
            {filtered.map((m) => (
              <div key={m.id} style={s.memberCard}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.laranja, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                    {m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.memberName}>{m.name}</div>
                    <div style={s.memberEmail}>{m.email}</div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)} style={s.menuBtn}>
                      <MoreVertical size={14} />
                    </button>
                    {menuOpen === m.id && (
                      <div style={s.menuDropdown}>
                        <button onClick={() => { setEditing(m); setShowForm(true); setMenuOpen(null); }} style={s.menuItem}>
                          <Edit3 size={12} /> Editar
                        </button>
                        {m.id !== user.id && (
                          <button onClick={() => { handleDelete(m); setMenuOpen(null); }} style={{ ...s.menuItem, color: C.rosa }}>
                            <Trash2 size={12} /> Remover
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div style={s.memberInfo}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>FUNÇÃO</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.texto, marginBottom: 10 }}>
                    {ROLE_LABELS[m.role] || m.role}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>APPS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(m.apps || []).map((a) => (
                      <span key={a} style={{ ...s.appTag, background: (APPS[a]?.color || C.muted) + "20", color: APPS[a]?.color || C.muted }}>
                        {APPS[a]?.label || a}
                      </span>
                    ))}
                    {(!m.apps || m.apps.length === 0) && (
                      <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>Sem apps</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <MemberForm
          member={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? C.rosa : C.verde }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }) {
  return (
    <div style={{ background: "white", border: `1px solid ${C.border}`, padding: 14, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "1A", color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, color: C.texto, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function MemberForm({ member, onClose, onSave }) {
  const [form, setForm] = useState(
    member
      ? { name: member.name, role: member.role, apps: member.apps || [] }
      : { name: "", role: "terapeuta", apps: [] }
  );

  const toggleApp = (appId) => {
    setForm((f) => ({
      ...f,
      apps: f.apps.includes(appId) ? f.apps.filter((a) => a !== appId) : [...f.apps, appId],
    }));
  };

  return (
    <div style={s.modalBackdrop} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, margin: 0, color: C.azul }}>
            Editar Membro
          </h3>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: 7, cursor: "pointer", color: C.muted }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={s.formLabel}>Nome</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={s.formInput} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={s.formLabel}>Função</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {Object.entries(ROLE_LABELS).map(([roleId, label]) => (
              <button key={roleId} type="button" onClick={() => setForm({ ...form, role: roleId })} style={{ ...s.roleBtn, background: form.role === roleId ? C.azul : "white", color: form.role === roleId ? "white" : C.texto, border: `1px solid ${form.role === roleId ? C.azul : C.border}`, fontWeight: form.role === roleId ? 700 : 500 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={s.formLabel}>Apps com acesso</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(APPS).map(([appId, app]) => (
              <button key={appId} type="button" onClick={() => toggleApp(appId)} style={{ ...s.appBtn, background: form.apps.includes(appId) ? app.color + "15" : "white", border: `1px solid ${form.apps.includes(appId) ? app.color : C.border}` }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${form.apps.includes(appId) ? app.color : C.border}`, background: form.apps.includes(appId) ? app.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.apps.includes(appId) && <Check size={12} color="white" strokeWidth={3} />}
                </div>
                <span style={{ flex: 1, textAlign: "left", color: C.texto, fontWeight: 600, fontSize: 13 }}>{app.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <button onClick={onClose} style={{ padding: "10px 16px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.texto }}>
            Cancelar
          </button>
          <button onClick={() => onSave(form)} style={{ padding: "10px 18px", background: C.laranja, color: "white", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <Check size={13} style={{ marginRight: 4, verticalAlign: "middle" }} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter', sans-serif" },
  backBtn: { background: "transparent", border: "none", cursor: "pointer", color: C.azul, fontSize: 13, fontWeight: 600, padding: 6, display: "flex", alignItems: "center", gap: 6 },
  main: { padding: "2rem 2.5rem", maxWidth: 1300, margin: "0 auto" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 },
  toolbar: { display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" },
  searchBox: { flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9 },
  searchInput: { flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: "'Inter', sans-serif", color: C.texto, outline: "none" },
  select: { padding: "10px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, cursor: "pointer", fontWeight: 500, color: C.texto },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 },
  memberCard: { background: "white", border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, position: "relative", overflow: "hidden" },
  memberName: { fontFamily: "'Fredoka', sans-serif", fontSize: 16, fontWeight: 700, margin: 0, color: C.texto, lineHeight: 1.2 },
  memberEmail: { fontSize: 12, color: C.muted, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  memberInfo: { paddingTop: 8 },
  menuBtn: { width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: C.offWhite, border: `1px solid ${C.borderSoft}`, borderRadius: 7, cursor: "pointer", color: C.muted },
  menuDropdown: { position: "absolute", top: 36, right: 0, background: "white", border: `1px solid ${C.border}`, borderRadius: 9, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 5, minWidth: 160, zIndex: 10 },
  menuItem: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: 13, color: C.texto, fontWeight: 500, borderRadius: 6, textAlign: "left" },
  appTag: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 100, fontSize: 10.5, fontWeight: 700 },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "white", border: `1px dashed ${C.border}`, borderRadius: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, background: C.azul + "12", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  formLabel: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.azul, display: "block", marginBottom: 6, fontWeight: 700 },
  formInput: { width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 14, background: "white", fontFamily: "'Inter', sans-serif", color: C.texto, boxSizing: "border-box" },
  roleBtn: { display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif", justifyContent: "center", fontSize: 13 },
  appBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(5, 79, 111, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modal: { background: C.offWhite, borderRadius: 14, maxWidth: 580, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: 22, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" },
  toast: { position: "fixed", bottom: 20, right: 20, padding: "11px 18px", color: "#fff", borderRadius: 9, fontSize: 12.5, display: "flex", alignItems: "center", gap: 7, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 200, fontWeight: 600 },
};