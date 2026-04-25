import type { SeverityLevel } from '../types/analysis';
import { SEVERITY_CONFIG } from '../constants/diseases';

interface Props {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityBadge({ severity, size = 'md' }: Props) {
  const config = SEVERITY_CONFIG[severity];
  const sizeClasses = {
    sm:  'text-xs px-2 py-0.5',
    md:  'text-sm px-2.5 py-1',
    lg:  'text-base px-3 py-1.5 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.badge_classes} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
