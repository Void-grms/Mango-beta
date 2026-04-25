interface Props {
  value: number; // 0.0 – 1.0
  color?: string;
}

export function ConfidenceBar({ value, color = '#16a34a' }: Props) {
  const pct = Math.round(value * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Confianza del Sistema</span>
        <span className="text-sm font-semibold text-gray-700">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
