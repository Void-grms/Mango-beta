import type { MangoAnalysisReport } from '../types/analysis';
import { DISEASES, ESTADO_GENERAL_CONFIG } from '../constants/diseases';
import { DiseaseCard } from './DiseaseCard';
import { formatDate } from '../utils/formatters';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import isotipo from '../assets/isotipo.png';
import imagotipo from '../assets/imagotipo.png';

interface Props {
  report:   MangoAnalysisReport;
  imageUrl: string;
}

export function ReportDisplay({ report, imageUrl }: Props) {
  const estadoConfig = ESTADO_GENERAL_CONFIG[report.estado_general];
  const diseaseInfo  = DISEASES[report.diagnostico_principal.codigo];

  return (
    <div id="mango-report" className="bg-white rounded-2xl w-full text-text-primary font-inter card-shadow-lg border border-border overflow-hidden">

      {/* ── ENCABEZADO ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary to-primary-light border-b border-border p-6 rounded-t-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <img src={isotipo} alt="" className="w-32 h-32 object-contain invert" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
          <div>
            <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-200 animate-pulse" />
              ARAExport S.A.C. — Sistema Beta v1.0
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white mb-2 tracking-tight">Informe de Diagnóstico Fitosanitario</h1>
            <p className="text-white/70 text-sm font-medium">Mango (Mangifera indica) — Análisis Inteligente</p>
          </div>
          <div className="text-left md:text-right text-xs text-white/60 space-y-1.5 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <p className="font-mono">ID: {report.id_sesion.slice(0, 8).toUpperCase()}</p>
            <p>{formatDate(report.fecha_analisis)}</p>
            <p className="text-white/80">Análisis Generado por el sistema</p>
          </div>
        </div>
        
        {/* Datos del archivo */}
        <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-xs text-white/60">
          <div className="flex flex-col">
            <span className="uppercase tracking-wider opacity-70 mb-1">Archivo analizado</span>
            <span className="text-white font-medium truncate pr-4">{report.nombre_archivo}</span>
          </div>
          <div className="flex flex-col">
            <span className="uppercase tracking-wider opacity-70 mb-1">Resolución de entrada</span>
            <span className="text-white font-medium">{report.resolucion_imagen}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">

        {/* ── IMAGEN + ESTADO GENERAL ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Imagen analizada */}
          <div className="rounded-2xl overflow-hidden border border-border bg-surface-alt flex flex-col">
            <div className="flex-1 flex items-center justify-center p-2">
              <img src={imageUrl} alt="Mango analizado" className="w-full h-auto object-contain max-h-64 rounded-xl" />
            </div>
            <div className="text-center text-xs text-text-muted py-3 bg-surface-alt border-t border-border font-medium tracking-wide">
              Muestra fotográfica analizada
            </div>
          </div>

          {/* Estado general + aptitud */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5 bg-surface-alt border border-border relative overflow-hidden group hover:shadow-md transition-shadow">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-semibold">Evaluación Global</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{estadoConfig.icon}</span>
                <span className="text-2xl font-bold font-outfit text-text-primary">{estadoConfig.label}</span>
              </div>
            </div>

            <div className={`rounded-2xl p-5 border relative overflow-hidden ${
              report.apto_exportacion 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="absolute -right-4 -top-4 opacity-10">
                {report.apto_exportacion ? <CheckCircle className="w-24 h-24" /> : <XCircle className="w-24 h-24" />}
              </div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-semibold relative z-10">Aptitud para exportación</p>
              <div className="flex items-center gap-3 relative z-10">
                {report.apto_exportacion
                  ? <CheckCircle className="w-7 h-7 text-primary" />
                  : <XCircle    className="w-7 h-7 text-red-500"   />
                }
                <span className={`text-2xl font-black font-outfit tracking-wide ${report.apto_exportacion ? 'text-primary' : 'text-red-500'}`}>
                  {report.apto_exportacion ? 'APTO' : 'NO APTO'}
                </span>
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-surface-alt border border-border">
              <div className="flex justify-between items-end mb-3">
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Área total afectada</p>
                <p className="text-2xl font-bold font-outfit text-text-primary leading-none">
                  {report.porcentaje_area_total_afectada}
                  <span className="text-sm text-text-muted ml-1">%</span>
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full relative transition-all duration-1000"
                  style={{
                    width: `${Math.min(report.porcentaje_area_total_afectada, 100)}%`,
                    backgroundColor: diseaseInfo.color_hex,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── DIAGNÓSTICO PRINCIPAL ──────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-border flex-1" />
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest px-4">
              Diagnóstico Principal
            </h2>
            <div className="h-px bg-border flex-1" />
          </div>
          <DiseaseCard disease={report.diagnostico_principal} isPrimary />
        </section>

        {/* ── DIAGNÓSTICOS SECUNDARIOS ───────────────────────── */}
        {report.diagnosticos_secundarios.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 mt-8">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest px-4">
                Diagnósticos Secundarios
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>
            <div className="space-y-3">
              {report.diagnosticos_secundarios.map((d, i) => (
                <DiseaseCard key={i} disease={d} />
              ))}
            </div>
          </section>
        )}

        {/* ── DESCRIPCIÓN GENERAL ────────────────────────────── */}
        <section className="bg-surface-alt rounded-2xl p-6 border border-border">
          <h2 className="text-sm font-bold font-outfit text-text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            Descripción general del fruto
          </h2>
          <p className="text-text-primary leading-relaxed text-sm md:text-base">{report.descripcion_general}</p>
        </section>

        {/* ── RECOMENDACIONES ────────────────────────────────── */}
        {report.recomendaciones.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5 mt-8">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest px-4">
                Recomendaciones Agronómicas
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>
            <div className="grid gap-4">
              {report.recomendaciones.map((rec, i) => {
                const isHigh = rec.prioridad === 'alta';
                return (
                  <div key={i} className={`rounded-2xl p-5 border relative overflow-hidden ${
                    isHigh ? 'bg-red-50 border-red-200' : 'bg-surface-alt border-border'
                  }`}>
                    {isHigh && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        isHigh ? 'bg-red-500 text-white' : 
                        rec.prioridad === 'media' ? 'bg-yellow-500 text-white' : 
                        'bg-blue-500 text-white'
                      }`}>
                        Prioridad {rec.prioridad}
                      </span>
                      <span className="text-xs font-medium text-text-muted bg-white rounded-full px-3 py-1 border border-border">
                        {rec.plazo}
                      </span>
                    </div>
                    <p className="text-text-primary font-medium text-base mb-2">{rec.accion}</p>
                    {rec.producto_sugerido && (
                      <p className="text-sm text-text-muted">
                        Producto sugerido: <span className="font-semibold text-primary ml-1">{rec.producto_sugerido}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── OBSERVACIONES ADICIONALES ──────────────────────── */}
        {report.observaciones_adicionales.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 mt-8">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest px-4">
                Observaciones Adicionales
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>
            <ul className="space-y-3">
              {report.observaciones_adicionales.map((obs, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-primary bg-surface-alt p-4 rounded-xl border border-border">
                  <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{obs}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── ADVERTENCIAS ────────────────────────────────────── */}
        {report.advertencias.length > 0 && (
          <section className="bg-amber-50 rounded-2xl p-5 border border-amber-200 mt-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold font-outfit text-amber-700 uppercase tracking-widest">
                Advertencias del sistema
              </h2>
            </div>
            <ul className="space-y-2">
              {report.advertencias.map((adv, i) => (
                <li key={i} className="text-sm text-amber-700 flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── PIE DEL INFORME ─────────────────────────────────── */}
        <div className="mt-12 border-t border-border pt-8 pb-4 text-xs text-text-muted text-center space-y-2">
          <div className="flex justify-center mb-4">
             <img src={imagotipo} alt="" className="h-8 opacity-40 grayscale" />
          </div>
          <p>Generado por el Sistema de Diagnóstico Fitosanitario — ARAExport S.A.C.</p>
          <p>Universidad Privada Antenor Orrego — Facultad de Ingeniería · Trujillo, Perú</p>
          <p className="text-amber-600 font-medium max-w-lg mx-auto bg-amber-50 p-2 rounded border border-amber-100 mt-2">
            ⚠️ Este informe es emitido por vision computacional y es de carácter orientativo. Confirmar con un agrónomo especialista antes de tomar decisiones sobre el lote.
          </p>
          <div className="flex justify-center gap-4 mt-4 opacity-50">
            <span>Sesión: {report.id_sesion.slice(0,12)}</span>
            <span>Versión: {report.version_beta}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
