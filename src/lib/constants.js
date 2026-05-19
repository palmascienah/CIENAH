// ============================================================
// CIENAH — CONSTANTES GLOBAIS
// ============================================================

// Paleta de cores institucional
export const C = {
  // Primárias
  laranja: "#D27A2A",
  azul: "#054F6F",
  azulEscuro: "#033B54",
  rosa: "#D77E7E",
  verde: "#7BA840",
  amarelo: "#E6C84A",

  // Neutras
  cream: "#F5F1E8",
  creamLight: "#FAF7EE",
  offWhite: "#EFEDE9",
  texto: "#2D3748",
  textoSuave: "#5A6573",
  muted: "#8B95A3",
  border: "#D5D2CB",
  borderSoft: "#E8E5DE",
  linha: "#D8D4CB",
};

// Tipos de recurso terapêutico
export const TIPOS_RECURSO = [
  { id: "jogo", label: "Jogo de Tabuleiro", icon: "Dices", color: "#7BA840" },
  { id: "brinquedo", label: "Brinquedo/Lúdico", icon: "ToyBrick", color: "#D27A2A" },
  { id: "cartas", label: "Cartas", icon: "Layers", color: "#D77E7E" },
  { id: "encaixe", label: "Encaixes/Quebra-cabeça", icon: "Puzzle", color: "#5B5BA3" },
  { id: "instrumento", label: "Instrumento Musical", icon: "Music", color: "#E6C84A" },
  { id: "livro", label: "Livro", icon: "BookOpen", color: "#054F6F" },
  { id: "pareamento", label: "Pareamento", icon: "Copy", color: "#9B59B6" },
  { id: "causaefeito", label: "Causa e Efeito", icon: "Zap", color: "#E67E22" },
  { id: "papelaria", label: "Papelaria/Material", icon: "Pencil", color: "#0A6B7C" },
  { id: "outros", label: "Outros", icon: "Package", color: "#8B95A3" },
];

// Estados de conservação
export const ESTADOS = [
  { id: "novo", label: "Novo", color: "#7BA840" },
  { id: "bom", label: "Bom", color: "#0A6B7C" },
  { id: "regular", label: "Regular", color: "#E6C84A" },
  { id: "ruim", label: "Ruim", color: "#D77E7E" },
];

// Faixas etárias
export const FAIXAS_ETARIAS = [
  { id: "0-3", label: "0 a 3 anos" },
  { id: "3-6", label: "3 a 6 anos" },
  { id: "6-12", label: "6 a 12 anos" },
  { id: "12+", label: "12 anos ou mais" },
  { id: "todas", label: "Todas as idades" },
];

// Apps disponíveis
export const APPS = {
  acervo: { label: "Acervo", color: "#054F6F" },
  aba: { label: "ABA", color: "#7BA840" },
  laudos: { label: "Laudos", color: "#D27A2A" },
};

// Papéis (roles)
export const ROLE_LABELS = {
  admin: "Administrador",
  bibliotecario: "Bibliotecário",
  terapeuta: "Terapeuta",
  leitor: "Leitor",
};

// Permissões por papel
export const ROLE_PERMISSIONS = {
  admin: { canEdit: true, canDelete: true, canManageUsers: true, canManageRooms: true, canManageCategories: true },
  bibliotecario: { canEdit: true, canDelete: true, canManageUsers: false, canManageRooms: true, canManageCategories: true },
  terapeuta: { canEdit: true, canDelete: false, canManageUsers: false, canManageRooms: false, canManageCategories: false },
  leitor: { canEdit: false, canDelete: false, canManageUsers: false, canManageRooms: false, canManageCategories: false },
};