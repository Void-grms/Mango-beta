import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const MESSAGES = [
  'Preparando imagen para análisis...',
  'Enviando al Sistema...',
  'Analizando características visuales del fruto...',
  'Identificando posibles enfermedades...',
  'Evaluando nivel de severidad...',
  'Generando recomendaciones agronómicas...',
  'Construyendo el informe de diagnóstico...',
];

export function AnalysisLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <p className="text-lg font-medium text-gray-700 mb-2">Analizando imagen...</p>
      <p className="text-sm text-gray-500 min-h-[20px] transition-all">{MESSAGES[msgIndex]}</p>
      {/* Barra de progreso indeterminada */}
      <div className="mt-6 w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full"
             style={{ animation: 'progress 2s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes progress {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
