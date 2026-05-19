// ============================================================
// CIENAH — Sidebar do Acervo
// ============================================================
import {
  BarChart3, BookOpen, MapPin, Tag, Hash, ChevronRight,
  Plus, Library, LogOut, Settings, Shield,
} from "lucide-react";
import { C, ROLE_LABELS } from "../lib/constants";
import { PatternBg } from "../components/FontStyles";

export default function Sidebar({ view, setView, user, onHub, onLogout, onCadastrar, perms }) {
  const items = [
    { id: "painel", label: "Painel", icon: BarChart3, alwaysVisible: true },
    { id: "catalogo", label: "Acervo", icon: BookOpen, alwaysVisible: true },
    { id: "inventario", label: "Inventário", icon: Library, alwaysVisible: true },
    { id: "etiquetas", label: "Etiquetas", icon: Hash, alwaysVisible: true },
    { id: "salas", label: "Salas", icon: MapPin, requires: "canManageRooms" },
    { id: "categorias", label: "Categorias", icon: Tag, requires: "canManageCategories" },
    { id: "admin", label: "Admin", icon: Shield, requires: "canDelete" },
  ];

  return (
    <aside style={s.sidebar}>
      <PatternBg opacity={0.04} dark />

      <div style={s.brand}>
        <div style={s.brandMark}>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 38, height: 38, objectFit: "contain" }} />
        </div>
        <div>
          <div style={s.brandTitle}>Acervo</div>
          <div style={s.brandSub}>CIENAH</div>
        </div>
      </div>

      {perms.canEdit && (
        <button onClick={onCadastrar} style={s.cadastrarBtn}>
          <Plus size={16} strokeWidth={2.5} /> Novo recurso
        </button>
      )}

      <nav style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
        {items.map((it) => {
          if (it.requires && !perms[it.requires]) return null;
          const Icon = it.icon;
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{it.label}</span>
              {active && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
            </button>
          );
        })}
      </nav>

      <div style={s.bottomBox}>
        <div style={s.userBox}>
          <div style={s.avatar}>{user.name?.charAt(0)?.toUpperCase() || "?"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.userName}>{user.name}</div>
            <div style={s.userRole}>{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          <button onClick={onHub} style={s.miniBtn} title="Voltar ao Hub">
            <Library size={12} />
          </button>
          <button onClick={onLogout} style={s.miniBtn} title="Sair">
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: 240,
    background: C.azul,
    color: C.cream,
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "hidden",
    flexShrink: 0,
  },
  brand: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    paddingBottom: 18,
    borderBottom: "1px solid rgba(245,241,232,0.15)",
    position: "relative",
    zIndex: 1,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: C.cream,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 19, fontWeight: 700, lineHeight: 1, color: C.laranja },
  brandSub: { fontSize: 9.5, letterSpacing: 1, color: "rgba(245,241,232,0.7)", marginTop: 3, fontWeight: 500 },
  cadastrarBtn: {
    marginTop: 18,
    width: "100%",
    padding: "11px 14px",
    background: C.laranja,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    position: "relative",
    zIndex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    width: "100%",
    padding: "10px 12px",
    marginBottom: 2,
    background: "transparent",
    border: "none",
    color: "rgba(245,241,232,0.75)",
    cursor: "pointer",
    fontSize: 13.5,
    borderRadius: 9,
    textAlign: "left",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  navItemActive: { background: "rgba(210,122,42,0.9)", color: "#fff" },
  bottomBox: {
    marginTop: "auto",
    paddingTop: 14,
    borderTop: "1px solid rgba(245,241,232,0.15)",
    position: "relative",
    zIndex: 1,
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: C.laranja,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  userName: {
    fontSize: 12,
    fontWeight: 700,
    color: C.cream,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userRole: { fontSize: 10, color: "rgba(245,241,232,0.6)" },
  miniBtn: {
    flex: 1,
    padding: "7px 0",
    background: "rgba(0,0,0,0.2)",
    color: "rgba(245,241,232,0.7)",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};