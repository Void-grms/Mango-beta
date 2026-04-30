interface Props { value: number; color: string }

export function ConfidenceBar({ value, color }: Props) {
  const pct = Math.round(value * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Confianza del Sistema</span>
        <span className="text-sm font-bold text-text-primary">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
