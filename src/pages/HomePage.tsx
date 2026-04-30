import { useEffect, useRef } from 'react';
import { LogOut, ArrowRight, ShieldCheck, FileText, Globe, LogIn, Zap, BarChart3, Leaf } from 'lucide-react';
import type { User } from '../types/auth';
import { DISEASES } from '../constants/diseases';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import isotipo from '../assets/isotipo.png';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  user: User | null;
  onLogout: () => void;
  onGoToAnalyzer: () => void;
  onGoToLogin: () => void;
}

export function HomePage({ user, onLogout, onGoToAnalyzer, onGoToLogin }: Props) {
  const diseasesList = Object.values(DISEASES).filter(d => d.codigo !== 'sano' && d.codigo !== 'otras_lesiones');

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const diseasesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, delay: 0.1, ease: 'power3.out' });
      gsap.from('.hero-title', { opacity: 0, y: 30, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.from('.hero-desc', { opacity: 0, y: 20, duration: 0.7, delay: 0.4, ease: 'power3.out' });
      gsap.from('.hero-buttons', { opacity: 0, y: 20, duration: 0.7, delay: 0.55, ease: 'power3.out' });
      gsap.from('.hero-visual', { opacity: 0, x: 60, scale: 0.95, duration: 1, delay: 0.3, ease: 'power3.out' });
      gsap.from('.hero-float-card', { opacity: 0, y: 30, duration: 0.8, delay: 0.8, ease: 'back.out(1.7)' });

      // Stats counter animation
      if (statsRef.current) {
        const statItems = statsRef.current.querySelectorAll('.stat-item');
        gsap.set(statItems, { opacity: 1, y: 0 }); // ensure visible
        gsap.from(statItems, {
          scrollTrigger: { trigger: statsRef.current, start: 'top 95%', toggleActions: 'play none none none' },
          opacity: 0, y: 30, stagger: 0.12, duration: 0.6, ease: 'power3.out',
        });
      }

      // Benefits stagger
      if (benefitsRef.current) {
        const benefitItems = benefitsRef.current.querySelectorAll('.benefit-item');
        gsap.set(benefitItems, { opacity: 1, x: 0 });
        gsap.from(benefitItems, {
          scrollTrigger: { trigger: benefitsRef.current, start: 'top 95%', toggleActions: 'play none none none' },
          opacity: 0, x: -30, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        });
        gsap.set('.benefit-image', { opacity: 1, x: 0 });
        gsap.from('.benefit-image', {
          scrollTrigger: { trigger: benefitsRef.current, start: 'top 90%', toggleActions: 'play none none none' },
          opacity: 0, x: 60, duration: 1, ease: 'power3.out',
        });
      }

      // Diseases cards
      if (diseasesRef.current) {
        const diseaseCards = diseasesRef.current.querySelectorAll('.disease-card');
        gsap.set(diseaseCards, { opacity: 1, y: 0 }); // ensure visible as fallback
        gsap.from(diseaseCards, {
          scrollTrigger: { trigger: diseasesRef.current, start: 'top 95%', toggleActions: 'play none none none' },
          opacity: 0, y: 40, stagger: 0.1, duration: 0.6, ease: 'power3.out',
        });
      }

      // CTA section
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { opacity: 1, y: 0 });
        gsap.from(ctaRef.current, {
          scrollTrigger: { trigger: ctaRef.current, start: 'top 95%', toggleActions: 'play none none none' },
          opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen bg-surface flex flex-col font-inter text-text-primary">
      {/* Navegación */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={isotipo} alt="ARAExport Logo" className="h-8 object-contain" />
            <span className="font-outfit font-bold text-xl tracking-tight text-text-primary hidden sm:block">ARAExport</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <a href="#beneficios" className="hidden md:inline text-text-muted hover:text-primary transition-colors px-3 py-2">Beneficios</a>
            <a href="#enfermedades" className="hidden md:inline text-text-muted hover:text-primary transition-colors px-3 py-2">Patologías</a>
            {user ? (
              <>
                <span className="text-text-muted hidden sm:inline">Hola, <span className="text-text-primary font-semibold">{user.displayName}</span></span>
                <button onClick={onLogout} className="flex items-center gap-2 text-text-muted hover:text-red-500 transition-colors px-3 py-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <button
                onClick={onGoToLogin}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-light transition-colors font-medium text-sm shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-40">
        {/* Decorative blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-primary-100/60 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-100 bg-primary-50 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-light animate-pulse" />
              Sistema de predicción de enfermedades en mangos
            </div>
            
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold font-outfit tracking-tight mb-6 leading-[1.1] text-text-primary">
              Asegura la calidad de exportación con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">precisión milimétrica</span>
            </h1>
            
            <p className="hero-desc text-lg text-text-muted mb-10 leading-relaxed max-w-xl">
              Diagnóstico fitosanitario avanzado para Mangifera indica. Detecta patologías en segundos mediante visión artificial y genera reportes listos para certificación internacional.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGoToAnalyzer}
                className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
              >
                Comenzar Análisis
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#beneficios"
                className="px-8 py-4 rounded-xl border border-border bg-white hover:bg-surface-alt text-text-primary font-semibold text-lg flex items-center justify-center transition-colors"
              >
                Conocer más
              </a>
            </div>
          </div>
          
          <div className="hero-visual hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-50 to-accent/5 blur-3xl rounded-full" />
            
            {/* Dashboard Mockup Frame */}
            <div className="relative bg-white rounded-2xl card-shadow-lg border border-border overflow-hidden transform hover:-translate-y-2 transition-all duration-700">
              
              {/* Header del Mockup */}
              <div className="bg-surface-alt border-b border-border p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto bg-white border border-border rounded-md px-4 py-1 text-[10px] text-text-muted font-mono tracking-wider">
                  araexport.com/analyzer
                </div>
              </div>

              {/* Contenido del Mockup */}
              <div className="p-4 grid gap-4">
                {/* Visualizador de Imagen */}
                <div className="relative rounded-xl overflow-hidden border border-border bg-surface-alt aspect-[4/3]">
                  <img 
                    src="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800" 
                    alt="Mangos frescos para análisis" 
                    className="w-full h-full object-cover"
                  />
                  {/* Escáner animado */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/15 to-transparent animate-[scan_3s_ease-in-out_infinite]" />
                  
                  {/* Bounding box simulado */}
                  <div className="absolute top-[15%] left-[20%] w-[55%] h-[65%] border-2 border-dashed border-primary/60 rounded-lg">
                    <span className="absolute -top-6 left-0 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-sm">
                      Sano · 99.8%
                    </span>
                  </div>
                </div>

                {/* Métricas del Mockup */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                    <p className="text-[10px] text-primary/70 uppercase tracking-wider mb-1 font-semibold">Aptitud</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <p className="text-sm font-bold text-primary">Exportable</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-[10px] text-amber-600/70 uppercase tracking-wider mb-1 font-semibold">Velocidad</p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-bold text-amber-700">0.4s / img</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Etiqueta flotante */}
            <div className="hero-float-card absolute -bottom-6 -right-6 bg-white p-4 rounded-xl border border-border flex items-center gap-4 animate-float card-shadow-lg z-20">
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Reporte</p>
                <p className="text-sm font-outfit font-bold text-text-primary">PDF Generado ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cifras (Pruebas Sociales) */}
      <section ref={statsRef} className="border-y border-border bg-surface-alt py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="stat-item px-4">
            <p className="text-3xl font-bold font-outfit text-primary">10+</p>
            <p className="text-sm text-text-muted mt-1">Años exportando</p>
          </div>
          <div className="stat-item px-4">
            <p className="text-3xl font-bold font-outfit text-text-primary">5</p>
            <p className="text-sm text-text-muted mt-1">Enfermedades detectables</p>
          </div>
          <div className="stat-item px-4">
            <p className="text-3xl font-bold font-outfit text-text-primary">&lt; 15s</p>
            <p className="text-sm text-text-muted mt-1">Por análisis</p>
          </div>
          <div className="stat-item px-4">
            <p className="text-3xl font-bold font-outfit text-primary">&gt; 90%</p>
            <p className="text-sm text-text-muted mt-1">De precisión</p>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section ref={benefitsRef} id="beneficios" className="py-28 px-6 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-3">¿Por qué elegirnos?</p>
            <h2 className="text-3xl lg:text-5xl font-bold font-outfit mb-6 leading-tight text-text-primary">
              Revolucionando la agroexportación con tecnología
            </h2>
            <p className="text-lg text-text-muted mb-10 leading-relaxed">
              Nuestro sistema ha sido entrenado con miles de imágenes de Mangifera indica para identificar patologías con una precisión inigualable.
            </p>
            
            <div className="space-y-6">
              <div className="benefit-item flex gap-5 p-4 rounded-xl hover:bg-primary-50/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">Detección Inmediata</h3>
                  <p className="text-text-muted text-sm">Análisis en tiempo real de Antracnosis, Oídio y Pudrición, reduciendo el riesgo de rechazo en destino.</p>
                </div>
              </div>
              
              <div className="benefit-item flex gap-5 p-4 rounded-xl hover:bg-amber-50/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">Reportes Trazables</h3>
                  <p className="text-text-muted text-sm">Generación automática de PDFs con evaluación de severidad y recomendaciones de mitigación agronómica.</p>
                </div>
              </div>

              <div className="benefit-item flex gap-5 p-4 rounded-xl hover:bg-blue-50/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">Mercados Globales</h3>
                  <p className="text-text-muted text-sm">Alineado con normativas fitosanitarias internacionales (SENASA, FDA, EFSA) para asegurar la exportación.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="benefit-image relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-50 to-transparent blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden border border-border card-shadow-lg group">
              <img 
                src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=1000" 
                alt="Mangos frescos en caja de exportación" 
                className="w-full h-[550px] object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent">
                <div className="bg-white p-4 rounded-xl border border-border card-shadow inline-block">
                  <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Innovación
                  </p>
                  <p className="text-text-primary font-medium">Visión computacional aplicada al agro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enfermedades */}
      <section ref={diseasesRef} id="enfermedades" className="py-24 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Catálogo</p>
            <h2 className="text-3xl lg:text-4xl font-bold font-outfit text-text-primary">Patologías Detectables</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {diseasesList.map(disease => (
              <div key={disease.codigo} className="disease-card bg-white p-6 rounded-2xl border border-border card-shadow hover:card-shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start">
                <div className="w-3 h-3 rounded-full mb-4" style={{ backgroundColor: disease.color_hex }} />
                <span className="text-xs font-bold uppercase tracking-wider mb-2 px-2 py-1 rounded-md" style={{ color: disease.color_hex, backgroundColor: `${disease.color_hex}15` }}>
                  {disease.nombre_es}
                </span>
                <h4 className="text-sm italic text-text-muted mb-2">{disease.nombre_cientifico}</h4>
                <p className="text-sm text-text-muted leading-relaxed">{disease.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section ref={ctaRef} className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-amber-50/30" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-8 rotate-6">
            <img src={isotipo} alt="Icon" className="w-10 h-10 object-contain drop-shadow-md invert" />
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold font-outfit mb-6 text-text-primary">Optimiza tu cadena de suministro hoy</h2>
          <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto">Únete a la vanguardia agroindustrial. Realiza tu primer diagnóstico fitosanitario con IA en menos de 15 segundos.</p>
          <button
            onClick={onGoToAnalyzer}
            className="px-10 py-5 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold text-xl inline-flex items-center gap-3 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
          >
            Ir al Analizador de IA
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-text-primary pt-16 pb-8 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <img src={isotipo} alt="ARAExport Logo" className="h-8 object-contain invert" />
                <span className="font-outfit font-bold text-xl tracking-tight text-white">ARAExport</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Líderes en la agroexportación de frutas y hortalizas peruanas, garantizando los más altos estándares internacionales mediante tecnología y sostenibilidad.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 font-outfit">Sistema Beta</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Diagnóstico IA</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Catálogo de Patologías</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reportes Históricos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentación de API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 font-outfit">Investigación</h4>
              <p className="text-sm text-white/60 mb-2">Desarrollado en colaboración con:</p>
              <p className="text-sm font-semibold">Universidad Privada Antenor Orrego</p>
              <p className="text-xs text-white/40">Facultad de Ingeniería · Trujillo, Perú</p>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} ARAExport S.A.C. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Términos Legales</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
