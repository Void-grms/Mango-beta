import type { DiseaseCode, SeverityLevel } from '../types/analysis';

export interface DiseaseInfo {
  id: number;
  codigo: DiseaseCode;
  nombre_es: string;
  nombre_cientifico: string | null;
  descripcion: string;
  color_hex: string;
  badge_classes: string;
  border_classes: string;
  bg_classes: string;
}

export const DISEASES: Record<DiseaseCode, DiseaseInfo> = {
  sano: {
    id: 1,
    codigo: 'sano',
    nombre_es: 'Sano',
    nombre_cientifico: null,
    descripcion: 'El fruto no presenta lesiones ni signos de enfermedad. Apto para exportación.',
    color_hex: '#16a34a',
    badge_classes: 'bg-green-50 text-green-700 border border-green-200',
    border_classes: 'border-green-200',
    bg_classes: 'bg-green-50/50',
  },
  antracnosis: {
    id: 2,
    codigo: 'antracnosis',
    nombre_es: 'Antracnosis',
    nombre_cientifico: 'Colletotrichum gloeosporioides',
    descripcion: 'Enfermedad fúngica muy común. Produce manchas oscuras hundidas con bordes bien definidos en frutos y hojas.',
    color_hex: '#dc2626',
    badge_classes: 'bg-red-50 text-red-700 border border-red-200',
    border_classes: 'border-red-200',
    bg_classes: 'bg-red-50/50',
  },
  oidio: {
    id: 3,
    codigo: 'oidio',
    nombre_es: 'Oídio',
    nombre_cientifico: 'Erysiphe sp.',
    descripcion: 'Hongo que produce un polvo blanco-grisáceo sobre la superficie del fruto y hojas jóvenes.',
    color_hex: '#d97706',
    badge_classes: 'bg-amber-50 text-amber-700 border border-amber-200',
    border_classes: 'border-amber-200',
    bg_classes: 'bg-amber-50/50',
  },
  pudricion_pedunculo: {
    id: 4,
    codigo: 'pudricion_pedunculo',
    nombre_es: 'Pudrición del pedúnculo',
    nombre_cientifico: 'Lasiodiplodia theobromae',
    descripcion: 'Infección fúngica que inicia en el punto de inserción del pedúnculo y avanza hacia el interior.',
    color_hex: '#7c3aed',
    badge_classes: 'bg-purple-50 text-purple-700 border border-purple-200',
    border_classes: 'border-purple-200',
    bg_classes: 'bg-purple-50/50',
  },
  otras_lesiones: {
    id: 5,
    codigo: 'otras_lesiones',
    nombre_es: 'Otras lesiones',
    nombre_cientifico: null,
    descripcion: 'Daños visibles que no corresponden a las enfermedades principales. Puede incluir daños mecánicos, por insectos o quemaduras.',
    color_hex: '#6b7280',
    badge_classes: 'bg-gray-50 text-gray-700 border border-gray-200',
    border_classes: 'border-gray-200',
    bg_classes: 'bg-gray-50/50',
  },
};

export interface SeverityInfo {
  label: string;
  badge_classes: string;
  bar_color: string;
  order: number;
}

export const SEVERITY_CONFIG: Record<SeverityLevel, SeverityInfo> = {
  sano:     { label: 'Sano',     badge_classes: 'bg-green-50  text-green-700  border border-green-200',  bar_color: '#16a34a', order: 0 },
  leve:     { label: 'Leve',     badge_classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200', bar_color: '#d97706', order: 1 },
  moderado: { label: 'Moderado', badge_classes: 'bg-orange-50 text-orange-700 border border-orange-200', bar_color: '#ea580c', order: 2 },
  severo:   { label: 'Severo',   badge_classes: 'bg-red-50    text-red-700    border border-red-200',    bar_color: '#dc2626', order: 3 },
};

export const ESTADO_GENERAL_CONFIG = {
  optimo:       { label: 'Óptimo',       classes: 'bg-green-50  border border-green-200  text-green-700',  icon: '✅' },
  acceptable:   { label: 'Aceptable',    classes: 'bg-blue-50   border border-blue-200   text-blue-700',   icon: '🔵' },
  comprometido: { label: 'Comprometido', classes: 'bg-yellow-50 border border-yellow-200 text-yellow-700', icon: '⚠️' },
  critico:      { label: 'Crítico',      classes: 'bg-red-50    border border-red-200    text-red-700',    icon: '🔴' },
};

// ─── Getters seguros con fallback ────────────────────────────────────────────

const VALID_ESTADOS = Object.keys(ESTADO_GENERAL_CONFIG) as (keyof typeof ESTADO_GENERAL_CONFIG)[];
const VALID_CODES   = Object.keys(DISEASES) as DiseaseCode[];
const VALID_SEVERITY = Object.keys(SEVERITY_CONFIG) as SeverityLevel[];

/** Devuelve la config de estado_general, nunca undefined. */
export function getEstadoConfig(estado: string) {
  const key = VALID_ESTADOS.find(k => k === estado)
    ?? VALID_ESTADOS.find(k => estado?.toLowerCase().includes(k))
    ?? 'optimo';
  return ESTADO_GENERAL_CONFIG[key];
}

/** Devuelve la config de enfermedad, nunca undefined. */
export function getDiseaseInfo(codigo: string): DiseaseInfo {
  const key = VALID_CODES.find(k => k === codigo) ?? 'otras_lesiones';
  return DISEASES[key];
}

/** Devuelve la config de severidad, nunca undefined. */
export function getSeverityInfo(severidad: string): SeverityInfo {
  const key = VALID_SEVERITY.find(k => k === severidad) ?? 'sano';
  return SEVERITY_CONFIG[key];
}
