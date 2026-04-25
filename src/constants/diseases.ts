import type { DiseaseCode, SeverityLevel } from '../types/analysis';

export interface DiseaseInfo {
  id: number;
  codigo: DiseaseCode;
  nombre_es: string;
  nombre_cientifico: string | null;
  descripcion: string;
  color_hex: string;
  // Clases Tailwind para badge
  badge_classes: string;
  // Clases Tailwind para card border
  border_classes: string;
  // Clases Tailwind para card background
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
    badge_classes: 'bg-green-100 text-green-800 border border-green-200',
    border_classes: 'border-green-400',
    bg_classes: 'bg-green-50',
  },
  antracnosis: {
    id: 2,
    codigo: 'antracnosis',
    nombre_es: 'Antracnosis',
    nombre_cientifico: 'Colletotrichum gloeosporioides',
    descripcion: 'Enfermedad fúngica muy común. Produce manchas oscuras hundidas con bordes bien definidos en frutos y hojas.',
    color_hex: '#dc2626',
    badge_classes: 'bg-red-100 text-red-800 border border-red-200',
    border_classes: 'border-red-400',
    bg_classes: 'bg-red-50',
  },
  oidio: {
    id: 3,
    codigo: 'oidio',
    nombre_es: 'Oídio',
    nombre_cientifico: 'Erysiphe sp.',
    descripcion: 'Hongo que produce un polvo blanco-grisáceo sobre la superficie del fruto y hojas jóvenes.',
    color_hex: '#d97706',
    badge_classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    border_classes: 'border-yellow-400',
    bg_classes: 'bg-yellow-50',
  },
  pudricion_pedunculo: {
    id: 4,
    codigo: 'pudricion_pedunculo',
    nombre_es: 'Pudrición del pedúnculo',
    nombre_cientifico: 'Lasiodiplodia theobromae',
    descripcion: 'Infección fúngica que inicia en el punto de inserción del pedúnculo y avanza hacia el interior.',
    color_hex: '#7c3aed',
    badge_classes: 'bg-purple-100 text-purple-800 border border-purple-200',
    border_classes: 'border-purple-400',
    bg_classes: 'bg-purple-50',
  },
  otras_lesiones: {
    id: 5,
    codigo: 'otras_lesiones',
    nombre_es: 'Otras lesiones',
    nombre_cientifico: null,
    descripcion: 'Daños visibles que no corresponden a las enfermedades principales. Puede incluir daños mecánicos, por insectos o quemaduras.',
    color_hex: '#6b7280',
    badge_classes: 'bg-gray-100 text-gray-800 border border-gray-200',
    border_classes: 'border-gray-400',
    bg_classes: 'bg-gray-50',
  },
};

export interface SeverityInfo {
  label: string;
  badge_classes: string;
  bar_color: string;
  order: number;
}

export const SEVERITY_CONFIG: Record<SeverityLevel, SeverityInfo> = {
  sano:     { label: 'Sano',     badge_classes: 'bg-green-100  text-green-800  border border-green-200',  bar_color: '#16a34a', order: 0 },
  leve:     { label: 'Leve',     badge_classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200', bar_color: '#d97706', order: 1 },
  moderado: { label: 'Moderado', badge_classes: 'bg-orange-100 text-orange-800 border border-orange-200', bar_color: '#ea580c', order: 2 },
  severo:   { label: 'Severo',   badge_classes: 'bg-red-100    text-red-800    border border-red-200',    bar_color: '#dc2626', order: 3 },
};

export const ESTADO_GENERAL_CONFIG = {
  optimo:       { label: 'Óptimo',       classes: 'bg-green-100  text-green-800',  icon: '✅' },
  acceptable:   { label: 'Aceptable',    classes: 'bg-blue-100   text-blue-800',   icon: '🔵' },
  comprometido: { label: 'Comprometido', classes: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
  critico:      { label: 'Crítico',      classes: 'bg-red-100    text-red-800',    icon: '🔴' },
};
