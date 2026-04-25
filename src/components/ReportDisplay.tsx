import type { MangoAnalysisReport } from '../types/analysis';
import { DISEASES, ESTADO_GENERAL_CONFIG } from '../constants/diseases';
import { DiseaseCard } from './DiseaseCard';
import { formatDate } from '../utils/formatters';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface Props {
  report:   MangoAnalysisReport;
  imageUrl: string;
}

const PRIORITY_CONFIG = {
  alta:  { label: 'Alta',  classes: 'bg-red-50    border-red-300',    dot: 'bg-red-500'    },
  media: { label: 'Media', classes: 'bg-yellow-50 border-yellow-300', dot: 'bg-yellow-500' },
  baja:  { label: 'Baja',  classes: 'bg-blue-50   border-blue-300',   dot: 'bg-blue-400'   },
};

export function ReportDisplay({ report, imageUrl }: Props) {
  const estadoConfig = ESTADO_GENERAL_CONFIG[report.estado_general];
  const diseaseInfo  = DISEASES[report.diagnostico_principal.codigo];

  return (
    <div id="mango-report" className="bg-white max-w-3xl mx-auto">

      {/* ── ENCABEZADO ─────────────────────────────────────── */}
      <div className="bg-green-700 text-white p-6 rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-1">
              ARAExport S.A.C. — Sistema Beta v1.0
            </p>
            <h1 className="text-2xl font-bold mb-1">Informe de Diagnóstico Fitosanitario</h1>
            <p className="text-green-200 text-sm">Mango (Mangifera indica) — Análisis del Sistema</p>
          </div>
          <div className="text-right text-xs text-green-300 space-y-1">
            <p>ID: {report.id_sesion.slice(0, 8).toUpperCase()}</p>
            <p>{formatDate(report.fecha_analisis)}</p>
            <p>Análisis del Sistema</p>
          </div>
        </div>
        {/* Datos del archivo */}
        <div className="mt-4 pt-4 border-t border-green-600 grid grid-cols-2 gap-2 text-xs text-green-200">
          <span>Archivo: <span className="text-white font-medium">{report.nombre_archivo}</span></span>
          <span>Resolución: <span className="text-white font-medium">{report.resolucion_imagen}</span></span>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── IMAGEN + ESTADO GENERAL ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Imagen analizada */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <img src={imageUrl} alt="Mango analizado" className="w-full object-cover max-h-56" />
            <p className="text-center text-xs text-gray-400 py-2 bg-gray-50">Imagen analizada</p>
          </div>

          {/* Estado general + aptitud */}
          <div className="space-y-3">
            <div className={`rounded-xl p-4 ${estadoConfig.classes}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estado general</p>
              <p className="text-2xl font-bold text-gray-800">
                {estadoConfig.icon} {estadoConfig.label}
              </p>
            </div>

            <div className={`rounded-xl p-4 border ${report.apto_exportacion ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Aptitud para exportación</p>
              <div className="flex items-center gap-2">
                {report.apto_exportacion
                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                  : <XCircle    className="w-6 h-6 text-red-600"   />
                }
                <span className={`text-xl font-bold ${report.apto_exportacion ? 'text-green-700' : 'text-red-700'}`}>
                  {report.apto_exportacion ? 'APTO' : 'NO APTO'}
                </span>
              </div>
            </div>

            <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Área total afectada</p>
              <p className="text-3xl font-bold text-gray-800">
                {report.porcentaje_area_total_afectada}
                <span className="text-lg text-gray-500">%</span>
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Diagnóstico principal
          </h2>
          <DiseaseCard disease={report.diagnostico_principal} isPrimary />
        </section>

        {/* ── DIAGNÓSTICOS SECUNDARIOS ───────────────────────── */}
        {report.diagnosticos_secundarios.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Diagnósticos secundarios
            </h2>
            <div className="space-y-3">
              {report.diagnosticos_secundarios.map((d, i) => (
                <DiseaseCard key={i} disease={d} />
              ))}
            </div>
          </section>
        )}

        {/* ── DESCRIPCIÓN GENERAL ────────────────────────────── */}
        <section className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Descripción general del fruto
          </h2>
          <p className="text-gray-700 leading-relaxed">{report.descripcion_general}</p>
        </section>

        {/* ── RECOMENDACIONES ────────────────────────────────── */}
        {report.recomendaciones.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recomendaciones agronómicas
            </h2>
            <div className="space-y-3">
              {report.recomendaciones.map((rec, i) => {
                const pConfig = PRIORITY_CONFIG[rec.prioridad];
                return (
                  <div key={i} className={`rounded-xl p-4 border ${pConfig.classes}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${pConfig.dot}`} />
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        Prioridad {pConfig.label}
                      </span>
                      <span className="ml-auto text-xs text-gray-500 bg-white rounded-full px-2 py-0.5 border">
                        {rec.plazo}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">{rec.accion}</p>
                    {rec.producto_sugerido && (
                      <p className="text-sm text-gray-500 mt-1">
                        Producto: <span className="font-medium text-gray-700">{rec.producto_sugerido}</span>
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Observaciones adicionales
            </h2>
            <ul className="space-y-1">
              {report.observaciones_adicionales.map((obs, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  {obs}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── ADVERTENCIAS ────────────────────────────────────── */}
        {report.advertencias.length > 0 && (
          <section className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider">
                Advertencias del sistema
              </h2>
            </div>
            <ul className="space-y-1">
              {report.advertencias.map((adv, i) => (
                <li key={i} className="text-sm text-amber-700">• {adv}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ── PIE DEL INFORME ─────────────────────────────────── */}
        <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 text-center space-y-1">
          <p>Generado por el Sistema Beta de Diagnóstico de Mango — ARAExport S.A.C.</p>
          <p>Universidad Privada Antenor Orrego — Facultad de Ingeniería · Trujillo, Perú</p>
          <p className="text-amber-600 font-medium">
            ⚠️ Este informe es orientativo. Confirmar con agrónomo especialista antes de tomar decisiones de lote.
          </p>
          <p>ID de sesión: {report.id_sesion} · Versión: {report.version_beta}</p>
        </div>

      </div>
    </div>
  );
}
