interface Props { value: number }

export function AreaBar({ value }: Props) {
  const color =
    value <= 5  ? '#16a34a' :
    value <= 20 ? '#d97706' :
    value <= 50 ? '#ea580c' :
                  '#dc2626';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Área afectada</span>
        <span className="text-sm font-bold text-text-primary">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
