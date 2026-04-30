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
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
        <div className="w-20 h-20 bg-white border border-border rounded-2xl flex items-center justify-center relative card-shadow">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-text-primary font-outfit mb-3">Analizando imagen</h3>
      <p className="text-sm text-text-muted min-h-[20px] transition-all duration-300 font-medium">
        {MESSAGES[msgIndex]}
      </p>
      
      {/* Barra de progreso indeterminada */}
      <div className="mt-8 w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full w-1/3 animate-[progress_1.5s_ease-in-out_infinite]" />
      </div>
      
      <style>{`
        @keyframes progress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
