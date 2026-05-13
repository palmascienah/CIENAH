// ============================================================
// PORTAL CIENAH — App.jsx
// Versão MIGRADA: Supabase como fonte única de dados (SSOT)
// ============================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen, Users, BarChart3, Tag, Search, Plus, Download, Upload,
  Layers, Puzzle, ToyBrick, Copy, Pencil, Zap,
  Scan, Trash2, Edit3, X, Check, Clock, AlertCircle, Library,
  Film, Music, Gamepad2, Dice5, Globe, Lock, FileText,
  ChevronRight, Calendar, User, Hash, LogOut, Brain, Heart,
  Sparkles, Shield, Package, FileCheck, ArrowRight, MapPin,
  Phone, Mail, AtSign, Stethoscope, MessageCircle, Hand,
  Music as MusicIcon, GraduationCap, Baby, Eye as EyeIcon,
  EyeOff, Menu, UserPlus, UserCog, MoreVertical, Crown
} from "lucide-react";
import { supabase } from "./supabaseClient";

// ============================================================
// PALETA CIENAH OFICIAL
// ============================================================
const C = {
  laranja: "#D6893D",
  amarelo: "#DDB042",
  rosa: "#BE3455",
  verde: "#7C8131",
  azul: "#054F6F",
  azulEscuro: "#033c54",
  offWhite: "#EFEDE9",
  cream: "#F5F1E8",
  creamLight: "#FAF7F0",
  texto: "#2a2a2a",
  textoSuave: "#5e5e5e",
  linha: "#e0d8c8",
  border: "#E2DCCC",
  borderSoft: "#EFE9DA",
  muted: "#6B7A82",
};

const ROLE_LABELS = {
  admin: "Administrador",
  bibliotecario: "Bibliotecário(a)",
  terapeuta: "Terapeuta",
  leitor: "Leitor",
};

const ROLE_ICONS = {
  admin: Crown,
  bibliotecario: BookOpen,
  terapeuta: Brain,
  leitor: EyeIcon,
};

const ROLE_COLORS = {
  admin: C.laranja,
  bibliotecario: C.azul,
  terapeuta: C.rosa,
  leitor: C.verde,
};

const ROLE_PERMISSIONS = {
  admin: { canEdit: true, canDelete: true, canManageUsers: true, canLoan: true },
  bibliotecario: { canEdit: true, canDelete: true, canManageUsers: true, canLoan: true },
  terapeuta: { canEdit: false, canDelete: false, canManageUsers: false, canLoan: true },
  leitor: { canEdit: false, canDelete: false, canManageUsers: false, canLoan: false },
};

const AVAILABLE_APPS = [
  { id: "acervo", label: "Acervo Bibliográfico", icon: BookOpen, color: C.azul },
  { id: "aba", label: "CIENAH ABA", icon: Brain, color: C.rosa },
  { id: "laudos", label: "Produção de Laudos", icon: FileCheck, color: C.verde },
];

// ============================================================
// HELPERS
// ============================================================
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x.toISOString().slice(0, 10);
};
const fmt = (d) => d ? new Date(d + "T00:00").toLocaleDateString("pt-BR") : "—";

const MEDIA_TYPES = [
  { id: "book",        label: "Livro",                  icon: BookOpen,    color: C.azul },
  { id: "boardgame",   label: "Jogo de Tabuleiro",      icon: Dice5,       color: C.verde },
  { id: "cards",       label: "Cartas",                 icon: Layers,      color: C.rosa },
  { id: "puzzle",      label: "Encaixes/Quebra-cabeça", icon: Puzzle,      color: C.laranja },
  { id: "toy",         label: "Lúdico/Brinquedo",       icon: ToyBrick,    color: C.amarelo },
  { id: "pairing",     label: "Pareamento",             icon: Copy,        color: C.verde },
  { id: "instrument",  label: "Instrumento Musical",    icon: Music,       color: C.azul },
  { id: "stationery",  label: "Papelaria",              icon: Pencil,      color: C.rosa },
  { id: "causeeffect", label: "Causa e Efeito",         icon: Zap,         color: C.laranja },
  { id: "other",       label: "Outros",                 icon: Package,     color: C.muted || "#999" },
];

const mediaInfo = (t) => MEDIA_TYPES.find(m => m.id === t) || MEDIA_TYPES[0];

async function fetchMetadata(isbn) {
  try {
    const r = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const data = await r.json();
    const book = data[`ISBN:${isbn}`];
    if (!book) return null;
    return {
      title: book.title || "",
      author: book.authors?.[0]?.name || "",
      year: book.publish_date ? parseInt(book.publish_date.slice(-4)) : "",
      publisher: book.publishers?.[0]?.name || "",
    };
  } catch {
    return null;
  }
}

// ============================================================
// EDGE FUNCTIONS - Helpers para chamar
// ============================================================
async function callEdgeFunction(functionName, body) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Nao autenticado");

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro desconhecido");
  return data;
}

// ============================================================
// SUPABASE DATA HELPERS — Acervo
// ============================================================
// Converte do formato do banco (snake_case) pro formato do app (camelCase)
function itemFromDb(row) {
  return {
    id: row.id,
    code: row.code || "",
    title: row.title,
    type: row.type || "other",
    author: row.author || "",
    year: row.year || "",
    publisher: row.publisher || "",
    location: row.location || "",
    quantity: row.quantity || 1,
    pieces: row.pieces || "",
    notes: row.notes || "",
    tags: row.tags || [],
    available: row.available !== false,
    completed: row.completed || false,
    createdAt: row.created_at,
  };
}

function readerFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email || "",
    phone: row.phone || "",
    role: row.category || "Aluno",
    createdAt: row.created_at,
  };
}

function loanFromDb(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.reader_id,
    loanDate: row.loan_date,
    dueDate: row.due_date,
    returnDate: row.return_date,
    registeredBy: row.registered_by || "",
  };
}

function reservationFromDb(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.reader_id,
    date: row.reservation_date,
    status: row.status || "ativa",
  };
}

// ============================================================
// LOGO CIENAH
// ============================================================
function CienahBrain({ size = 48 }) {
  return (
    <img src="/cienah-logo.png" alt="CIENAH" style={{ width: size, height: size, objectFit: "contain" }} />
  );
}

function PatternBg({ opacity = 0.18, dark = false }) {
  const stroke = dark ? "#FFFFFF" : C.cream;
  const id = `pat-${dark ? "dark" : "light"}-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity }}>
      <defs>
        <pattern id={id} x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
          <ellipse cx="20" cy="20" rx="6" ry="3" fill="none" stroke={stroke} strokeWidth="1.2" />
          <ellipse cx="34" cy="20" rx="6" ry="3" fill="none" stroke={stroke} strokeWidth="1.2" />
          <circle cx="20" cy="20" r="1.5" fill={stroke} />
          <circle cx="34" cy="20" r="1.5" fill={stroke} />
          <path d="M80,25 Q90,20 100,25 Q90,30 80,25 Z" fill="none" stroke={stroke} strokeWidth="1.2" />
          <circle cx="140" cy="25" r="6" fill="none" stroke={stroke} strokeWidth="1.2" />
          <circle cx="140" cy="25" r="2" fill={stroke} />
          {[0,45,90,135,180,225,270,315].map(a => {
            const rad = (a * Math.PI) / 180;
            return <line key={a} x1={140 + Math.cos(rad)*7} y1={25 + Math.sin(rad)*7} x2={140 + Math.cos(rad)*11} y2={25 + Math.sin(rad)*11} stroke={stroke} strokeWidth="1.2" />;
          })}
          <path d="M30,80 L30,95 M25,82 L25,93 M35,82 L35,93 M40,84 L40,90" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M22,95 Q32,100 42,95 L42,84 Q32,80 22,84 Z" fill="none" stroke={stroke} strokeWidth="1.2" />
          <path d="M85,85 Q92,82 95,88 M88,92 Q95,89 97,95" fill="none" stroke={stroke} strokeWidth="1.2" />
          <path d="M140,85 Q148,82 152,90 Q150,98 144,98 Q138,94 140,85 Z" fill="none" stroke={stroke} strokeWidth="1.2" />
          <ellipse cx="20" cy="140" rx="6" ry="3" fill="none" stroke={stroke} strokeWidth="1.2" />
          <ellipse cx="34" cy="140" rx="6" ry="3" fill="none" stroke={stroke} strokeWidth="1.2" />
          <circle cx="140" cy="145" r="6" fill="none" stroke={stroke} strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function App() {
  const [route, setRoute] = useState("home");
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // ============================================================
  // LIMPEZA DE LIXO DO LOCALSTORAGE (migração antiga)
  // Remove chaves do sistema antigo que podem corromper a sessão
  // ============================================================
  useEffect(() => {
    try {
      const chavesAntigas = [
        "cienah:portal:public:v1",
        "cienah:portal:private:v1",
        "cienah:portal:session",
        "acervo_cienah_private_v1",
        "acervo_cienah_public_v1",
      ];
      chavesAntigas.forEach(chave => {
        if (localStorage.getItem(chave)) {
          console.log(`🧹 Removendo localStorage antigo: ${chave}`);
          localStorage.removeItem(chave);
        }
      });
    } catch (e) {
      console.warn("Erro ao limpar localStorage:", e);
    }
  }, []);

  const fetchProfile = async (authUser) => {
    if (!authUser) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();
    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }
    return data;
  };

  // ============================================================
  // INICIALIZAÇÃO DE SESSÃO — com timeout e proteção total
  // ============================================================
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Timeout duro: 8 segundos máximo no getSession
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout: getSession travou")), 8000)
        );

        let sessionData;
        try {
          sessionData = await Promise.race([sessionPromise, timeoutPromise]);
        } catch (timeoutErr) {
          console.error("⚠️ getSession travou — limpando storage e seguindo:", timeoutErr);
          try {
            await supabase.auth.signOut({ scope: "local" });
          } catch {}
          if (mounted) setLoadingSession(false);
          return;
        }

        const session = sessionData?.data?.session;

        if (session?.user && mounted) {
          try {
            const profilePromise = fetchProfile(session.user);
            const profileTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout: fetchProfile")), 8000)
            );
            const profile = await Promise.race([profilePromise, profileTimeout]);
            if (profile && mounted) setUser(profile);
          } catch (profileErr) {
            console.error("Erro ao buscar perfil:", profileErr);
          }
        }
      } catch (err) {
        console.error("Erro fatal na inicializacao:", err);
      } finally {
        if (mounted) setLoadingSession(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log("🔔 Auth event:", event);
      try {
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          if (profile && mounted) setUser(profile);
        } else {
          setUser(null);
          setRoute("home");
        }
      } catch (err) {
        console.error("Erro no listener:", err);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (profile) => {
    setUser(profile);
    if (profile.apps?.includes("acervo")) setRoute("acervo");
    else if (profile.apps?.includes("aba")) setRoute("aba");
    else if (profile.apps?.includes("laudos")) setRoute("laudos");
    else setRoute("hub");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoute("home");
  };

  // ============================================================
  // TELA DE CARREGAMENTO — com botão de emergência
  // ============================================================
  if (loadingSession) {
    return (
      <>
        <FontAndStyles />
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.offWhite,
          fontFamily: "'Inter', sans-serif",
          padding: 20,
        }}>
          <div style={{ textAlign: "center", maxWidth: 360 }}>
            <img
              src="/cienah-logo.png"
              alt="CIENAH"
              style={{ width: 80, height: 80, objectFit: "contain" }}
            />
            <div style={{ marginTop: 20, fontSize: 14, color: C.azul, fontWeight: 600 }}>
              Carregando...
            </div>
            <button
              onClick={async () => {
                try {
                  await supabase.auth.signOut();
                } catch {}
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                marginTop: 32,
                padding: "8px 16px",
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.muted,
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Está travado? Clique para resetar
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FontAndStyles />
      {route === "home" && <LandingPage onNavigate={setRoute} user={user} />}
      {route === "login" && <LoginPage onLogin={handleLogin} onBack={() => setRoute("home")} />}
      {route === "hub" && user && <AppHub user={user} onNavigate={setRoute} onLogout={handleLogout} />}
      {route === "equipe" && user && user.role === "admin" && <TeamManager user={user} onLogout={handleLogout} onHub={() => setRoute("hub")} />}
      {route === "acervo" && user && (user.apps?.includes("acervo") ? <AcervoApp user={user} onLogout={handleLogout} onHub={() => setRoute("hub")} /> : <NoAccess onBack={() => setRoute("hub")} />)}
      {route === "aba" && user && (user.apps?.includes("aba") ? <PlaceholderApp app="aba" user={user} onLogout={handleLogout} onHub={() => setRoute("hub")} /> : <NoAccess onBack={() => setRoute("hub")} />)}
      {route === "laudos" && user && (user.apps?.includes("laudos") ? <PlaceholderApp app="laudos" user={user} onLogout={handleLogout} onHub={() => setRoute("hub")} /> : <NoAccess onBack={() => setRoute("hub")} />)}
    </>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================
function LandingPage({ onNavigate, user }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const valores = [
    { titulo: "Ética", desc: "Conduta íntegra em cada atendimento" },
    { titulo: "Empatia", desc: "Olhar humano para cada história" },
    { titulo: "Excelência", desc: "Compromisso com a qualidade clínica" },
    { titulo: "Acolhimento", desc: "Espaço seguro para todos" },
    { titulo: "Ciência", desc: "Práticas baseadas em evidência" },
    { titulo: "Inovação", desc: "Novas formas de cuidar" },
    { titulo: "Respeito", desc: "À singularidade de cada um" },
    { titulo: "Família", desc: "Trabalho em parceria" },
    { titulo: "Diversidade", desc: "Valorização das diferenças" },
    { titulo: "Responsabilidade", desc: "Comprometimento social" },
  ];

  const especialidades = [
    { icon: MessageCircle, titulo: "Fonoaudiologia", itens: ["Linguagem", "Audiologia", "Voz"], color: C.azul },
    { icon: Hand, titulo: "Terapia Ocupacional", itens: ["Integração Sensorial", "AVDs"], color: C.rosa },
    { icon: EyeIcon, titulo: "Psicologia", itens: ["ABA", "TCC", "Avaliação"], color: C.verde },
    { icon: MusicIcon, titulo: "Musicoterapia", itens: ["Estimulação", "Regulação"], color: C.amarelo },
    { icon: Brain, titulo: "Neuropsicopedagogia", itens: ["Aprendizagem", "Atenção"], color: C.laranja },
    { icon: GraduationCap, titulo: "Psicopedagogia", itens: ["Reforço cognitivo"], color: C.azul },
    { icon: Heart, titulo: "Acompanhamento", itens: ["Familiar", "Escolar"], color: C.verde },
    { icon: Baby, titulo: "Estimulação Precoce", itens: ["0 a 3 anos"], color: C.rosa },
  ];

  return (
    <div style={landingStyles.page}>
      <nav style={{ ...landingStyles.nav, ...(scrolled ? landingStyles.navScrolled : {}) }}>
        <div style={landingStyles.logoWrapper}>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 48, height: 48, objectFit: "contain" }} />
          <div>
            <div style={landingStyles.logoName}>CIENAH</div>
            <div style={landingStyles.logoSub}>Centro Interdisciplinar Especializado<br />em Neurociência e Atendimento Humanizado</div>
          </div>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={landingStyles.mobileMenuBtn}>
          <Menu size={24} />
        </button>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`} style={landingStyles.navLinks}>
          <li><a href="#sobre" style={landingStyles.navLink} onClick={() => setMenuOpen(false)}>Sobre</a></li>
          <li><a href="#especialidades" style={landingStyles.navLink} onClick={() => setMenuOpen(false)}>Especialidades</a></li>
          <li><a href="#contato" style={landingStyles.navLink} onClick={() => setMenuOpen(false)}>Contato</a></li>
          {user ? (
            <li><button onClick={() => onNavigate("hub")} style={landingStyles.navCta}>Acessar sistema</button></li>
          ) : (
            <li><button onClick={() => onNavigate("login")} style={landingStyles.navCta}>Área restrita</button></li>
          )}
        </ul>
      </nav>

      <section style={landingStyles.hero}>
        <div style={{ ...landingStyles.blob, ...landingStyles.blob1 }} />
        <div style={{ ...landingStyles.blob, ...landingStyles.blob2 }} />
        <div style={{ ...landingStyles.blob, ...landingStyles.blob3 }} />

        <div style={landingStyles.heroGrid}>
          <div>
            <div style={landingStyles.heroTag}>
              <span style={landingStyles.heroDot} />
              Palmas, Tocantins · Desde 2020
            </div>
            <h1 style={landingStyles.heroH1}>
              <span style={{ color: C.laranja, fontWeight: 600 }}>Humanização</span> e{" "}
              <span style={{ color: C.rosa, fontWeight: 600 }}>neurociência</span>:<br />
              tudo em um<br />
              <span style={{ color: C.verde, fontStyle: "italic" }}>só lugar</span>
            </h1>
            <p style={landingStyles.heroSub}>
              Centro Interdisciplinar Especializado em Neurociência e Atendimento Humanizado.
              Cuidado integral para crianças, adolescentes e adultos com práticas baseadas em evidências.
            </p>
            <div style={landingStyles.heroActions}>
              <a href="#especialidades" style={landingStyles.btnPrimary}>
                Conheça as especialidades <ArrowRight size={18} />
              </a>
              <a href="#contato" style={landingStyles.btnSecondary}>
                Agende uma avaliação
              </a>
            </div>
          </div>

          <div style={landingStyles.heroVisual}>
            <div style={landingStyles.brainContainer}>
              <img src="/cienah-logo.png" alt="CIENAH" style={{ width: "100%", maxWidth: 480, height: "auto" }} />
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" style={{ ...landingStyles.secao, background: "white" }}>
        <div style={landingStyles.secaoContainer}>
          <span style={{ ...landingStyles.secaoTag, color: C.rosa, background: C.rosa + "1A" }}>Quem Somos</span>
          <h2 style={landingStyles.secaoTitulo}>Um centro pensado para acolher, cuidar e desenvolver</h2>
          <div style={landingStyles.lobulosGrid}>
            <div style={{ ...landingStyles.lobulo, background: `linear-gradient(135deg, ${C.laranja}1F, ${C.laranja}08)`, border: `2px solid ${C.laranja}33` }}>
              <div style={{ ...landingStyles.lobuloIcon, background: C.laranja }}>
                <Heart size={28} color="white" strokeWidth={2} />
              </div>
              <h3 style={landingStyles.lobuloH3}>Atendimento Humanizado</h3>
              <p style={landingStyles.lobuloP}>Cada paciente é único. Cuidamos com escuta atenta, respeito e atenção integral.</p>
            </div>
            <div style={{ ...landingStyles.lobulo, background: `linear-gradient(135deg, ${C.rosa}1F, ${C.rosa}08)`, border: `2px solid ${C.rosa}33` }}>
              <div style={{ ...landingStyles.lobuloIcon, background: C.rosa }}>
                <Brain size={28} color="white" strokeWidth={2} />
              </div>
              <h3 style={landingStyles.lobuloH3}>Base Científica</h3>
              <p style={landingStyles.lobuloP}>Práticas baseadas em evidências da neurociência atual, com formação contínua.</p>
            </div>
            <div style={{ ...landingStyles.lobulo, background: `linear-gradient(135deg, ${C.verde}1F, ${C.verde}08)`, border: `2px solid ${C.verde}33` }}>
              <div style={{ ...landingStyles.lobuloIcon, background: C.verde }}>
                <Users size={28} color="white" strokeWidth={2} />
              </div>
              <h3 style={landingStyles.lobuloH3}>Equipe Interdisciplinar</h3>
              <p style={landingStyles.lobuloP}>Profissionais de diferentes áreas trabalhando juntos com plano integrado.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...landingStyles.secao, background: C.offWhite }}>
        <div style={landingStyles.propositoCard}>
          <div style={{ ...landingStyles.blob, width: 200, height: 200, background: C.laranja, top: -50, left: -50, opacity: 0.08 }} />
          <div style={{ ...landingStyles.blob, width: 250, height: 250, background: C.rosa, bottom: -80, right: -80, opacity: 0.08 }} />
          <div style={landingStyles.propositoAspas}>"</div>
          <p style={landingStyles.propositoTexto}>
            Acreditamos que o cuidado começa no <strong>olhar atento</strong> e se constrói com{" "}
            <em>ciência e afeto</em>.
          </p>
        </div>
      </section>

      <section style={landingStyles.missaoVisao}>
        <div style={landingStyles.mvContainer}>
          <div style={{ ...landingStyles.mvCard, background: `linear-gradient(135deg, ${C.laranja}, #c4762e)` }}>
            <PatternBg opacity={0.08} dark />
            <div style={landingStyles.mvNumero}>01</div>
            <h3 style={landingStyles.mvH3}>Missão</h3>
            <p style={landingStyles.mvP}>Oferecer atendimento clínico interdisciplinar de excelência, integrando neurociência e humanização para promover desenvolvimento e qualidade de vida.</p>
          </div>
          <div style={{ ...landingStyles.mvCard, background: `linear-gradient(135deg, ${C.azul}, ${C.azulEscuro})` }}>
            <PatternBg opacity={0.08} dark />
            <div style={landingStyles.mvNumero}>02</div>
            <h3 style={landingStyles.mvH3}>Visão</h3>
            <p style={landingStyles.mvP}>Ser referência regional em cuidado interdisciplinar humanizado, formando uma rede de apoio que transforma vidas através do conhecimento científico aliado ao acolhimento.</p>
          </div>
        </div>
      </section>

      <section style={{ ...landingStyles.secao, background: C.offWhite }}>
        <div style={landingStyles.secaoContainer}>
          <span style={{ ...landingStyles.secaoTag, color: "#a47e1c", background: C.amarelo + "2D" }}>Valores</span>
          <h2 style={landingStyles.secaoTitulo}>Os princípios que guiam cada decisão</h2>
          <div style={landingStyles.valoresGrid}>
            {valores.map((v, i) => {
              const colors = [C.laranja, C.rosa, C.verde, C.amarelo, C.azul];
              const color = colors[i % 5];
              return (
                <div key={i} style={{ ...landingStyles.valorCard, borderTopColor: color }}>
                  <div style={{ ...landingStyles.valorIconMini, background: color + "26", color: i % 5 === 3 ? "#a47e1c" : color }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h4 style={landingStyles.valorH4}>{v.titulo}</h4>
                  <p style={landingStyles.valorP}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="especialidades" style={{ ...landingStyles.secao, background: "white" }}>
        <div style={landingStyles.secaoContainer}>
          <span style={{ ...landingStyles.secaoTag, color: C.verde, background: C.verde + "1F" }}>Especialidades</span>
          <h2 style={landingStyles.secaoTitulo}>Áreas de atuação para um cuidado completo</h2>
          <div style={landingStyles.espGrid}>
            {especialidades.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={i} style={landingStyles.espCard}>
                  <div style={{ ...landingStyles.espIconBig, background: e.color }}>
                    <Icon size={26} color="white" strokeWidth={2} />
                  </div>
                  <h4 style={landingStyles.espH4}>{e.titulo}</h4>
                  <ul style={landingStyles.espUl}>
                    {e.itens.map((item, j) => (
                      <li key={j} style={{ ...landingStyles.espLi, color: C.textoSuave }}>
                        <span style={{ color: e.color }}>·</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contato" style={{ ...landingStyles.secao, background: C.azul, color: "white", position: "relative", overflow: "hidden" }}>
        <PatternBg opacity={0.05} dark />
        <div style={{ ...landingStyles.secaoContainer, textAlign: "center", position: "relative", zIndex: 2 }}>
          <span style={{ ...landingStyles.secaoTag, color: C.amarelo, background: "rgba(255,255,255,0.1)" }}>Contato</span>
          <h2 style={{ ...landingStyles.secaoTitulo, color: "white", margin: "0 auto" }}>Vamos cuidar juntos</h2>
          <div style={landingStyles.contatoGrid}>
            <div style={landingStyles.contatoItem}>
              <MapPin size={28} color={C.laranja} />
              <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>Endereço</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Palmas, Tocantins</div>
            </div>
            <div style={landingStyles.contatoItem}>
              <Phone size={28} color={C.amarelo} />
              <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>Telefone</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>(63) 99125-2929</div>
            </div>
            <div style={landingStyles.contatoItem}>
              <Mail size={28} color={C.rosa} />
              <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>E-mail</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>cienahpalmas@gmail.com.br</div>
            </div>
            <div style={landingStyles.contatoItem}>
              <AtSign size={28} color={C.verde} />
              <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>Instagram</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>@cienahpalmas</div>
            </div>
          </div>
          <button onClick={() => onNavigate("login")} style={{ ...landingStyles.btnPrimary, marginTop: 48, background: C.laranja }}>
            <Lock size={18} /> Área restrita da equipe
          </button>
        </div>
      </section>

      <footer style={landingStyles.footer}>
        <div style={landingStyles.secaoContainer}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 42, height: 42, objectFit: "contain" }} />
              <div>
                <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, color: C.laranja }}>CIENAH</div>
                <div style={{ fontSize: 11, color: C.textoSuave }}>© 2026 · Todos os direitos reservados</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("E-mail ainda nao confirmado. Verifique sua caixa de entrada.");
        } else {
          setError("Erro ao entrar: " + authError.message);
        }
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        setError("Perfil nao encontrado. Contate o administrador.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      onLogin(profile);
    } catch (err) {
      console.error("Erro inesperado no login:", err);
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div style={loginStyles.page}>
      <div style={loginStyles.left}>
        <PatternBg opacity={0.06} dark />
        <button onClick={onBack} style={loginStyles.backBtn}>← Voltar ao site</button>
        <div style={loginStyles.leftContent}>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 120, height: 120, objectFit: "contain" }} />
          <h1 style={loginStyles.leftTitle}>Portal CIENAH</h1>
          <p style={loginStyles.leftSub}>Sistema integrado para gestão clínica e administrativa</p>
          <div style={loginStyles.leftFeatures}>
            <div style={loginStyles.leftFeature}><Package size={20} color={C.amarelo} /> Acervo bibliográfico</div>
            <div style={loginStyles.leftFeature}><Brain size={20} color={C.amarelo} /> CIENAH ABA</div>
            <div style={loginStyles.leftFeature}><FileCheck size={20} color={C.amarelo} /> Produção de Laudos</div>
          </div>
        </div>
      </div>

      <div style={loginStyles.right}>
        <div style={loginStyles.formBox}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.laranja, fontWeight: 700, marginBottom: 8 }}>ACESSO RESTRITO</div>
            <h2 style={loginStyles.formTitle}>Entre na sua conta</h2>
            <p style={{ color: C.textoSuave, fontSize: 14, marginTop: 6 }}>Use as credenciais fornecidas pela equipe.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={loginStyles.label}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={loginStyles.input} placeholder="seu@cienah.com.br" required autoComplete="email" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={loginStyles.label}>Senha</label>
              <div style={{ position: "relative" }}>
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...loginStyles.input, paddingRight: 44 }} placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={loginStyles.eyeBtn}>
                  {showPwd ? <EyeOff size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div style={loginStyles.error}><AlertCircle size={14} /> {error}</div>
            )}
            <button type="submit" disabled={loading} style={loginStyles.submitBtn}>
              {loading ? "Entrando..." : <>Entrar <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: 14, background: C.creamLight, borderRadius: 10, fontSize: 12, color: C.textoSuave, textAlign: "center", lineHeight: 1.5 }}>
            <Lock size={14} style={{ verticalAlign: "middle", marginRight: 6, color: C.azul }} />
            Acesso restrito à equipe CIENAH.<br />
            Esqueceu a senha? Entre em contato com o administrador.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HUB DE APLICATIVOS
// ============================================================
function AppHub({ user, onNavigate, onLogout }) {
  const apps = [
    { id: "acervo", title: "Acervo Bibliográfico", desc: "Catalogação, empréstimos e controle do estoque de livros, jogos e mídias", icon: BookOpen, color: C.azul, status: "ativo" },
    { id: "aba", title: "CIENAH ABA", desc: "Sistema de aplicação e registro de programas ABA para terapia", icon: Brain, color: C.rosa, status: "em-breve" },
    { id: "laudos", title: "Produção de Laudos", desc: "Geração e gestão de PAC e AVN — relatórios psicopedagógicos e neuropsicológicos", icon: FileCheck, color: C.verde, status: "em-breve" },
  ];
  const userApps = apps.filter(a => user.apps?.includes(a.id));
  const isAdmin = user.role === "admin";

  return (
    <div style={hubStyles.page}>
      <header style={hubStyles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 44, height: 44, objectFit: "contain" }} />
          <div>
            <div style={hubStyles.headerKicker}>Portal CIENAH</div>
            <div style={hubStyles.headerTitle}>Bem-vindo(a), {user.name.split(" ")[0]}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {isAdmin && (
            <button onClick={() => onNavigate("equipe")} style={hubStyles.adminBtn}>
              <UserCog size={14} /> Gerenciar Equipe
            </button>
          )}
          <div style={hubStyles.userChip}>
            <div style={{ ...hubStyles.avatar, background: C.laranja }}>{user.name.charAt(0)}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: C.textoSuave }}>{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <button onClick={onLogout} style={hubStyles.logoutBtn}><LogOut size={14} /> Sair</button>
        </div>
      </header>

      <main style={hubStyles.main}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.laranja, fontWeight: 700, marginBottom: 6 }}>APLICATIVOS DISPONÍVEIS</div>
          <h1 style={hubStyles.h1}>Escolha o sistema que deseja acessar</h1>
        </div>

        <div style={hubStyles.appsGrid}>
          {userApps.map(app => {
            const Icon = app.icon;
            const available = app.status === "ativo";
            return (
              <button key={app.id} onClick={() => available && onNavigate(app.id)} disabled={!available}
                style={{ ...hubStyles.appCard, background: available ? "white" : C.creamLight, cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.7 }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: app.color }} />
                <div style={{ ...hubStyles.appIcon, background: app.color + "1F" }}>
                  <Icon size={32} color={app.color} strokeWidth={1.8} />
                </div>
                <h3 style={{ ...hubStyles.appTitle, color: app.color }}>{app.title}</h3>
                <p style={hubStyles.appDesc}>{app.desc}</p>
                <div style={hubStyles.appFooter}>
                  {available ? (
                    <span style={{ ...hubStyles.appBadge, background: C.verde + "22", color: C.verde }}><Check size={12} /> Disponível</span>
                  ) : (
                    <span style={{ ...hubStyles.appBadge, background: C.amarelo + "30", color: "#a47e1c" }}><Clock size={12} /> Em desenvolvimento</span>
                  )}
                  {available && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: app.color, fontSize: 13, fontWeight: 700 }}>Acessar <ArrowRight size={14} /></span>
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

// ============================================================
// TEAM MANAGER (mantido igual ao seu)
// ============================================================
function TeamManager({ user, onLogout, onHub }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      showToast("Erro ao carregar equipe: " + error.message, "error");
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleCreate = async (newUserData) => {
    try {
      await callEdgeFunction("admin-create-user", newUserData);
      showToast("Funcionário cadastrado com sucesso!");
      setShowCreateModal(false);
      await loadProfiles();
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const handleUpdate = async (userId, updates) => {
    try {
      await callEdgeFunction("admin-update-user", { userId, ...updates });
      showToast("Funcionário atualizado!");
      setEditingProfile(null);
      await loadProfiles();
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Remover acesso de ${userName}?\n\nEssa ação é IRREVERSÍVEL. A pessoa não conseguirá mais fazer login.`)) return;
    try {
      await callEdgeFunction("admin-delete-user", { userId });
      showToast("Acesso removido");
      await loadProfiles();
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const filtered = profiles.filter(p => {
    const m = (p.name + " " + p.email).toLowerCase().includes(search.toLowerCase());
    const r = filterRole === "all" || p.role === filterRole;
    return m && r;
  });

  const stats = {
    total: profiles.length,
    admin: profiles.filter(p => p.role === "admin").length,
    bibliotecario: profiles.filter(p => p.role === "bibliotecario").length,
    terapeuta: profiles.filter(p => p.role === "terapeuta").length,
    leitor: profiles.filter(p => p.role === "leitor").length,
  };

  return (
    <div style={teamStyles.page}>
      <header style={hubStyles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onHub} style={placeholderStyles.backBtn}>← Hub</button>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 36, height: 36, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.laranja, fontWeight: 700 }}>GESTÃO</div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, color: C.azul }}>Equipe</div>
          </div>
        </div>
        <button onClick={onLogout} style={hubStyles.logoutBtn}><LogOut size={14} /> Sair</button>
      </header>

      <main style={teamStyles.main}>
        <div style={teamStyles.statsGrid}>
          <StatMini label="Total" value={stats.total} icon={Users} color={C.azul} />
          <StatMini label="Administradores" value={stats.admin} icon={Crown} color={C.laranja} />
          <StatMini label="Bibliotecários" value={stats.bibliotecario} icon={BookOpen} color={C.azul} />
          <StatMini label="Terapeutas" value={stats.terapeuta} icon={Brain} color={C.rosa} />
          <StatMini label="Leitores" value={stats.leitor} icon={EyeIcon} color={C.verde} />
        </div>

        <div style={teamStyles.toolbar}>
          <div style={teamStyles.searchBox}>
            <Search size={15} color={C.muted} />
            <input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={teamStyles.searchInput}
            />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={teamStyles.select}>
            <option value="all">Todas funções</option>
            <option value="admin">Administradores</option>
            <option value="bibliotecario">Bibliotecários</option>
            <option value="terapeuta">Terapeutas</option>
            <option value="leitor">Leitores</option>
          </select>
          <button onClick={() => setShowCreateModal(true)} style={teamStyles.btnPrimary}>
            <UserPlus size={14} /> Novo Funcionário
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: C.muted }}>Carregando equipe...</div>
        ) : filtered.length === 0 ? (
          <div style={teamStyles.emptyState}>
            <div style={teamStyles.emptyIcon}>
              <Users size={32} color={C.azul} strokeWidth={1.6} />
            </div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, marginTop: 14 }}>
              {profiles.length === 0 ? "Nenhum funcionário cadastrado" : "Nenhum resultado"}
            </div>
            <div style={{ color: C.muted, marginTop: 5, fontSize: 13 }}>
              {profiles.length === 0 ? "Clique em 'Novo Funcionário' para começar." : "Tente outro filtro ou busca."}
            </div>
          </div>
        ) : (
          <div style={teamStyles.cardsGrid}>
            {filtered.map(p => (
              <TeamMemberCard
                key={p.id}
                profile={p}
                currentUserId={user.id}
                onEdit={() => setEditingProfile(p)}
                onDelete={() => handleDelete(p.id, p.name)}
              />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <UserFormModal
          title="Novo Funcionário"
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
          mode="create"
        />
      )}

      {editingProfile && (
        <UserFormModal
          title={`Editar ${editingProfile.name}`}
          initial={editingProfile}
          onClose={() => setEditingProfile(null)}
          onSave={(data) => handleUpdate(editingProfile.id, data)}
          mode="edit"
        />
      )}

      {toast && (
        <div style={{ ...acervoStyles.toast, background: toast.type === "error" ? C.rosa : C.verde }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, icon: Icon, color }) {
  return (
    <div style={teamStyles.statCard}>
      <div style={{ ...teamStyles.statIcon, background: color + "1A" }}>
        <Icon size={16} color={color} strokeWidth={2.2} />
      </div>
      <div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 800, lineHeight: 1, color: C.texto }}>{value}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function TeamMemberCard({ profile, currentUserId, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const RoleIcon = ROLE_ICONS[profile.role] || User;
  const color = ROLE_COLORS[profile.role] || C.muted;
  const isYou = profile.id === currentUserId;

  const userApps = (profile.apps || []).map(appId => AVAILABLE_APPS.find(a => a.id === appId)).filter(Boolean);

  return (
    <div style={teamStyles.memberCard}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: color }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ ...hubStyles.avatar, background: color, width: 48, height: 48, fontSize: 18 }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <h3 style={teamStyles.memberName}>{profile.name}</h3>
            {isYou && (
              <span style={{ fontSize: 9, padding: "2px 6px", background: C.amarelo + "30", color: "#a47e1c", borderRadius: 100, fontWeight: 700, textTransform: "uppercase" }}>
                VOCÊ
              </span>
            )}
          </div>
          <div style={teamStyles.memberEmail}>{profile.email}</div>
        </div>

        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={teamStyles.menuBtn}>
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 5 }} />
              <div style={teamStyles.menuDropdown}>
                <button onClick={() => { setMenuOpen(false); onEdit(); }} style={teamStyles.menuItem}>
                  <Edit3 size={13} /> Editar
                </button>
                {!isYou && (
                  <button onClick={() => { setMenuOpen(false); onDelete(); }} style={{ ...teamStyles.menuItem, color: C.rosa }}>
                    <Trash2 size={13} /> Remover acesso
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={teamStyles.memberInfo}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RoleIcon size={13} color={color} strokeWidth={2.2} />
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{ROLE_LABELS[profile.role]}</span>
        </div>
      </div>

      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 6, letterSpacing: 0.5 }}>Aplicativos</div>
        {userApps.length === 0 ? (
          <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Sem acesso</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {userApps.map(app => {
              const Icon = app.icon;
              return (
                <span key={app.id} style={{ ...teamStyles.appTag, background: app.color + "15", color: app.color }}>
                  <Icon size={10} strokeWidth={2.2} /> {app.label.split(" ")[0]}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function UserFormModal({ title, initial, onClose, onSave, mode }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    email: initial?.email || "",
    password: "",
    role: initial?.role || "leitor",
    apps: initial?.apps || ["acervo"],
  });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleApp = (appId) => {
    setForm(f => ({
      ...f,
      apps: f.apps.includes(appId) ? f.apps.filter(a => a !== appId) : [...f.apps, appId],
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) { setError("Nome é obrigatório"); return; }
    if (mode === "create" && !form.email.trim()) { setError("E-mail é obrigatório"); return; }
    if (mode === "create" && form.password.length < 12) { setError("Senha deve ter pelo menos 12 caracteres"); return; }

    setSaving(true);
    try {
      const payload = mode === "create" ? {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        apps: form.apps,
      } : {
        name: form.name,
        role: form.role,
        apps: form.apps,
      };
      await onSave(payload);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div style={acervoStyles.modalBackdrop} onClick={onClose}>
      <div style={acervoStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={acervoStyles.modalHeader}>
          <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, margin: 0, color: C.azul }}>{title}</h3>
          <button onClick={onClose} style={acervoStyles.iconBtn}><X size={16} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={teamStyles.formLabel}>Nome completo *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={teamStyles.formInput}
              placeholder="Maria Silva"
            />
          </div>

          {mode === "create" && (
            <>
              <div>
                <label style={teamStyles.formLabel}>E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={teamStyles.formInput}
                  placeholder="maria@cienah.com.br"
                />
              </div>

              <div>
                <label style={teamStyles.formLabel}>Senha temporária *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ ...teamStyles.formInput, paddingRight: 44 }}
                    placeholder="Min. 12 chars, com maiúsc, número e símbolo"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={loginStyles.eyeBtn}>
                    {showPwd ? <EyeOff size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                  ⚠️ Anote essa senha. A pessoa não receberá email automático.
                </div>
              </div>
            </>
          )}

          <div>
            <label style={teamStyles.formLabel}>Função</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.keys(ROLE_LABELS).map(role => {
                const Icon = ROLE_ICONS[role];
                const color = ROLE_COLORS[role];
                const selected = form.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    style={{
                      ...teamStyles.roleBtn,
                      border: selected ? `2px solid ${color}` : `2px solid ${C.borderSoft}`,
                      background: selected ? color + "10" : "white",
                    }}
                  >
                    <Icon size={14} color={color} strokeWidth={2.2} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: selected ? color : C.texto }}>
                      {ROLE_LABELS[role]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={teamStyles.formLabel}>Aplicativos com acesso</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {AVAILABLE_APPS.map(app => {
                const Icon = app.icon;
                const selected = form.apps.includes(app.id);
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => toggleApp(app.id)}
                    style={{
                      ...teamStyles.appBtn,
                      border: selected ? `2px solid ${app.color}` : `2px solid ${C.borderSoft}`,
                      background: selected ? app.color + "10" : "white",
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? app.color : C.border}`, background: selected ? app.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selected && <Check size={11} color="white" strokeWidth={3} />}
                    </div>
                    <Icon size={16} color={app.color} strokeWidth={2} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.texto, textAlign: "left", flex: 1 }}>{app.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div style={loginStyles.error}><AlertCircle size={14} /> {error}</div>
          )}
        </div>

        <div style={acervoStyles.modalActions}>
          <button onClick={onClose} style={acervoStyles.btnGhost} disabled={saving}>Cancelar</button>
          <button onClick={handleSubmit} style={acervoStyles.btnPrimary} disabled={saving}>
            {saving ? "Salvando..." : <><Check size={13} /> {mode === "create" ? "Criar funcionário" : "Salvar alterações"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PLACEHOLDER + NO ACCESS
// ============================================================
function PlaceholderApp({ app, user, onLogout, onHub }) {
  const config = {
    aba: { title: "CIENAH ABA", icon: Brain, color: C.rosa, desc: "Sistema de aplicação e registro de programas de Análise do Comportamento Aplicada", funcs: ["Cadastro de programas e habilidades-alvo", "Registro de tentativas e taxas de acerto", "Gráficos de evolução por paciente", "Compartilhamento com a equipe"] },
    laudos: { title: "Produção de Laudos", icon: FileCheck, color: C.verde, desc: "Plataforma para elaboração de PAC (Plano de Atendimento Clínico) e AVN (Avaliação Neuropsicológica)", funcs: ["Templates de PAC personalizáveis", "Estrutura padrão para AVN", "Banco de testes e protocolos", "Exportação em PDF assinado"] },
  };
  const { title, icon: Icon, color, desc, funcs } = config[app];

  return (
    <div style={placeholderStyles.page}>
      <header style={hubStyles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onHub} style={placeholderStyles.backBtn}>← Hub</button>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 36, height: 36, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color, fontWeight: 700 }}>APLICATIVO</div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, color: C.azul }}>{title}</div>
          </div>
        </div>
        <button onClick={onLogout} style={hubStyles.logoutBtn}><LogOut size={14} /> Sair</button>
      </header>

      <main style={{ ...hubStyles.main, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 100px)" }}>
        <div style={placeholderStyles.box}>
          <div style={{ ...placeholderStyles.icon, background: color + "15" }}>
            <Icon size={56} color={color} strokeWidth={1.6} />
          </div>
          <h1 style={placeholderStyles.h1}>{title}</h1>
          <p style={placeholderStyles.sub}>{desc}</p>
          <div style={{ ...placeholderStyles.badge, background: C.amarelo + "30", color: "#a47e1c" }}>
            <Sparkles size={14} /> Em desenvolvimento
          </div>
          <div style={{ marginTop: 32, padding: 24, background: C.creamLight, borderRadius: 12, textAlign: "left", maxWidth: 500 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.azul, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Funcionalidades planejadas</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, color: C.texto }}>
              {funcs.map((f, i) => <div key={i}>✓ {f}</div>)}
            </div>
          </div>
          <button onClick={onHub} style={{ marginTop: 24, background: color, color: "white", border: "none", padding: "10px 20px", borderRadius: 100, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>← Voltar ao Hub</button>
        </div>
      </main>
    </div>
  );
}

function NoAccess({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.offWhite, padding: 20 }}>
      <div style={{ textAlign: "center", background: "white", padding: 40, borderRadius: 16, maxWidth: 420 }}>
        <Shield size={48} color={C.rosa} style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 24, color: C.azul, marginBottom: 8 }}>Acesso negado</h2>
        <p style={{ color: C.textoSuave, fontSize: 14, marginBottom: 24 }}>Você não tem permissão para acessar este aplicativo.</p>
        <button onClick={onBack} style={{ background: C.azul, color: "white", border: "none", padding: "10px 20px", borderRadius: 100, cursor: "pointer", fontWeight: 700 }}>← Voltar</button>
      </div>
    </div>
  );
}
// ============================================================
// APP DO ACERVO — MIGRADO PARA SUPABASE
// ============================================================
function AcervoApp({ user, onLogout, onHub }) {
  const [scope, setScope] = useState("public"); // visual apenas - sempre carrega do Supabase
  const [data, setData] = useState({ items: [], users: [], loans: [], reservations: [] });
  const [view, setView] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const perms = ROLE_PERMISSIONS[user.role];

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  // ============================================================
  // CARREGA TUDO DO SUPABASE
  // ============================================================
  const loadAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, readersRes, loansRes, reservationsRes] = await Promise.all([
        supabase.from("items").select("*").order("created_at", { ascending: false }),
        supabase.from("readers").select("*").order("created_at", { ascending: false }),
        supabase.from("loans").select("*").order("created_at", { ascending: false }),
        supabase.from("reservations").select("*").order("created_at", { ascending: false }),
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (readersRes.error) throw readersRes.error;
      if (loansRes.error) throw loansRes.error;
      if (reservationsRes.error) throw reservationsRes.error;

      setData({
        items: (itemsRes.data || []).map(itemFromDb),
        users: (readersRes.data || []).map(readerFromDb),
        loans: (loansRes.data || []).map(loanFromDb),
        reservations: (reservationsRes.data || []).map(reservationFromDb),
      });
    } catch (err) {
      console.error("Erro ao carregar:", err);
      showToast("Erro ao carregar dados: " + err.message, "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ============================================================
  // ITEMS — CRUD via Supabase
  // ============================================================
  const addItem = async (item) => {
    try {
      const { data: inserted, error } = await supabase
        .from("items")
        .insert([{
          code: item.code || null,
          title: item.title,
          type: item.type || "other",
          author: item.author || "",
          year: item.year ? parseInt(item.year) : null,
          publisher: item.publisher || "",
          location: item.location || "",
          quantity: item.quantity || 1,
          pieces: item.pieces || "",
          notes: item.notes || "",
          tags: item.tags || [],
          available: item.available !== false,
        }])
        .select()
        .single();
      if (error) throw error;
      setData(d => ({ ...d, items: [itemFromDb(inserted), ...d.items] }));
      showToast("Item catalogado");
    } catch (err) {
      showToast("Erro ao catalogar: " + err.message, "error");
    }
  };

  const updateItem = async (id, patch) => {
    try {
      const dbPatch = {};
      if (patch.code !== undefined) dbPatch.code = patch.code;
      if (patch.title !== undefined) dbPatch.title = patch.title;
      if (patch.type !== undefined) dbPatch.type = patch.type;
      if (patch.author !== undefined) dbPatch.author = patch.author;
      if (patch.year !== undefined) dbPatch.year = patch.year ? parseInt(patch.year) : null;
      if (patch.publisher !== undefined) dbPatch.publisher = patch.publisher;
      if (patch.location !== undefined) dbPatch.location = patch.location;
      if (patch.quantity !== undefined) dbPatch.quantity = patch.quantity;
      if (patch.pieces !== undefined) dbPatch.pieces = patch.pieces;
      if (patch.notes !== undefined) dbPatch.notes = patch.notes;
      if (patch.tags !== undefined) dbPatch.tags = patch.tags;
      if (patch.available !== undefined) dbPatch.available = patch.available;
      if (patch.completed !== undefined) dbPatch.completed = patch.completed;

      const { data: updated, error } = await supabase
        .from("items").update(dbPatch).eq("id", id).select().single();
      if (error) throw error;
      setData(d => ({ ...d, items: d.items.map(i => i.id === id ? itemFromDb(updated) : i) }));
    } catch (err) {
      showToast("Erro ao atualizar: " + err.message, "error");
    }
  };

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;
      setData(d => ({
        ...d,
        items: d.items.filter(i => i.id !== id),
        loans: d.loans.filter(l => l.itemId !== id),
        reservations: d.reservations.filter(r => r.itemId !== id),
      }));
      showToast("Item removido");
    } catch (err) {
      showToast("Erro ao remover: " + err.message, "error");
    }
  };

  // ============================================================
  // READERS (LEITORES) — CRUD via Supabase
  // ============================================================
  const addUser = async (u) => {
    try {
      const { data: inserted, error } = await supabase
        .from("readers")
        .insert([{
          name: u.name,
          email: u.email || "",
          phone: u.phone || "",
          category: u.role || "Aluno",
        }])
        .select().single();
      if (error) throw error;
      setData(d => ({ ...d, users: [readerFromDb(inserted), ...d.users] }));
      showToast("Leitor cadastrado");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const deleteUser = async (id) => {
    try {
      const { error } = await supabase.from("readers").delete().eq("id", id);
      if (error) throw error;
      setData(d => ({ ...d, users: d.users.filter(u => u.id !== id) }));
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  // ============================================================
  // LOANS (EMPRÉSTIMOS) — CRUD via Supabase
  // ============================================================
  const createLoan = async (itemId, userId, days = 14) => {
    try {
      const { data: inserted, error } = await supabase
        .from("loans")
        .insert([{
          item_id: itemId,
          reader_id: userId,
          loan_date: today(),
          due_date: addDays(today(), days),
          registered_by: user.name,
        }])
        .select().single();
      if (error) throw error;
      setData(d => ({ ...d, loans: [loanFromDb(inserted), ...d.loans] }));
      showToast("Empréstimo registrado");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const returnLoan = async (id) => {
    try {
      const { data: updated, error } = await supabase
        .from("loans").update({ return_date: today() }).eq("id", id).select().single();
      if (error) throw error;
      setData(d => ({ ...d, loans: d.loans.map(l => l.id === id ? loanFromDb(updated) : l) }));
      showToast("Devolução confirmada");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  // ============================================================
  // RESERVATIONS (RESERVAS) — CRUD via Supabase
  // ============================================================
  const createReservation = async (itemId, userId) => {
    try {
      const { data: inserted, error } = await supabase
        .from("reservations")
        .insert([{ item_id: itemId, reader_id: userId, reservation_date: today(), status: "ativa" }])
        .select().single();
      if (error) throw error;
      setData(d => ({ ...d, reservations: [reservationFromDb(inserted), ...d.reservations] }));
      showToast("Reserva criada");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const cancelReservation = async (id) => {
    try {
      const { error } = await supabase.from("reservations").delete().eq("id", id);
      if (error) throw error;
      setData(d => ({ ...d, reservations: d.reservations.filter(r => r.id !== id) }));
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  // ============================================================
  // EXPORT / IMPORT — agora trabalham com Supabase
  // ============================================================
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `acervo-cienah-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exportado");
  };

  const importJSON = (file) => {
    if (!perms.canEdit) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const itemsToImport = parsed.items || [];
        if (itemsToImport.length === 0) {
          showToast("Arquivo sem itens válidos", "error");
          return;
        }

        showToast(`Importando ${itemsToImport.length} itens...`);

        // Importa em lotes de 50 pra não sobrecarregar a API
        const batchSize = 50;
        let imported = 0;
        for (let i = 0; i < itemsToImport.length; i += batchSize) {
          const batch = itemsToImport.slice(i, i + batchSize).map(it => ({
            code: it.code || null,
            title: it.title,
            type: it.type || "other",
            author: it.author || "",
            year: it.year ? parseInt(it.year) : null,
            publisher: it.publisher || "",
            location: it.location || "",
            quantity: it.quantity || 1,
            pieces: it.pieces || "",
            notes: it.notes || "",
            tags: it.tags || [],
            available: it.available !== false,
          }));
          const { error } = await supabase.from("items").insert(batch);
          if (error) {
            console.error("Erro no lote:", error);
            showToast(`Erro no lote ${i / batchSize + 1}: ${error.message}`, "error");
            break;
          }
          imported += batch.length;
        }

        showToast(`${imported} itens importados!`);
        await loadAll(); // recarrega tudo
      } catch (err) {
        console.error(err);
        showToast("Arquivo inválido: " + err.message, "error");
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.offWhite }}>
        <div style={{ textAlign: "center" }}>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 64, height: 64, objectFit: "contain" }} />
          <div style={{ marginTop: 16, fontSize: 14, color: C.azul, fontWeight: 600 }}>Carregando acervo...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={acervoStyles.app}>
      <Sidebar view={view} setView={setView} scope={scope} setScope={setScope} user={user} onHub={onHub} onLogout={onLogout} />
      <main style={acervoStyles.main}>
        <Header data={data} scope={scope} onExport={exportJSON} onImport={importJSON} view={view} perms={perms} />
        {view === "dashboard" && <Dashboard data={data} setView={setView} />}
        {view === "catalog" && <Catalog data={data} perms={perms} onAdd={addItem} onUpdate={updateItem} onDelete={deleteItem} onLoan={createLoan} onReserve={createReservation} />}
        {view === "users" && <UsersView data={data} perms={perms} onAdd={addUser} onDelete={deleteUser} />}
        {view === "loans" && <LoansView data={data} perms={perms} onReturn={returnLoan} onCancelReservation={cancelReservation} />}
        {view === "reports" && <Reports data={data} />}
        {view === "barcode" && <BarcodeView data={data} />}
      </main>
      {toast && (
        <div style={{ ...acervoStyles.toast, background: toast.type === "error" ? C.rosa : C.azul }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SIDEBAR, HEADER, DASHBOARD, CATALOG (mantidos iguais)
// ============================================================
function Sidebar({ view, setView, scope, setScope, user, onHub, onLogout }) {
  const items = [
    { id: "dashboard", label: "Painel", icon: BarChart3 },
    { id: "catalog", label: "Acervo", icon: BookOpen },
    { id: "users", label: "Leitores", icon: Users },
    { id: "loans", label: "Circulação", icon: Clock },
    { id: "barcode", label: "Códigos", icon: Hash },
    { id: "reports", label: "Relatórios", icon: FileText },
  ];
  return (
    <aside style={acervoStyles.sidebar}>
      <PatternBg opacity={0.04} dark />
      <div style={acervoStyles.brand}>
        <div style={acervoStyles.brandMark}>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 38, height: 38, objectFit: "contain" }} />
        </div>
        <div>
          <div style={acervoStyles.brandTitle}>Acervo</div>
          <div style={acervoStyles.brandSub}>CIENAH</div>
        </div>
      </div>
      <nav style={{ marginTop: 24, position: "relative", zIndex: 1 }}>
        {items.map(it => {
          const Icon = it.icon;
          const active = view === it.id;
          return (
            <button key={it.id} onClick={() => setView(it.id)} style={{ ...acervoStyles.navItem, ...(active ? acervoStyles.navItemActive : {}) }}>
              <Icon size={17} strokeWidth={2} />
              <span>{it.label}</span>
              {active && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
            </button>
          );
        })}
      </nav>
      <div style={acervoStyles.bottomBox}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: "rgba(245,241,232,0.6)", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Coleção</div>
        <div style={acervoStyles.scopeToggle}>
          <button onClick={() => setScope("public")} style={{ ...acervoStyles.scopeBtn, ...acervoStyles.scopeBtnActive }}>
            <Globe size={11} /> Equipe (compartilhada)
          </button>
        </div>
        <div style={acervoStyles.userBox}>
          <div style={{ ...acervoStyles.avatar, background: C.laranja, width: 32, height: 32, fontSize: 13 }}>{user.name.charAt(0)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.cream, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ fontSize: 10, color: "rgba(245,241,232,0.6)" }}>{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          <button onClick={onHub} style={acervoStyles.miniBtn} title="Hub"><Library size={12} /></button>
          <button onClick={onLogout} style={acervoStyles.miniBtn} title="Sair"><LogOut size={12} /></button>
        </div>
      </div>
    </aside>
  );
}

function Header({ data, scope, onExport, onImport, view, perms }) {
  const inputRef = useRef();
  const titles = {
    dashboard: { kicker: "Visão geral", title: "Painel do Acervo" },
    catalog: { kicker: "Catalogação", title: "Acervo Bibliográfico" },
    users: { kicker: "Cadastros", title: "Leitores" },
    loans: { kicker: "Movimentação", title: "Circulação" },
    barcode: { kicker: "Etiquetas", title: "Códigos de Barras" },
    reports: { kicker: "Análise", title: "Relatórios" },
  };
  const t = titles[view] || titles.dashboard;
  return (
    <header style={acervoStyles.header}>
      <div>
        <div style={acervoStyles.headerKicker}>
          <Sparkles size={11} /> {t.kicker} · Equipe
        </div>
        <h1 style={acervoStyles.headerTitle}>{t.title}</h1>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {perms.canEdit && (
          <>
            <button style={acervoStyles.btnGhost} onClick={() => inputRef.current?.click()}>
              <Upload size={14} /> Importar
            </button>
            <input ref={inputRef} type="file" accept=".json" hidden onChange={(e) => e.target.files[0] && onImport(e.target.files[0])} />
          </>
        )}
        <button style={acervoStyles.btnGhost} onClick={onExport}><Download size={14} /> Exportar</button>
      </div>
    </header>
  );
}

function Dashboard({ data, setView }) {
  const activeLoans = data.loans.filter(l => !l.returnDate);
  const overdue = activeLoans.filter(l => l.dueDate < today());
  const byType = MEDIA_TYPES.map(t => ({ ...t, count: data.items.filter(i => i.type === t.id).length }));

  return (
    <div style={{ padding: "28px 36px" }}>
      <div style={acervoStyles.statsGrid}>
        <StatCard label="Itens no acervo" value={data.items.length} icon={BookOpen} accent={C.azul} />
        <StatCard label="Leitores ativos" value={data.users.length} icon={Users} accent={C.verde} />
        <StatCard label="Empréstimos ativos" value={activeLoans.length} icon={Clock} accent={C.laranja} />
        <StatCard label="Em atraso" value={overdue.length} icon={AlertCircle} accent={C.rosa} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 24 }}>
        <Panel title="Distribuição do acervo" subtitle="Por tipo de mídia">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            {byType.map(t => {
              const Icon = t.icon;
              const total = data.items.length || 1;
              const pct = (t.count / total) * 100;
              return (
                <div key={t.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 600 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: t.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={13} color={t.color} strokeWidth={2.2} />
                      </div>
                      {t.label}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{t.count} {t.count === 1 ? "item" : "itens"}</div>
                  </div>
                  <div style={acervoStyles.barTrack}>
                    <div style={{ ...acervoStyles.barFill, width: `${pct}%`, background: t.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Atalhos" subtitle="Tarefas frequentes">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            <QuickAction label="Catalogar item" icon={Plus} onClick={() => setView("catalog")} color={C.azul} />
            <QuickAction label="Cadastrar leitor" icon={User} onClick={() => setView("users")} color={C.verde} />
            <QuickAction label="Ver empréstimos" icon={Clock} onClick={() => setView("loans")} color={C.laranja} />
            <QuickAction label="Relatórios" icon={FileText} onClick={() => setView("reports")} color={C.rosa} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div style={acervoStyles.statCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ ...acervoStyles.statIcon, background: accent + "1A" }}>
          <Icon size={18} color={accent} strokeWidth={2.2} />
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />
      </div>
      <div style={acervoStyles.statValue}>{value}</div>
      <div style={acervoStyles.statLabel}>{label}</div>
    </div>
  );
}

function Panel({ title, subtitle, children, style }) {
  return (
    <section style={{ ...acervoStyles.panel, ...style }}>
      <div style={{ borderBottom: `1px solid ${C.borderSoft}`, paddingBottom: 12 }}>
        <div style={acervoStyles.panelKicker}>{subtitle}</div>
        <div style={acervoStyles.panelTitle}>{title}</div>
      </div>
      {children}
    </section>
  );
}

function QuickAction({ label, icon: Icon, onClick, color }) {
  return (
    <button onClick={onClick} style={acervoStyles.quickAction}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: color + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} color={color} strokeWidth={2.2} />
      </div>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
      <ChevronRight size={13} style={{ marginLeft: "auto", color: C.muted }} />
    </button>
  );
}

function Catalog({ data, perms, onAdd, onUpdate, onDelete, onLoan, onReserve }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showLoanFor, setShowLoanFor] = useState(null);

  const filtered = data.items.filter(i => {
    const m = (i.title + " " + (i.author || "") + " " + (i.code || "")).toLowerCase().includes(search.toLowerCase());
    const t = filterType === "all" || i.type === filterType;
    return m && t;
  });
  const isLoanedOut = (id) => data.loans.some(l => l.itemId === id && !l.returnDate);

  return (
    <div style={{ padding: "28px 36px" }}>
      <div style={acervoStyles.toolbar}>
        <div style={acervoStyles.searchBox}>
          <Search size={15} color={C.muted} />
          <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} style={acervoStyles.searchInput} />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={acervoStyles.select}>
          <option value="all">Todas mídias</option>
          {MEDIA_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        {perms.canEdit && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} style={acervoStyles.btnPrimary}>
            <Plus size={14} /> Catalogar
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Acervo vazio" msg={perms.canEdit ? "Comece catalogando o primeiro item." : "Aguarde o bibliotecário."} />
      ) : (
        <div style={acervoStyles.itemsGrid}>
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} perms={perms} loaned={isLoanedOut(item.id)}
              onEdit={() => { setEditing(item); setShowForm(true); }}
              onDelete={() => { if (window.confirm(`Remover "${item.title}"?`)) onDelete(item.id); }}
              onLoan={() => setShowLoanFor(item)}
              onToggleComplete={() => onUpdate(item.id, { completed: !item.completed })}
            />
          ))}
        </div>
      )}
      {showForm && perms.canEdit && (
        <ItemForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={(it) => { editing ? onUpdate(editing.id, it) : onAdd(it); setShowForm(false); setEditing(null); }}
        />
      )}
      {showLoanFor && (
        <LoanModal item={showLoanFor} users={data.users} onClose={() => setShowLoanFor(null)}
          onLoan={(userId, days) => { onLoan(showLoanFor.id, userId, days); setShowLoanFor(null); }}
          onReserve={(userId) => { onReserve(showLoanFor.id, userId); setShowLoanFor(null); }}
          isLoaned={isLoanedOut(showLoanFor.id)}
        />
      )}
    </div>
  );
}

function ItemCard({ item, perms, loaned, onEdit, onDelete, onLoan, onToggleComplete }) {
  const m = mediaInfo(item.type);
  const Icon = m.icon;
  return (
    <article style={acervoStyles.itemCard}>
      <div style={{ ...acervoStyles.itemTop, background: `linear-gradient(135deg, ${m.color}15, ${m.color}05)` }}>
        <div style={{ ...acervoStyles.itemTypeChip, background: m.color }}>
          <Icon size={11} strokeWidth={2.2} /> {m.label}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {loaned && <span style={{ ...acervoStyles.statusPill, background: C.laranja + "22", color: C.laranja }}>Emprestado</span>}
          {item.completed && <span style={{ ...acervoStyles.statusPill, background: C.verde + "22", color: C.verde }}>✓</span>}
        </div>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={acervoStyles.itemTitle}>{item.title}</h3>
        {item.author && <div style={acervoStyles.itemAuthor}>{item.author}</div>}
        <div style={acervoStyles.itemMeta}>
          {item.year && <span>{item.year}</span>}
          {item.publisher && <span>{item.year ? " · " : ""}{item.publisher}</span>}
          {item.location && <span>{(item.year || item.publisher) ? " · " : ""}📍 {item.location}</span>}
        </div>
        {item.code && <div style={acervoStyles.itemCode}><Hash size={10} /> {item.code}</div>}
        {item.notes && <div style={acervoStyles.itemNotes}>"{item.notes}"</div>}
        {item.tags?.length > 0 && (
          <div style={acervoStyles.tagRow}>
            {item.tags.map(t => <span key={t} style={acervoStyles.tag}>{t}</span>)}
          </div>
        )}
        <div style={acervoStyles.itemActions}>
          {perms.canLoan && (
            <button onClick={onLoan} style={{ ...acervoStyles.itemBtn, background: m.color }}>
              <Clock size={12} /> {loaned ? "Reservar" : "Emprestar"}
            </button>
          )}
          {perms.canEdit && (
            <>
              <button onClick={onToggleComplete} style={acervoStyles.itemBtnGhost}><Check size={12} /></button>
              <button onClick={onEdit} style={acervoStyles.itemBtnGhost}><Edit3 size={12} /></button>
            </>
          )}
          {perms.canDelete && (
            <button onClick={onDelete} style={{ ...acervoStyles.itemBtnGhost, color: C.rosa }}><Trash2 size={12} /></button>
          )}
        </div>
      </div>
    </article>
  );
}

function ItemForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { type: "book", title: "", author: "", year: "", publisher: "", code: "", location: "", notes: "", tags: [], completed: false });
  const [tagInput, setTagInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const scanCode = async () => {
    if (!form.code.trim()) { alert("Digite um ISBN primeiro"); return; }
    setScanning(true);
    const meta = await fetchMetadata(form.code.replace(/[-\s]/g, ""));
    setScanning(false);
    if (meta) setForm(f => ({ ...f, ...meta }));
    else alert("ISBN não encontrado.");
  };
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <Modal onClose={onClose} title={initial ? "Editar item" : "Catalogar novo item"}>
      <div style={acervoStyles.formGrid}>
        <Field label="Tipo de mídia">
          <select value={form.type} onChange={(e) => set("type", e.target.value)} style={acervoStyles.input}>
            {MEDIA_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="ISBN / Código">
          <div style={{ display: "flex", gap: 6 }}>
            <input value={form.code} onChange={(e) => set("code", e.target.value)} style={acervoStyles.input} placeholder="9788535914849" />
            <button onClick={scanCode} type="button" style={acervoStyles.btnGhost} disabled={scanning}>
              <Scan size={13} /> {scanning ? "..." : "Buscar"}
            </button>
          </div>
        </Field>
        <Field label="Título *" full>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} style={acervoStyles.input} />
        </Field>
        <Field label="Autor">
          <input value={form.author} onChange={(e) => set("author", e.target.value)} style={acervoStyles.input} />
        </Field>
        <Field label="Ano">
          <input type="number" value={form.year} onChange={(e) => set("year", e.target.value)} style={acervoStyles.input} />
        </Field>
        <Field label="Editora" full>
          <input value={form.publisher} onChange={(e) => set("publisher", e.target.value)} style={acervoStyles.input} />
        </Field>
        <Field label="Localização (sala)" full>
          <input value={form.location} onChange={(e) => set("location", e.target.value)} style={acervoStyles.input} placeholder="Ex: Aba Estefanny, Lioneide..." />
        </Field>
        <Field label="Notas" full>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} style={{ ...acervoStyles.input, minHeight: 60, resize: "vertical" }} />
        </Field>
        <Field label="Tags" full>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} style={acervoStyles.input} placeholder="Enter para adicionar" />
            <button onClick={addTag} type="button" style={acervoStyles.btnGhost}><Tag size={13} /></button>
          </div>
          {form.tags.length > 0 && (
            <div style={acervoStyles.tagRow}>
              {form.tags.map(t => (
                <span key={t} style={{ ...acervoStyles.tag, cursor: "pointer" }} onClick={() => set("tags", form.tags.filter(x => x !== t))}>
                  {t} <X size={9} />
                </span>
              ))}
            </div>
          )}
        </Field>
      </div>
      <div style={acervoStyles.modalActions}>
        <button onClick={onClose} style={acervoStyles.btnGhost}>Cancelar</button>
        <button onClick={() => form.title.trim() && onSave(form)} style={acervoStyles.btnPrimary} disabled={!form.title.trim()}>
          <Check size={13} /> Salvar
        </button>
      </div>
    </Modal>
  );
}

function LoanModal({ item, users, onClose, onLoan, onReserve, isLoaned }) {
  const [userId, setUserId] = useState(users[0]?.id || "");
  const [days, setDays] = useState(14);
  const m = mediaInfo(item.type);
  return (
    <Modal onClose={onClose} title={isLoaned ? "Reservar item" : "Registrar empréstimo"}>
      <div style={{ marginBottom: 14, padding: 14, background: m.color + "10", borderRadius: 10, border: `1px solid ${m.color}30` }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.texto }}>{item.title}</div>
        {item.author && <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{item.author}</div>}
      </div>
      {users.length === 0 ? (
        <div style={{ textAlign: "center", padding: 16, color: C.muted, fontSize: 13 }}>Cadastre um leitor primeiro.</div>
      ) : (
        <>
          <Field label="Leitor" full>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} style={acervoStyles.input}>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role || "Leitor"}</option>)}
            </select>
          </Field>
          {!isLoaned && (
            <Field label="Prazo (dias)" full>
              <input type="number" value={days} onChange={(e) => setDays(+e.target.value)} style={acervoStyles.input} />
            </Field>
          )}
          <div style={acervoStyles.modalActions}>
            <button onClick={onClose} style={acervoStyles.btnGhost}>Cancelar</button>
            {isLoaned ? (
              <button onClick={() => onReserve(userId)} style={acervoStyles.btnPrimary}>Reservar</button>
            ) : (
              <button onClick={() => onLoan(userId, days)} style={acervoStyles.btnPrimary}>
                <Check size={13} /> Confirmar
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

function UsersView({ data, perms, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = data.users.filter(u => (u.name + " " + (u.email || "")).toLowerCase().includes(search.toLowerCase()));
  const loanCount = (uid) => data.loans.filter(l => l.userId === uid && !l.returnDate).length;

  return (
    <div style={{ padding: "28px 36px" }}>
      <div style={acervoStyles.toolbar}>
        <div style={acervoStyles.searchBox}>
          <Search size={15} color={C.muted} />
          <input placeholder="Buscar leitor..." value={search} onChange={(e) => setSearch(e.target.value)} style={acervoStyles.searchInput} />
        </div>
        {perms.canManageUsers && (
          <button onClick={() => setShowForm(true)} style={acervoStyles.btnPrimary}><Plus size={14} /> Novo leitor</button>
        )}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum leitor" msg="Cadastre leitores para registrar empréstimos." />
      ) : (
        <div style={acervoStyles.usersGrid}>
          {filtered.map((u, idx) => {
            const colors = [C.azul, C.verde, C.laranja, C.rosa, C.amarelo];
            const color = colors[idx % colors.length];
            return (
              <div key={u.id} style={acervoStyles.userCard}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
                <div style={{ ...acervoStyles.avatar, background: color }}>{u.name.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{u.role || "Leitor"} {u.email && `· ${u.email}`}</div>
                  <div style={{ fontSize: 11, marginTop: 5 }}>
                    <span style={{ color, fontWeight: 700 }}>{loanCount(u.id)}</span>
                    <span style={{ color: C.muted }}> empréstimo(s) ativo(s)</span>
                  </div>
                </div>
                {perms.canManageUsers && (
                  <button onClick={() => { if (window.confirm(`Remover ${u.name}?`)) onDelete(u.id); }} style={acervoStyles.itemBtnGhost}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {showForm && <UserForm onClose={() => setShowForm(false)} onSave={(u) => { onAdd(u); setShowForm(false); }} />}
    </div>
  );
}

function UserForm({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", role: "Aluno", phone: "" });
  return (
    <Modal onClose={onClose} title="Novo leitor">
      <div style={acervoStyles.formGrid}>
        <Field label="Nome *" full>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={acervoStyles.input} />
        </Field>
        <Field label="E-mail">
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={acervoStyles.input} />
        </Field>
        <Field label="Telefone">
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={acervoStyles.input} />
        </Field>
        <Field label="Categoria" full>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={acervoStyles.input}>
            <option>Aluno</option><option>Professor</option><option>Funcionário</option><option>Visitante</option><option>Paciente</option><option>Terapeuta</option>
          </select>
        </Field>
      </div>
      <div style={acervoStyles.modalActions}>
        <button onClick={onClose} style={acervoStyles.btnGhost}>Cancelar</button>
        <button onClick={() => form.name.trim() && onSave(form)} style={acervoStyles.btnPrimary} disabled={!form.name.trim()}>
          <Check size={13} /> Cadastrar
        </button>
      </div>
    </Modal>
  );
}

function LoansView({ data, perms, onReturn, onCancelReservation }) {
  const [tab, setTab] = useState("active");
  const active = data.loans.filter(l => !l.returnDate);
  const returned = data.loans.filter(l => l.returnDate);

  const renderRow = (l) => {
    const item = data.items.find(i => i.id === l.itemId);
    const u = data.users.find(u => u.id === l.userId);
    const m = item ? mediaInfo(item.type) : MEDIA_TYPES[0];
    const Icon = m.icon;
    const isOverdue = !l.returnDate && l.dueDate < today();
    return (
      <div key={l.id} style={{ ...acervoStyles.loanRow, borderLeft: `3px solid ${isOverdue ? C.rosa : m.color}` }}>
        <div style={{ ...acervoStyles.loanIcon, background: (isOverdue ? C.rosa : m.color) + "15", color: isOverdue ? C.rosa : m.color }}>
          <Icon size={16} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 2, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item?.title || "—"}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{u?.name}</div>
        </div>
        <div style={{ flex: 1, fontSize: 12 }}>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Empréstimo</div>
          <div style={{ fontWeight: 600 }}>{fmt(l.loanDate)}</div>
        </div>
        <div style={{ flex: 1, fontSize: 12 }}>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Previsto</div>
          <div style={{ color: isOverdue ? C.rosa : C.texto, fontWeight: 600 }}>{fmt(l.dueDate)}</div>
        </div>
        {!l.returnDate && perms.canLoan && (
          <button onClick={() => onReturn(l.id)} style={acervoStyles.btnPrimary}>
            <Check size={12} /> Devolver
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "28px 36px" }}>
      <div style={{ display: "flex", gap: 4, padding: 4, background: C.borderSoft, borderRadius: 8, marginBottom: 20, width: "fit-content", flexWrap: "wrap" }}>
        {[
          { id: "active", label: `Ativos (${active.length})` },
          { id: "returned", label: `Devolvidos (${returned.length})` },
          { id: "reservations", label: `Reservas (${data.reservations.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...acervoStyles.tabBtn, ...(tab === t.id ? acervoStyles.tabBtnActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "active" && (active.length === 0 ? <EmptyState icon={Clock} title="Sem empréstimos" msg="Vá ao acervo e clique em Emprestar." /> : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{active.map(renderRow)}</div>)}
      {tab === "returned" && (returned.length === 0 ? <EmptyState icon={Check} title="Histórico vazio" msg="Empréstimos devolvidos aparecerão aqui." /> : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{returned.map(renderRow)}</div>)}
      {tab === "reservations" && (data.reservations.length === 0 ? <EmptyState icon={Calendar} title="Sem reservas" msg="Reservas aparecerão aqui." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.reservations.map(r => {
            const item = data.items.find(i => i.id === r.itemId);
            const u = data.users.find(u => u.id === r.userId);
            const m = item ? mediaInfo(item.type) : MEDIA_TYPES[0];
            return (
              <div key={r.id} style={{ ...acervoStyles.loanRow, borderLeft: `3px solid ${m.color}` }}>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item?.title}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{u?.name}</div>
                </div>
                <div style={{ flex: 1, fontSize: 12 }}>
                  <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Reservado</div>
                  <div style={{ fontWeight: 600 }}>{fmt(r.date)}</div>
                </div>
                {perms.canLoan && (
                  <button onClick={() => onCancelReservation(r.id)} style={acervoStyles.btnGhost}>
                    <X size={12} /> Cancelar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BarcodeView({ data }) {
  const itemsWithCode = data.items.filter(i => i.code);
  if (itemsWithCode.length === 0) {
    return <div style={{ padding: "28px 36px" }}><EmptyState icon={Hash} title="Sem códigos" msg="Adicione ISBN/UPC aos itens." /></div>;
  }
  const Bar = ({ value }) => {
    const bars = useMemo(() => {
      const seed = String(value || "0000");
      const arr = [];
      for (let i = 0; i < seed.length * 4; i++) arr.push(((seed.charCodeAt(i % seed.length) + i * 7) % 4) + 1);
      return arr;
    }, [value]);
    let x = 0;
    return (
      <svg width="100%" height={42} viewBox={`0 0 ${bars.reduce((a,b)=>a+b+1,0)} 42`} preserveAspectRatio="none">
        {bars.map((w, i) => { const r = <rect key={i} x={x} y={0} width={i % 2 === 0 ? w : 0} height={42} fill={C.azul} />; x += w + 1; return r; })}
      </svg>
    );
  };
  return (
    <div style={{ padding: "28px 36px" }}>
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => window.print()} style={acervoStyles.btnPrimary}>
          <FileText size={13} /> Imprimir etiquetas
        </button>
      </div>
      <div style={acervoStyles.barcodeGrid}>
        {itemsWithCode.map(it => {
          const m = mediaInfo(it.type);
          return (
            <div key={it.id} style={acervoStyles.barcodeLabel}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: m.color }} />
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{it.title}</div>
              {it.author && <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>{it.author}</div>}
              <Bar value={it.code} />
              <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 10, marginTop: 4, letterSpacing: 1 }}>{it.code}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Reports({ data }) {
  const totalItems = data.items.length;
  const totalLoans = data.loans.length;
  const overdue = data.loans.filter(l => !l.returnDate && l.dueDate < today()).length;
  const completed = data.items.filter(i => i.completed).length;

  const topItems = useMemo(() => {
    const counts = {};
    data.loans.forEach(l => { counts[l.itemId] = (counts[l.itemId] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, c]) => ({ item: data.items.find(i => i.id === id), count: c })).filter(x => x.item);
  }, [data]);

  return (
    <div style={{ padding: "28px 36px" }}>
      <div style={acervoStyles.statsGrid}>
        <StatCard label="Total de itens" value={totalItems} icon={BookOpen} accent={C.azul} />
        <StatCard label="Empréstimos totais" value={totalLoans} icon={Clock} accent={C.laranja} />
        <StatCard label="Concluídos" value={completed} icon={Check} accent={C.verde} />
        <StatCard label="Em atraso" value={overdue} icon={AlertCircle} accent={C.rosa} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 24 }}>
        <Panel title="Mais emprestados" subtitle="Top 5 itens">
          {topItems.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 12 }}>Sem dados</div>
            : <div style={{ marginTop: 12 }}>
                {topItems.map(({ item, count }, i) => {
                  const m = mediaInfo(item.type);
                  return (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
                      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 800, color: m.color, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: 10.5, color: C.muted }}>{item.author}</div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontFamily: "'Fredoka', sans-serif" }}>{count}</div>
                    </div>
                  );
                })}
              </div>}
        </Panel>
      </div>
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div style={acervoStyles.modalBackdrop} onClick={onClose}>
      <div style={acervoStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={acervoStyles.modalHeader}>
          <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, margin: 0, color: C.azul }}>{title}</h3>
          <button onClick={onClose} style={acervoStyles.iconBtn}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={acervoStyles.label}>{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, msg }) {
  return (
    <div style={acervoStyles.emptyState}>
      <div style={acervoStyles.emptyIcon}><Icon size={32} strokeWidth={1.6} color={C.azul} /></div>
      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, marginTop: 14 }}>{title}</div>
      <div style={{ color: C.muted, marginTop: 5, fontSize: 12.5, maxWidth: 320, margin: "5px auto 0" }}>{msg}</div>
    </div>
  );
}

function FontAndStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; font-family: 'Inter', sans-serif; }
      input:focus, select:focus, textarea:focus { outline: none; border-color: ${C.azul} !important; box-shadow: 0 0 0 3px ${C.azul}15; }
      button { font-family: inherit; }
      button:hover:not(:disabled) { transform: translateY(-1px); }
      button:disabled { opacity: 0.5; cursor: not-allowed; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: ${C.creamLight}; }
      ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      .mobile-menu-btn { display: none; }
      @media (max-width: 768px) {
        .mobile-menu-btn { display: flex !important; }
        .nav-links { display: none !important; }
        .nav-links.open { display: flex !important; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: ${C.offWhite}; padding: 20px; gap: 14px !important; border-bottom: 1px solid ${C.linha}; }
      }
    `}</style>
  );
}

// ============================================================
// ESTILOS (idênticos ao seu)
// ============================================================
const landingStyles = {
  page: { background: C.offWhite, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.texto, lineHeight: 1.6 },
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "1rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(239, 237, 233, 0.94)", backdropFilter: "blur(14px)", transition: "all 0.3s" },
  navScrolled: { padding: "0.6rem 3rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" },
  logoWrapper: { display: "flex", alignItems: "center", gap: "0.85rem" },
  logoName: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "1.55rem", color: C.laranja, lineHeight: 1 },
  logoSub: { fontSize: "0.6rem", color: C.azul, marginTop: 4, maxWidth: 220, lineHeight: 1.25 },
  mobileMenuBtn: { background: "transparent", border: "none", cursor: "pointer", color: C.azul, padding: 8 },
  navLinks: { display: "flex", gap: "2.2rem", listStyle: "none", margin: 0, padding: 0, alignItems: "center" },
  navLink: { color: C.azul, textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, padding: "0.3rem 0", cursor: "pointer", border: "none", background: "transparent" },
  navCta: { padding: "0.75rem 1.5rem", background: C.laranja, color: "white", border: "none", borderRadius: 100, cursor: "pointer", fontSize: "0.88rem", fontWeight: 500, fontFamily: "'Fredoka', sans-serif" },
  hero: { minHeight: "100vh", padding: "9rem 3rem 5rem", position: "relative", overflow: "hidden" },
  heroGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "4rem", alignItems: "center", maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 2 },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(60px)", zIndex: 0, pointerEvents: "none" },
  blob1: { width: 380, height: 380, background: C.rosa, top: "-8%", right: "8%", opacity: 0.18 },
  blob2: { width: 320, height: 320, background: C.amarelo, bottom: "5%", right: "25%", opacity: 0.25 },
  blob3: { width: 280, height: 280, background: C.verde, top: "30%", right: "-5%", opacity: 0.15 },
  heroTag: { display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.1rem", background: "white", border: `1px solid ${C.linha}`, borderRadius: 100, fontSize: "0.78rem", color: C.azul, marginBottom: "1.8rem", fontWeight: 500 },
  heroDot: { width: 8, height: 8, background: C.verde, borderRadius: "50%" },
  heroH1: { fontFamily: "'Fredoka', sans-serif", fontWeight: 500, fontSize: "clamp(2.6rem, 5.4vw, 4.6rem)", lineHeight: 1.05, marginBottom: "1.5rem", color: C.azul },
  heroSub: { fontSize: "1.1rem", color: C.textoSuave, maxWidth: 540, marginBottom: "2.5rem", lineHeight: 1.7 },
  heroActions: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  btnPrimary: { padding: "1.05rem 2rem", background: C.laranja, color: "white", border: "none", borderRadius: 100, fontWeight: 500, fontFamily: "'Fredoka', sans-serif", display: "inline-flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "1rem", textDecoration: "none" },
  btnSecondary: { padding: "1.05rem 2rem", background: "transparent", color: C.azul, border: `2px solid ${C.azul}`, borderRadius: 100, fontWeight: 500, fontFamily: "'Fredoka', sans-serif", cursor: "pointer", fontSize: "1rem", textDecoration: "none" },
  heroVisual: { display: "flex", justifyContent: "center", alignItems: "center" },
  brainContainer: { filter: "drop-shadow(0 30px 60px rgba(5, 79, 111, 0.15))" },
  secao: { padding: "7rem 3rem", position: "relative" },
  secaoContainer: { maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 2 },
  secaoTag: { display: "inline-block", fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, marginBottom: "1rem", fontFamily: "'Fredoka', sans-serif", padding: "0.4rem 1rem", borderRadius: 100 },
  secaoTitulo: { fontFamily: "'Fredoka', sans-serif", fontWeight: 500, fontSize: "clamp(2.2rem, 4vw, 3.4rem)", lineHeight: 1.05, color: C.azul, maxWidth: 800 },
  lobulosGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem", marginTop: "4rem" },
  lobulo: { padding: "2.8rem 2.2rem", borderRadius: 32, position: "relative", overflow: "hidden" },
  lobuloIcon: { width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" },
  lobuloH3: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: "1.5rem", marginBottom: "1rem", color: C.azul },
  lobuloP: { color: C.textoSuave, fontSize: "0.98rem", lineHeight: 1.7, margin: 0 },
  propositoCard: { maxWidth: 1100, margin: "0 auto", padding: "5rem 4rem", background: "white", borderRadius: 48, textAlign: "center", position: "relative", boxShadow: "0 20px 60px rgba(5, 79, 111, 0.08)", overflow: "hidden" },
  propositoAspas: { fontFamily: "'Fredoka', sans-serif", fontSize: "6rem", color: C.amarelo, lineHeight: 0.5, marginBottom: "1rem", opacity: 0.4 },
  propositoTexto: { fontFamily: "'Fredoka', sans-serif", fontWeight: 400, fontSize: "clamp(1.4rem, 2.5vw, 2rem)", lineHeight: 1.4, color: C.azul, position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" },
  missaoVisao: { background: "white", padding: "7rem 3rem" },
  mvContainer: { maxWidth: 1300, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "1.5rem" },
  mvCard: { padding: "3.5rem 3rem", borderRadius: 40, position: "relative", overflow: "hidden", color: "white", minHeight: 380, display: "flex", flexDirection: "column", justifyContent: "space-between" },
  mvNumero: { fontFamily: "'Fredoka', sans-serif", fontSize: "5rem", fontWeight: 700, lineHeight: 0.8, opacity: 0.25, marginBottom: "1rem", position: "relative", zIndex: 1 },
  mvH3: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: "2.2rem", marginBottom: "1.5rem", position: "relative", zIndex: 1 },
  mvP: { fontSize: "1.05rem", lineHeight: 1.7, opacity: 0.95, position: "relative", zIndex: 1, margin: 0 },
  valoresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "4rem" },
  valorCard: { padding: "1.8rem 1.4rem", borderRadius: 24, background: "white", borderTop: "4px solid", position: "relative" },
  valorIconMini: { width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: "0.85rem" },
  valorH4: { fontFamily: "'Fredoka', sans-serif", fontWeight: 500, fontSize: "1rem", color: C.azul, margin: 0 },
  valorP: { fontSize: "0.82rem", color: C.textoSuave, lineHeight: 1.5, margin: "6px 0 0" },
  espGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.2rem", marginTop: "4rem" },
  espCard: { padding: "2rem 1.6rem", borderRadius: 24, background: C.offWhite, border: "2px solid transparent" },
  espIconBig: { width: 56, height: 56, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem" },
  espH4: { fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: "1.15rem", color: C.azul, margin: 0 },
  espUl: { listStyle: "none", padding: 0, margin: "0.6rem 0 0" },
  espLi: { fontSize: "0.85rem", padding: "0.25rem 0", paddingLeft: "1rem" },
  contatoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, marginTop: 48 },
  contatoItem: { padding: 24, background: "rgba(255,255,255,0.06)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" },
  footer: { padding: "2.5rem 3rem", background: "white", borderTop: `1px solid ${C.linha}` },
};

const loginStyles = {
  page: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", minHeight: "100vh" },
  left: { background: C.azul, color: "white", padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" },
  backBtn: { position: "absolute", top: 24, left: 24, background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px 16px", borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 500 },
  leftContent: { position: "relative", zIndex: 1, maxWidth: 480 },
  leftTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: "2.6rem", fontWeight: 600, color: C.laranja, margin: "1.5rem 0 0.5rem" },
  leftSub: { fontSize: "1.1rem", opacity: 0.85, marginBottom: "2.5rem", lineHeight: 1.6 },
  leftFeatures: { display: "flex", flexDirection: "column", gap: 14 },
  leftFeature: { display: "flex", alignItems: "center", gap: 12, fontSize: 15, opacity: 0.9 },
  right: { display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: C.offWhite },
  formBox: { width: "100%", maxWidth: 420, padding: "2.5rem", background: "white", borderRadius: 24, boxShadow: "0 20px 60px rgba(5, 79, 111, 0.08)" },
  formTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: "1.8rem", fontWeight: 600, color: C.azul, margin: 0 },
  label: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.azul, display: "block", marginBottom: 6, fontWeight: 700 },
  input: { width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: "#fff", fontFamily: "'Inter', sans-serif", color: C.texto },
  eyeBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: C.muted, padding: 4 },
  error: { padding: "10px 14px", background: C.rosa + "15", color: C.rosa, borderRadius: 10, fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 },
  submitBtn: { width: "100%", padding: "14px 20px", background: C.laranja, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Fredoka', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
};

const hubStyles = {
  page: { minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter', sans-serif" },
  header: { padding: "1rem 2.5rem", background: "white", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  headerKicker: { fontSize: 10, letterSpacing: 2, color: C.laranja, fontWeight: 700, textTransform: "uppercase" },
  headerTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, color: C.azul, marginTop: 2, lineHeight: 1 },
  userChip: { display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", background: C.offWhite, borderRadius: 100, border: `1px solid ${C.border}` },
  avatar: { width: 36, height: 36, borderRadius: "50%", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fredoka', sans-serif", fontSize: 16, fontWeight: 700 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.texto },
  adminBtn: { display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: C.azul, color: "white", border: "none", borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 700 },
  main: { padding: "3rem 2.5rem", maxWidth: 1300, margin: "0 auto" },
  h1: { fontFamily: "'Fredoka', sans-serif", fontSize: 32, fontWeight: 700, color: C.azul, margin: 0, lineHeight: 1.1 },
  appsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 },
  appCard: { padding: "32px 28px 24px", borderRadius: 20, border: `1px solid ${C.border}`, textAlign: "left", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 14 },
  appIcon: { width: 64, height: 64, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center" },
  appTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 },
  appDesc: { fontSize: 13.5, color: C.textoSuave, lineHeight: 1.6, margin: 0, flex: 1 },
  appFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` },
  appBadge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
};

const teamStyles = {
  page: { minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter', sans-serif" },
  main: { padding: "2rem 2.5rem", maxWidth: 1300, margin: "0 auto" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 },
  statCard: { background: "white", border: `1px solid ${C.border}`, padding: 14, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 },
  statIcon: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  toolbar: { display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" },
  searchBox: { flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9 },
  searchInput: { flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: "'Inter', sans-serif", color: C.texto },
  select: { padding: "10px 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, cursor: "pointer", fontWeight: 500, color: C.texto },
  btnPrimary: { display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.laranja, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700 },
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
  formInput: { width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 14, background: "white", fontFamily: "'Inter', sans-serif", color: C.texto },
  roleBtn: { display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif", justifyContent: "center" },
  appBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
};

const placeholderStyles = {
  page: { minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter', sans-serif" },
  backBtn: { background: "transparent", border: "none", cursor: "pointer", color: C.azul, fontSize: 13, fontWeight: 600, padding: 6 },
  box: { textAlign: "center", padding: "3rem 2rem", maxWidth: 600 },
  icon: { width: 100, height: 100, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  h1: { fontFamily: "'Fredoka', sans-serif", fontSize: 36, fontWeight: 700, color: C.azul, margin: "0 0 12px" },
  sub: { fontSize: 15, color: C.textoSuave, lineHeight: 1.6, margin: "0 0 20px" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 700 },
};

const acervoStyles = {
  app: { display: "flex", minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter', sans-serif", color: C.texto },
  sidebar: { width: 240, background: C.azul, color: C.cream, padding: "24px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden", flexShrink: 0 },
  brand: { display: "flex", gap: 10, alignItems: "center", paddingBottom: 18, borderBottom: "1px solid rgba(245,241,232,0.15)", position: "relative", zIndex: 1 },
  brandMark: { width: 46, height: 46, borderRadius: 12, background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  brandTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 19, fontWeight: 700, lineHeight: 1, color: C.laranja },
  brandSub: { fontSize: 9.5, letterSpacing: 1, color: "rgba(245,241,232,0.7)", marginTop: 3, fontWeight: 500 },
  navItem: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 12px", marginBottom: 2, background: "transparent", border: "none", color: "rgba(245,241,232,0.75)", cursor: "pointer", fontSize: 13.5, borderRadius: 9, textAlign: "left", fontWeight: 600 },
  navItemActive: { background: C.laranja, color: "#fff" },
  bottomBox: { marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(245,241,232,0.15)", position: "relative", zIndex: 1 },
  scopeToggle: { display: "flex", gap: 3, background: "rgba(0,0,0,0.2)", padding: 3, borderRadius: 7 },
  scopeBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px 7px", border: "none", background: "transparent", color: "rgba(245,241,232,0.6)", cursor: "pointer", fontSize: 10.5, borderRadius: 5, fontWeight: 600 },
  scopeBtnActive: { background: C.laranja, color: "#fff" },
  userBox: { display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "8px 10px", background: "rgba(0,0,0,0.2)", borderRadius: 10 },
  avatar: { width: 36, height: 36, borderRadius: "50%", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 700, flexShrink: 0 },
  miniBtn: { flex: 1, padding: "7px 0", background: "rgba(0,0,0,0.2)", color: "rgba(245,241,232,0.7)", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  main: { flex: 1, minWidth: 0 },
  header: { padding: "24px 36px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${C.border}`, background: "white", flexWrap: "wrap", gap: 12 },
  headerKicker: { fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 },
  headerTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 26, fontWeight: 700, margin: "5px 0 0", lineHeight: 1, color: C.azul },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 },
  statCard: { background: "white", border: `1px solid ${C.border}`, padding: 16, borderRadius: 14, position: "relative" },
  statIcon: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 800, lineHeight: 1, color: C.texto },
  statLabel: { fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 600 },
  panel: { background: "white", border: `1px solid ${C.border}`, padding: 20, borderRadius: 14 },
  panelKicker: { fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: C.laranja, fontWeight: 700 },
  panelTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 17, fontWeight: 700, marginTop: 4, color: C.azul },
  barTrack: { height: 7, background: C.borderSoft, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4, transition: "width 0.5s" },
  quickAction: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.offWhite, border: `1px solid ${C.borderSoft}`, borderRadius: 9, cursor: "pointer", fontFamily: "'Inter', sans-serif", color: C.texto, textAlign: "left" },
  toolbar: { display: "flex", gap: 8, marginBottom: 18, alignItems: "center", flexWrap: "wrap" },
  searchBox: { flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9 },
  searchInput: { flex: 1, border: "none", background: "transparent", fontSize: 13.5, fontFamily: "'Inter', sans-serif", color: C.texto },
  select: { padding: "9px 12px", background: "white", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 12.5, cursor: "pointer", minWidth: 150, fontWeight: 500, color: C.texto },
  btnPrimary: { display: "flex", alignItems: "center", gap: 5, padding: "9px 16px", background: C.laranja, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 700 },
  btnGhost: { display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "white", color: C.texto, border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 600 },
  iconBtn: { width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: 7, cursor: "pointer", color: C.muted },
  itemsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 },
  itemCard: { background: "white", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" },
  itemTop: { padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  itemTypeChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 11, color: "#fff", fontSize: 10, fontWeight: 700 },
  statusPill: { padding: "3px 9px", borderRadius: 11, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  itemTitle: { fontSize: 15.5, fontWeight: 700, margin: 0, color: C.texto, lineHeight: 1.2, fontFamily: "'Fredoka', sans-serif" },
  itemAuthor: { fontSize: 12, fontStyle: "italic", color: C.muted, marginTop: 3 },
  itemMeta: { fontSize: 11, color: C.muted, marginTop: 5, fontWeight: 600 },
  itemCode: { fontSize: 10.5, color: C.muted, marginTop: 6, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 },
  itemNotes: { fontSize: 12, color: C.texto, marginTop: 8, fontStyle: "italic", lineHeight: 1.5, paddingLeft: 9, borderLeft: `2px solid ${C.borderSoft}` },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 },
  tag: { fontSize: 10, padding: "2px 8px", background: C.azul + "12", borderRadius: 9, color: C.azul, display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600 },
  itemActions: { display: "flex", gap: 5, marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.borderSoft}` },
  itemBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 9px", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11.5, fontWeight: 700 },
  itemBtnGhost: { width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: C.offWhite, border: `1px solid ${C.borderSoft}`, borderRadius: 7, cursor: "pointer", color: C.texto },
  usersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 },
  userCard: { display: "flex", alignItems: "center", gap: 12, padding: 14, background: "white", border: `1px solid ${C.border}`, borderRadius: 12, position: "relative", overflow: "hidden" },
  loanRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "white", border: `1px solid ${C.border}`, borderRadius: 10, flexWrap: "wrap" },
  loanIcon: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tabBtn: { padding: "7px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: C.muted, borderRadius: 6, fontWeight: 600 },
  tabBtnActive: { background: "#fff", color: C.azul, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  barcodeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 },
  barcodeLabel: { background: "white", padding: 14, border: `1px solid ${C.border}`, borderRadius: 10, position: "relative", overflow: "hidden", paddingLeft: 18 },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(5, 79, 111, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modal: { background: C.offWhite, borderRadius: 14, maxWidth: 580, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: 22, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${C.border}` },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 7, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 },
  label: { fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: C.azul, display: "block", marginBottom: 5, fontWeight: 700 },
  input: { width: "100%", padding: "9px 11px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13.5, background: "white", fontFamily: "'Inter', sans-serif", color: C.texto },
  emptyState: { textAlign: "center", padding: "44px 20px", background: "white", border: `1px dashed ${C.border}`, borderRadius: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, background: C.azul + "12", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  toast: { position: "fixed", bottom: 20, right: 20, padding: "11px 18px", color: "#fff", borderRadius: 9, fontSize: 12.5, display: "flex", alignItems: "center", gap: 7, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 200, fontWeight: 600 },
};