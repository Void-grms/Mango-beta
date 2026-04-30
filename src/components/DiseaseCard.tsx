import type { DetectedDisease } from '../types/analysis';
import { DISEASES, SEVERITY_CONFIG } from '../constants/diseases';
import { ConfidenceBar } from './ConfidenceBar';
import { AreaBar } from './AreaBar';
import { SeverityBadge } from './SeverityBadge';

interface Props {
  disease: DetectedDisease;
  isPrimary?: boolean;
}

export function DiseaseCard({ disease, isPrimary = false }: Props) {
  const info     = DISEASES[disease.codigo];
  const sevColor = SEVERITY_CONFIG[disease.severidad].bar_color;

  return (
    <div className={`rounded-2xl border ${info.border_classes} ${info.bg_classes} p-5 ${isPrimary ? 'card-shadow' : ''}`}>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${info.badge_classes}`}>
              {info.codigo === 'sano' ? 'Saludable' : 'Patología'}
            </span>
          </div>
          <h3 className={`font-bold font-outfit ${isPrimary ? 'text-xl' : 'text-lg'} text-text-primary`}>
            {info.nombre_es}
          </h3>
          {info.nombre_cientifico && (
            <p className="text-sm text-text-muted italic mt-0.5">{info.nombre_cientifico}</p>
          )}
        </div>
        <div className="self-start">
          <SeverityBadge severity={disease.severidad} size={isPrimary ? 'lg' : 'md'} />
        </div>
      </div>

      {/* Barras de métricas */}
      <div className="space-y-4 mb-4">
        <ConfidenceBar value={disease.confianza} color={sevColor} />
        <AreaBar value={disease.porcentaje_area} />
      </div>

      {/* Descripción visual de la IA */}
      {disease.descripcion_visual && (
        <div className="mt-5 pt-4 border-t border-border relative">
          <p className="text-sm text-text-primary/80 leading-relaxed italic relative z-10">
            "{disease.descripcion_visual}"
          </p>
        </div>
      )}
    </div>
  );
}
