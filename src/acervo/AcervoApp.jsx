// ============================================================
// CIENAH — Acervo App (orquestrador principal)
// Versão 2.0 — focado em recursos clínicos
// ============================================================
import { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { supabase } from "../supabaseClient";
import { C, ROLE_PERMISSIONS } from "../lib/constants";
import { resourceFromDb } from "../Lib/helpers";

import Sidebar from "./Sidebar";
import Painel from "./Painel";
import Catalogo from "./Catalogo";
import CadastrarRecurso from "./CadastrarRecurso";
import Salas from "./Salas";
import Categorias from "./Categorias";
import Inventario from "./Inventario";
import Etiquetas from "./Etiquetas";

export default function AcervoApp({ user, onLogout, onHub }) {
  const [view, setView] = useState("painel");
  const [data, setData] = useState({ resources: [], rooms: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const perms = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.leitor;

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ============================================================
  // CARREGAR TUDO DO SUPABASE
  // ============================================================
  const loadAll = async () => {
    setLoading(true);
    try {
      const [resourcesRes, roomsRes, categoriesRes] = await Promise.all([
        supabase.from("resources").select("*").order("created_at", { ascending: false }),
        supabase.from("rooms").select("*").order("nome"),
        supabase.from("categories").select("*").order("nome"),
      ]);

      if (resourcesRes.error) throw resourcesRes.error;
      if (roomsRes.error) throw roomsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setData({
        resources: (resourcesRes.data || []).map(resourceFromDb),
        rooms: roomsRes.data || [],
        categories: categoriesRes.data || [],
      });
    } catch (err) {
      console.error("Erro ao carregar:", err);
      showToast("Erro ao carregar dados: " + err.message, "error");
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // ============================================================
  // RECURSOS — CRUD
  // ============================================================
  const addResource = async (resource) => {
    try {
      const payload = {
        nome: resource.nome,
        tipo: resource.tipo || "outros",
        quantidade: parseInt(resource.quantidade) || 1,
        estado: resource.estado || "bom",
        sala_id: resource.salaId || null,
        objetivos: resource.objetivos || [],
        faixa_etaria: resource.faixaEtaria || "todas",
        foto_url: resource.fotoUrl || "",
        observacoes: resource.observacoes || "",
      };
      const { data: inserted, error } = await supabase
        .from("resources")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      setData(d => ({ ...d, resources: [resourceFromDb(inserted), ...d.resources] }));
      showToast(`Recurso "${inserted.nome}" cadastrado · código ${inserted.code}`);
      return inserted;
    } catch (err) {
      console.error(err);
      showToast("Erro ao cadastrar: " + err.message, "error");
      throw err;
    }
  };

  const updateResource = async (id, patch) => {
    try {
      const dbPatch = {};
      if (patch.nome !== undefined) dbPatch.nome = patch.nome;
      if (patch.tipo !== undefined) dbPatch.tipo = patch.tipo;
      if (patch.quantidade !== undefined) dbPatch.quantidade = parseInt(patch.quantidade) || 1;
      if (patch.estado !== undefined) dbPatch.estado = patch.estado;
      if (patch.salaId !== undefined) dbPatch.sala_id = patch.salaId || null;
      if (patch.objetivos !== undefined) dbPatch.objetivos = patch.objetivos;
      if (patch.faixaEtaria !== undefined) dbPatch.faixa_etaria = patch.faixaEtaria;
      if (patch.fotoUrl !== undefined) dbPatch.foto_url = patch.fotoUrl;
      if (patch.observacoes !== undefined) dbPatch.observacoes = patch.observacoes;

      const { data: updated, error } = await supabase
        .from("resources")
        .update(dbPatch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setData(d => ({ ...d, resources: d.resources.map(r => r.id === id ? resourceFromDb(updated) : r) }));
      showToast("Recurso atualizado");
    } catch (err) {
      showToast("Erro ao atualizar: " + err.message, "error");
    }
  };

  const deleteResource = async (id) => {
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      setData(d => ({ ...d, resources: d.resources.filter(r => r.id !== id) }));
      showToast("Recurso removido");
    } catch (err) {
      showToast("Erro ao remover: " + err.message, "error");
    }
  };

  const deleteAllResources = async () => {
    if (!window.confirm("⚠️ Tem certeza que quer APAGAR TODOS os recursos? Esta ação NÃO pode ser desfeita.")) return;
    if (!window.confirm("Última confirmação: APAGAR TUDO?")) return;
    try {
      const { error } = await supabase.from("resources").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      setData(d => ({ ...d, resources: [] }));
      showToast("Todos os recursos foram apagados");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  // ============================================================
  // SALAS — CRUD
  // ============================================================
  const addRoom = async (room) => {
    try {
      const { data: inserted, error } = await supabase
        .from("rooms")
        .insert([{ nome: room.nome, terapeuta: room.terapeuta || "", ativa: true }])
        .select().single();
      if (error) throw error;
      setData(d => ({ ...d, rooms: [...d.rooms, inserted].sort((a, b) => a.nome.localeCompare(b.nome)) }));
      showToast("Sala adicionada");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const updateRoom = async (id, patch) => {
    try {
      const { data: updated, error } = await supabase
        .from("rooms").update(patch).eq("id", id).select().single();
      if (error) throw error;
      setData(d => ({ ...d, rooms: d.rooms.map(r => r.id === id ? updated : r) }));
      showToast("Sala atualizada");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const deleteRoom = async (id) => {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
      setData(d => ({ ...d, rooms: d.rooms.filter(r => r.id !== id) }));
      showToast("Sala removida");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  // ============================================================
  // CATEGORIAS — CRUD
  // ============================================================
  const addCategory = async (cat) => {
    try {
      const { data: inserted, error } = await supabase
        .from("categories")
        .insert([{ nome: cat.nome, cor: cat.cor || C.azul }])
        .select().single();
      if (error) throw error;
      setData(d => ({ ...d, categories: [...d.categories, inserted].sort((a, b) => a.nome.localeCompare(b.nome)) }));
      showToast("Categoria adicionada");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const updateCategory = async (id, patch) => {
    try {
      const { data: updated, error } = await supabase
        .from("categories").update(patch).eq("id", id).select().single();
      if (error) throw error;
      setData(d => ({ ...d, categories: d.categories.map(c => c.id === id ? updated : c) }));
      showToast("Categoria atualizada");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  const deleteCategory = async (id) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setData(d => ({ ...d, categories: d.categories.filter(c => c.id !== id) }));
      showToast("Categoria removida");
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
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

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter', sans-serif", color: C.texto }}>
      <Sidebar
        view={view}
        setView={setView}
        user={user}
        onHub={onHub}
        onLogout={onLogout}
        onCadastrar={() => { setEditingResource(null); setShowCadastro(true); }}
        perms={perms}
      />

      <main style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        {view === "painel" && (
          <Painel data={data} setView={setView} onCadastrar={() => { setEditingResource(null); setShowCadastro(true); }} />
        )}
        {view === "catalogo" && (
          <Catalogo
            data={data}
            perms={perms}
            onEdit={(r) => { setEditingResource(r); setShowCadastro(true); }}
            onDelete={deleteResource}
            onCadastrar={() => { setEditingResource(null); setShowCadastro(true); }}
          />
        )}
        {view === "inventario" && <Inventario data={data} />}
        {view === "salas" && perms.canManageRooms && (
          <Salas
            rooms={data.rooms}
            resources={data.resources}
            onAdd={addRoom}
            onUpdate={updateRoom}
            onDelete={deleteRoom}
          />
        )}
        {view === "categorias" && perms.canManageCategories && (
          <Categorias
            categories={data.categories}
            resources={data.resources}
            onAdd={addCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
          />
        )}
        {view === "etiquetas" && <Etiquetas resources={data.resources} rooms={data.rooms} />}
        {view === "admin" && perms.canDelete && (
          <AdminTools onDeleteAll={deleteAllResources} count={data.resources.length} />
        )}
      </main>

      {showCadastro && perms.canEdit && (
        <CadastrarRecurso
          resource={editingResource}
          rooms={data.rooms}
          categories={data.categories}
          onClose={() => { setShowCadastro(false); setEditingResource(null); }}
          onSave={async (r) => {
            if (editingResource) {
              await updateResource(editingResource.id, r);
            } else {
              await addResource(r);
            }
            setShowCadastro(false);
            setEditingResource(null);
          }}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "12px 20px", color: "#fff", borderRadius: 10, fontSize: 13, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 200, fontWeight: 600, background: toast.type === "error" ? C.rosa : C.verde }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// Ferramentas de admin (apagar tudo, etc.)
function AdminTools({ onDeleteAll, count }) {
  return (
    <div style={{ padding: "28px 36px" }}>
      <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 26, fontWeight: 700, color: C.azul, marginBottom: 8 }}>
        Ferramentas Administrativas
      </h1>
      <p style={{ color: C.muted, marginBottom: 32 }}>Ações sensíveis. Use com cuidado.</p>

      <div style={{ background: "white", border: `1px solid ${C.rosa}40`, borderRadius: 14, padding: 24, maxWidth: 600 }}>
        <h3 style={{ color: C.rosa, fontSize: 17, fontFamily: "'Fredoka', sans-serif", marginTop: 0 }}>
          🚨 Apagar todo o acervo
        </h3>
        <p style={{ fontSize: 13, color: C.textoSuave, lineHeight: 1.6 }}>
          Esta ação remove <strong>{count}</strong> recursos do banco de dados de forma permanente.
          Não há como desfazer. Tem certeza absoluta?
        </p>
        <button
          onClick={onDeleteAll}
          disabled={count === 0}
          style={{
            marginTop: 12,
            padding: "12px 20px",
            background: C.rosa,
            color: "white",
            border: "none",
            borderRadius: 9,
            cursor: count === 0 ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 700,
            opacity: count === 0 ? 0.4 : 1,
          }}
        >
          Apagar todos os {count} recursos
        </button>
      </div>
    </div>
  );
}