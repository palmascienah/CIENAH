// ============================================================
// CIENAH PORTAL — App principal (roteamento)
// ============================================================
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { C } from "./lib/constants";

import FontStyles from "./components/FontStyles";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Hub, { NoAccess } from "./components/Hub";
import TeamManager from "./components/TeamManager";
import Placeholder from "./components/Placeholder";
import AcervoApp from "./acervo/AcervoApp";

export default function App() {
  const [route, setRoute] = useState("home");
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // ============================================================
  // LIMPEZA DE LIXO DO LOCALSTORAGE (migração antiga)
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
    try {
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout fetchProfile")), 8000)
      );
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("fetchProfile falhou:", err);
      return null;
    }
  };

  // ============================================================
  // SESSÃO — usa onAuthStateChange (sem race condition)
  // ============================================================
  useEffect(() => {
    let mounted = true;
    let resolvedByListener = false;

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log("🔔 Auth event:", event);
      resolvedByListener = true;

      try {
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          if (profile && mounted) setUser(profile);
        } else {
          if (mounted) {
            setUser(null);
            setRoute("home");
          }
        }
      } catch (err) {
        console.error("Erro no listener:", err);
      } finally {
        if (mounted) setLoadingSession(false);
      }
    });

    // Fallback: força saída do loading em 3s se listener não disparar
    const fallback = setTimeout(() => {
      if (!resolvedByListener && mounted) {
        console.log("⏰ Listener não respondeu em 3s — forçando saída do loading");
        setLoadingSession(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(fallback);
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
  // TELA DE CARREGAMENTO
  // ============================================================
  if (loadingSession) {
    return (
      <>
        <FontStyles />
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
                try { await supabase.auth.signOut(); } catch {}
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

  // ============================================================
  // ROTEAMENTO
  // ============================================================
  return (
    <>
      <FontStyles />
      {route === "home" && <Landing onNavigate={setRoute} user={user} />}
      {route === "login" && <Login onLogin={handleLogin} onBack={() => setRoute("home")} />}
      {route === "hub" && user && <Hub user={user} onNavigate={setRoute} onLogout={handleLogout} />}
      {route === "equipe" && user && user.role === "admin" && (
        <TeamManager user={user} onLogout={handleLogout} onHub={() => setRoute("hub")} />
      )}
      {route === "acervo" && user && (
        user.apps?.includes("acervo")
          ? <AcervoApp user={user} onLogout={handleLogout} onHub={() => setRoute("hub")} />
          : <NoAccess onBack={() => setRoute("hub")} />
      )}
      {route === "aba" && user && (
        user.apps?.includes("aba")
          ? <Placeholder app="aba" user={user} onLogout={handleLogout} onHub={() => setRoute("hub")} />
          : <NoAccess onBack={() => setRoute("hub")} />
      )}
      {route === "laudos" && user && (
        user.apps?.includes("laudos")
          ? <Placeholder app="laudos" user={user} onLogout={handleLogout} onHub={() => setRoute("hub")} />
          : <NoAccess onBack={() => setRoute("hub")} />
      )}
    </>
  );
}