import type { DetectedDisease } from '../types/analysis';
import { DISEASES, SEVERITY_CONFIG } from '../constants/diseases';
import { SeverityBadge } from './SeverityBadge';
import { ConfidenceBar } from './ConfidenceBar';
import { AreaBar } from './AreaBar';

interface Props {
  disease: DetectedDisease;
  isPrimary?: boolean;
}

export function DiseaseCard({ disease, isPrimary = false }: Props) {
  const info     = DISEASES[disease.codigo];
  const sevColor = SEVERITY_CONFIG[disease.severidad].bar_color;

  return (
    <div className={`rounded-xl border-2 ${info.border_classes} ${info.bg_classes} p-4 ${isPrimary ? 'shadow-md' : ''}`}>
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-bold ${isPrimary ? 'text-lg' : 'text-base'} text-gray-800`}>
            {info.nombre_es}
          </h3>
          {info.nombre_cientifico && (
            <p className="text-xs text-gray-500 italic">{info.nombre_cientifico}</p>
          )}
        </div>
        <SeverityBadge severity={disease.severidad} size={isPrimary ? 'lg' : 'md'} />
      </div>

      {/* Barras de métricas */}
      <div className="space-y-3 mb-3">
        <ConfidenceBar value={disease.confianza} color={sevColor} />
        <AreaBar value={disease.porcentaje_area} />
      </div>

      {/* Descripción visual de la IA */}
      {disease.descripcion_visual && (
        <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-200 pt-3 mt-3">
          "{disease.descripcion_visual}"
        </p>
      )}
    </div>
  );
}
