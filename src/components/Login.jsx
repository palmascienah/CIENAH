// ============================================================
// CIENAH — Tela de Login
// ============================================================
import { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, Check, Shield, Library } from "lucide-react";
import { supabase } from "../supabaseClient";
import { C } from "../lib/constants";

export default function Login({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha");
      return;
    }
    setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authErr) throw authErr;

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (profErr) throw profErr;
      if (!profile) throw new Error("Perfil não encontrado. Contate o administrador.");

      onLogin(profile);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <button onClick={onBack} style={s.backBtn}>
          <ArrowLeft size={14} /> Voltar
        </button>
        <div style={s.leftContent}>
          <img src="/cienah-logo.png" alt="CIENAH" style={{ width: 96, height: 96, objectFit: "contain" }} />
          <h1 style={s.leftTitle}>Área da Equipe</h1>
          <p style={s.leftSub}>Acesso aos sistemas internos da CIENAH</p>
          <div style={s.leftFeatures}>
            <div style={s.leftFeature}><Library size={18} color={C.laranja} /> Acervo terapêutico compartilhado</div>
            <div style={s.leftFeature}><Shield size={18} color={C.amarelo} /> Dados protegidos e seguros</div>
            <div style={s.leftFeature}><Check size={18} color={C.verde} /> Sincronização em nuvem</div>
          </div>
        </div>
      </div>

      <div style={s.right}>
        <form onSubmit={handleSubmit} style={s.formBox}>
          <h2 style={s.formTitle}>Entrar</h2>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 24 }}>
            Use suas credenciais da CIENAH
          </p>

          {error && (
            <div style={s.error}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>E-mail</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ ...s.input, paddingLeft: 36 }}
                placeholder="seu@email.com"
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={s.label}>Senha</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...s.input, paddingLeft: 36, paddingRight: 40 }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={s.eyeBtn} tabIndex={-1}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={s.submitBtn}>
            {loading ? "Entrando..." : <>Entrar <ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} /></>}
          </button>

          <p style={{ marginTop: 18, fontSize: 12, color: C.muted, textAlign: "center" }}>
            Não tem acesso? Solicite ao administrador da clínica.
          </p>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", minHeight: "100vh" },
  left: { background: C.azul, color: "white", padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" },
  backBtn: { position: "absolute", top: 24, left: 24, background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px 16px", borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  leftContent: { position: "relative", zIndex: 1, maxWidth: 480 },
  leftTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: "2.6rem", fontWeight: 600, color: C.laranja, margin: "1.5rem 0 0.5rem" },
  leftSub: { fontSize: "1.1rem", opacity: 0.85, marginBottom: "2.5rem", lineHeight: 1.6 },
  leftFeatures: { display: "flex", flexDirection: "column", gap: 14 },
  leftFeature: { display: "flex", alignItems: "center", gap: 12, fontSize: 15, opacity: 0.9 },
  right: { display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: C.offWhite },
  formBox: { width: "100%", maxWidth: 420, padding: "2.5rem", background: "white", borderRadius: 24, boxShadow: "0 20px 60px rgba(5, 79, 111, 0.08)" },
  formTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: "1.8rem", fontWeight: 600, color: C.azul, margin: 0 },
  label: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.azul, display: "block", marginBottom: 6, fontWeight: 700 },
  input: { width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: "#fff", fontFamily: "'Inter', sans-serif", color: C.texto, boxSizing: "border-box" },
  eyeBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: C.muted, padding: 4 },
  error: { padding: "10px 14px", background: C.rosa + "15", color: C.rosa, borderRadius: 10, fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 },
  submitBtn: { width: "100%", padding: "14px 20px", background: C.laranja, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Fredoka', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
};