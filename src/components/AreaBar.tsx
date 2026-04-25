interface Props {
  value: number; // 0 – 100 (porcentaje)
}

// Color varía según el porcentaje
function getColor(pct: number): string {
  if (pct === 0)  return '#16a34a';
  if (pct <= 10)  return '#d97706';
  if (pct <= 30)  return '#ea580c';
  return '#dc2626';
}

export function AreaBar({ value }: Props) {
  const color = getColor(value);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Área afectada</span>
        <span className="text-sm font-semibold text-gray-700">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
