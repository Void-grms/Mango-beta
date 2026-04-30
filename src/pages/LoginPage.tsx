import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { User as UserIcon, Lock, AlertCircle, Leaf, ArrowLeft } from 'lucide-react';
import { authService } from '../auth/authService';
import type { User } from '../types/auth';
import gsap from 'gsap';

interface Props {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.login-icon', { opacity: 0, scale: 0.5, duration: 0.6, ease: 'back.out(1.7)' });
      gsap.from('.login-title', { opacity: 0, y: 20, duration: 0.5, delay: 0.15, ease: 'power3.out' });
      gsap.from('.login-card', { opacity: 0, y: 30, duration: 0.6, delay: 0.3, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const user = authService.login(username, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-surface-alt flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Botón volver */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-text-muted hover:text-primary transition-colors z-20 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Volver</span>
      </button>

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      <div className={`sm:mx-auto sm:w-full sm:max-w-md relative z-10 ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="login-icon flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
            <Leaf className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="login-title mt-6 text-center text-3xl font-extrabold text-text-primary font-outfit">
          ARAExport S.A.C.
        </h2>
        <p className="login-title mt-2 text-center text-sm text-text-muted">
          Sistema de Diagnóstico Fitosanitario de Mango
        </p>
      </div>

      <div className="login-card mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-lg shadow-black/5 sm:rounded-2xl sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary">
                Usuario
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-surface-alt text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                  placeholder="Ingrese su usuario"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-surface-alt text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                  placeholder="Ingrese su contraseña"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-700">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:shadow-md"
              >
                Iniciar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
