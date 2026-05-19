// ============================================================
// CIENAH — Landing Page (página inicial pública)
// ============================================================
import { useState, useEffect } from "react";
import {
  Brain, Heart, Users, MessageCircle, Hand, MusicIcon,
  GraduationCap, Baby, Menu, MapPin, Phone, Mail, AtSign,
  Lock, ArrowRight, Eye as EyeIcon,
} from "lucide-react";
import { C } from "../lib/constants";
import { PatternBg } from "./FontStyles";

export default function Landing({ onNavigate, user }) {
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
    <div style={s.page}>
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.logoWrapper}>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 48, height: 48, objectFit: "contain" }} />
          <div>
            <div style={s.logoName}>CIENAH</div>
            <div style={s.logoSub}>Centro Interdisciplinar Especializado<br />em Neurociência e Atendimento Humanizado</div>
          </div>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={s.mobileMenuBtn}>
          <Menu size={24} />
        </button>
        <ul className={`nav-links ${menuOpen ? "open" : ""}`} style={s.navLinks}>
          <li><a href="#sobre" style={s.navLink} onClick={() => setMenuOpen(false)}>Sobre</a></li>
          <li><a href="#especialidades" style={s.navLink} onClick={() => setMenuOpen(false)}>Especialidades</a></li>
          <li><a href="#contato" style={s.navLink} onClick={() => setMenuOpen(false)}>Contato</a></li>
          {user ? (
            <li><button onClick={() => onNavigate("hub")} style={s.navCta}>Acessar sistema</button></li>
          ) : (
            <li><button onClick={() => onNavigate("login")} style={s.navCta}>Área restrita</button></li>
          )}
        </ul>
      </nav>

      <section style={s.hero}>
        <div style={{ ...s.blob, ...s.blob1 }} />
        <div style={{ ...s.blob, ...s.blob2 }} />
        <div style={{ ...s.blob, ...s.blob3 }} />
        <div style={s.heroGrid}>
          <div>
            <div style={s.heroTag}>
              <span style={s.heroDot} />
              Palmas, Tocantins · Desde 2020
            </div>
            <h1 style={s.heroH1}>
              <span style={{ color: C.laranja, fontWeight: 600 }}>Humanização</span> e{" "}
              <span style={{ color: C.rosa, fontWeight: 600 }}>neurociência</span>:<br />
              tudo em um<br />
              <span style={{ color: C.verde, fontStyle: "italic" }}>só lugar</span>
            </h1>
            <p style={s.heroSub}>
              Centro Interdisciplinar Especializado em Neurociência e Atendimento Humanizado.
              Cuidado integral para crianças, adolescentes e adultos com práticas baseadas em evidências.
            </p>
            <div style={s.heroActions}>
              <a href="#especialidades" style={s.btnPrimary}>
                Conheça as especialidades <ArrowRight size={18} />
              </a>
              <a href="#contato" style={s.btnSecondary}>Agende uma avaliação</a>
            </div>
          </div>
          <div style={s.heroVisual}>
            <div style={s.brainContainer}>
              <img src="/cienah-logo.png" alt="CIENAH" style={{ width: "100%", maxWidth: 480, height: "auto" }} />
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" style={{ ...s.secao, background: "white" }}>
        <div style={s.secaoContainer}>
          <span style={{ ...s.secaoTag, color: C.rosa, background: C.rosa + "1A" }}>Quem Somos</span>
          <h2 style={s.secaoTitulo}>Um centro pensado para acolher, cuidar e desenvolver</h2>
          <div style={s.lobulosGrid}>
            <div style={{ ...s.lobulo, background: `linear-gradient(135deg, ${C.laranja}1F, ${C.laranja}08)`, border: `2px solid ${C.laranja}33` }}>
              <div style={{ ...s.lobuloIcon, background: C.laranja }}>
                <Heart size={28} color="white" strokeWidth={2} />
              </div>
              <h3 style={s.lobuloH3}>Atendimento Humanizado</h3>
              <p style={s.lobuloP}>Cada paciente é único. Cuidamos com escuta atenta, respeito e atenção integral.</p>
            </div>
            <div style={{ ...s.lobulo, background: `linear-gradient(135deg, ${C.rosa}1F, ${C.rosa}08)`, border: `2px solid ${C.rosa}33` }}>
              <div style={{ ...s.lobuloIcon, background: C.rosa }}>
                <Brain size={28} color="white" strokeWidth={2} />
              </div>
              <h3 style={s.lobuloH3}>Base Científica</h3>
              <p style={s.lobuloP}>Práticas baseadas em evidências da neurociência atual, com formação contínua.</p>
            </div>
            <div style={{ ...s.lobulo, background: `linear-gradient(135deg, ${C.verde}1F, ${C.verde}08)`, border: `2px solid ${C.verde}33` }}>
              <div style={{ ...s.lobuloIcon, background: C.verde }}>
                <Users size={28} color="white" strokeWidth={2} />
              </div>
              <h3 style={s.lobuloH3}>Equipe Interdisciplinar</h3>
              <p style={s.lobuloP}>Profissionais de diferentes áreas trabalhando juntos com plano integrado.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...s.secao, background: C.offWhite }}>
        <div style={s.propositoCard}>
          <div style={{ ...s.blob, width: 200, height: 200, background: C.laranja, top: -50, left: -50, opacity: 0.08 }} />
          <div style={{ ...s.blob, width: 250, height: 250, background: C.rosa, bottom: -80, right: -80, opacity: 0.08 }} />
          <div style={s.propositoAspas}>"</div>
          <p style={s.propositoTexto}>
            Acreditamos que o cuidado começa no <strong>olhar atento</strong> e se constrói com <em>ciência e afeto</em>.
          </p>
        </div>
      </section>

      <section style={s.missaoVisao}>
        <div style={s.mvContainer}>
          <div style={{ ...s.mvCard, background: `linear-gradient(135deg, ${C.laranja}, #c4762e)` }}>
            <PatternBg opacity={0.08} dark />
            <div style={s.mvNumero}>01</div>
            <h3 style={s.mvH3}>Missão</h3>
            <p style={s.mvP}>Oferecer atendimento clínico interdisciplinar de excelência, integrando neurociência e humanização para promover desenvolvimento e qualidade de vida.</p>
          </div>
          <div style={{ ...s.mvCard, background: `linear-gradient(135deg, ${C.azul}, ${C.azulEscuro})` }}>
            <PatternBg opacity={0.08} dark />
            <div style={s.mvNumero}>02</div>
            <h3 style={s.mvH3}>Visão</h3>
            <p style={s.mvP}>Ser referência regional em cuidado interdisciplinar humanizado, formando uma rede de apoio que transforma vidas através do conhecimento científico aliado ao acolhimento.</p>
          </div>
        </div>
      </section>

      <section style={{ ...s.secao, background: C.offWhite }}>
        <div style={s.secaoContainer}>
          <span style={{ ...s.secaoTag, color: "#a47e1c", background: C.amarelo + "2D" }}>Valores</span>
          <h2 style={s.secaoTitulo}>Os princípios que guiam cada decisão</h2>
          <div style={s.valoresGrid}>
            {valores.map((v, i) => {
              const colors = [C.laranja, C.rosa, C.verde, C.amarelo, C.azul];
              const color = colors[i % 5];
              return (
                <div key={i} style={{ ...s.valorCard, borderTopColor: color }}>
                  <div style={{ ...s.valorIconMini, background: color + "26", color: i % 5 === 3 ? "#a47e1c" : color }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h4 style={s.valorH4}>{v.titulo}</h4>
                  <p style={s.valorP}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="especialidades" style={{ ...s.secao, background: "white" }}>
        <div style={s.secaoContainer}>
          <span style={{ ...s.secaoTag, color: C.verde, background: C.verde + "1F" }}>Especialidades</span>
          <h2 style={s.secaoTitulo}>Áreas de atuação para um cuidado completo</h2>
          <div style={s.espGrid}>
            {especialidades.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={i} style={s.espCard}>
                  <div style={{ ...s.espIconBig, background: e.color }}>
                    <Icon size={26} color="white" strokeWidth={2} />
                  </div>
                  <h4 style={s.espH4}>{e.titulo}</h4>
                  <ul style={s.espUl}>
                    {e.itens.map((item, j) => (
                      <li key={j} style={{ ...s.espLi, color: C.textoSuave }}>
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

      <section id="contato" style={{ ...s.secao, background: C.azul, color: "white", position: "relative", overflow: "hidden" }}>
        <PatternBg opacity={0.05} dark />
        <div style={{ ...s.secaoContainer, textAlign: "center", position: "relative", zIndex: 2 }}>
          <span style={{ ...s.secaoTag, color: C.amarelo, background: "rgba(255,255,255,0.1)" }}>Contato</span>
          <h2 style={{ ...s.secaoTitulo, color: "white", margin: "0 auto" }}>Vamos cuidar juntos</h2>
          <div style={s.contatoGrid}>
            <div style={s.contatoItem}>
              <MapPin size={28} color={C.laranja} />
              <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>Endereço</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Palmas, Tocantins</div>
            </div>
            <div style={s.contatoItem}>
              <Phone size={28} color={C.amarelo} />
              <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>Telefone</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>(63) 99125-2929</div>
            </div>
            <div style={s.contatoItem}>
              <Mail size={28} color={C.rosa} />
              <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>E-mail</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>cienahpalmas@gmail.com</div>
            </div>
            <div style={s.contatoItem}>
              <AtSign size={28} color={C.verde} />
              <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>Instagram</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>@cienahpalmas</div>
            </div>
          </div>
          <button onClick={() => onNavigate("login")} style={{ ...s.btnPrimary, marginTop: 48, background: C.laranja }}>
            <Lock size={18} /> Área restrita da equipe
          </button>
        </div>
      </section>

      <footer style={s.footer}>
        <div style={s.secaoContainer}>
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

// Estilos locais
const s = {
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