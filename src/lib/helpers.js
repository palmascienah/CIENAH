// ============================================================
// CIENAH — FUNÇÕES HELPER
// ============================================================
import { TIPOS_RECURSO, ESTADOS, FAIXAS_ETARIAS } from "./constants";

// Datas
export const today = () => new Date().toISOString().slice(0, 10);
export const fmt = (d) => {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("pt-BR"); }
  catch { return d; }
};
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// Tipo
export const tipoInfo = (id) =>
  TIPOS_RECURSO.find(t => t.id === id) || TIPOS_RECURSO[TIPOS_RECURSO.length - 1];

// Estado
export const estadoInfo = (id) =>
  ESTADOS.find(e => e.id === id) || ESTADOS[1];

// Faixa etária
export const faixaInfo = (id) =>
  FAIXAS_ETARIAS.find(f => f.id === id) || FAIXAS_ETARIAS[FAIXAS_ETARIAS.length - 1];

// Converte resource do banco (snake_case) pra JS (camelCase)
export const resourceFromDb = (r) => ({
  id: r.id,
  code: r.code,
  nome: r.nome,
  tipo: r.tipo,
  quantidade: r.quantidade,
  estado: r.estado,
  salaId: r.sala_id,
  objetivos: r.objetivos || [],
  faixaEtaria: r.faixa_etaria,
  fotoUrl: r.foto_url || "",
  observacoes: r.observacoes || "",
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  createdBy: r.created_by,
});

// Slugify para nomes de arquivo
export const slugify = (str) =>
  str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);

// Sleep helper
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));