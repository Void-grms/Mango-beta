import { useState, useCallback, useEffect, useRef } from 'react';
import { FileDown, RotateCcw, Leaf, AlertCircle, ArrowLeft } from 'lucide-react';
import type { AppState, AnalysisStatus } from '../types/analysis';
import { ImageUploader } from '../components/ImageUploader';
import { AnalysisLoader } from '../components/AnalysisLoader';
import { ReportDisplay } from '../components/ReportDisplay';
import { analyzeMango, OpenRouterError } from '../services/openrouter';
import { generatePDF } from '../services/reportGenerator';
import { processImageFile } from '../utils/imageUtils';
import { MangoValidationError } from '../utils/errors';
import gsap from 'gsap';

const INITIAL_STATE: AppState = {
  screen:         'ANALYZER',
  selectedFile:   null,
  previewUrl:     null,
  imageBase64:    null,
  imageInfo:      null,
  analysisStatus: 'idle',
  report:         null,
  errorMessage:   null,
};

interface Props {
  onBack: () => void;
}

export function Analyzer({ onBack }: Props) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isNotMangoError, setIsNotMangoError] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.analyzer-header', { opacity: 0, y: -20, duration: 0.5, ease: 'power3.out' });
      gsap.from('.analyzer-body', { opacity: 0, y: 30, duration: 0.6, delay: 0.15, ease: 'power3.out' });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  // ── Seleccionar imagen ──────────────────────────────────────
  const handleFileSelected = useCallback(async (file: File) => {
    setIsNotMangoError(false);
    const previewUrl = URL.createObjectURL(file);
    setState((s) => ({
      ...s,
      selectedFile:   file,
      previewUrl,
      imageBase64:    null,
      imageInfo:      null,
      analysisStatus: 'idle',
      errorMessage:   null,
      report:         null,
    }));

    // Procesar en background (resize + base64)
    try {
      const info = await processImageFile(file);
      setState((s) => ({ ...s, imageBase64: info.base64, imageInfo: info }));
    } catch {
      setState((s) => ({
        ...s,
        errorMessage:   'No se pudo procesar la imagen. Intenta con otro archivo.',
        analysisStatus: 'error',
      }));
    }
  }, []);

  // ── Limpiar selección ───────────────────────────────────────
  const handleClear = useCallback(() => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    setIsNotMangoError(false);
    setState(INITIAL_STATE);
  }, [state.previewUrl]);

  // ── Analizar ─────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!state.selectedFile || !state.imageBase64 || !state.imageInfo) return;

    setState((s) => ({ ...s, analysisStatus: 'sending', errorMessage: null }));

    try {
      const report = await analyzeMango(
        state.imageBase64,
        state.imageInfo.mediaType,
        state.selectedFile.name,
        state.imageInfo.resolutionString,
      );

      setState((s) => ({
        ...s,
        screen:         'REPORT',
        analysisStatus: 'complete',
        report,
      }));

    } catch (err) {
      if (err instanceof MangoValidationError) {
        setIsNotMangoError(true);
        setState((s) => ({ ...s, analysisStatus: 'error', errorMessage: 'NOT_A_MANGO' }));
      } else {
        const msg = err instanceof OpenRouterError
          ? err.getUserMessage()
          : err instanceof Error
            ? err.message
            : 'Error desconocido. Intenta de nuevo.';
        setState((s) => ({ ...s, analysisStatus: 'error', errorMessage: msg }));
      }
    }
  }, [state.selectedFile, state.imageBase64, state.imageInfo]);

  // ── Nuevo análisis ────────────────────────────────────────────
  const handleNewAnalysis = useCallback(() => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    setIsNotMangoError(false);
    setState(INITIAL_STATE);
  }, [state.previewUrl]);

  // ── Descargar PDF ─────────────────────────────────────────────
  const handleDownloadPDF = useCallback(async () => {
    if (!state.report) return;
    setIsDownloadingPDF(true);
    try {
      await generatePDF(state.report);
    } catch (err: any) {
      console.error("Error al generar PDF:", err);
      alert(`No se pudo generar el PDF. Error: ${err?.message || 'Revisa la consola'}`);
    } finally {
      setIsDownloadingPDF(false);
    }
  }, [state.report]);

  const isAnalyzing = (['sending', 'processing', 'validating'] as AnalysisStatus[]).includes(state.analysisStatus);
  const canAnalyze  = !!state.selectedFile && !!state.imageBase64 && !isAnalyzing;

  // ── RENDER: pantalla REPORT ───────────────────────────────────
  if (state.screen === 'REPORT' && state.report && state.previewUrl) {
    return (
      <div className="min-h-screen bg-surface-alt py-8 px-4 font-inter text-text-primary">
        {/* Barra de acciones */}
        <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary-50 transition-colors text-sm font-medium self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleNewAnalysis}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-text-primary hover:bg-surface-alt transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Nuevo
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white disabled:opacity-60 transition-colors text-sm font-semibold shadow-md shadow-primary/15"
            >
              <FileDown className="w-4 h-4" />
              {isDownloadingPDF ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>
        </div>

        {/* Informe */}
        <div className="max-w-3xl mx-auto">
          <ReportDisplay report={state.report} imageUrl={state.previewUrl} />
        </div>
      </div>
    );
  }

  // ── RENDER: pantalla ANALYZER ─────────────────────────────────
  return (
    <div ref={mainRef} className="min-h-screen bg-surface-alt flex flex-col font-inter">
      {/* Header */}
      <header className="analyzer-header sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-outfit text-text-primary leading-tight">
                Diagnóstico de Mango
              </h1>
              <p className="text-text-muted text-xs">Análisis con IA</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-muted hover:text-primary text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver al inicio</span>
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="analyzer-body flex-1 w-full max-w-2xl mx-auto py-10 px-4 flex flex-col justify-center">
        <div className="bg-white rounded-2xl overflow-hidden card-shadow-lg border border-border">

          {/* Cuerpo: uploader o loader */}
          <div className="p-8">
            {isAnalyzing ? (
              <AnalysisLoader />
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold font-outfit text-text-primary mb-2">
                    Subir fotografía del fruto
                  </h2>
                  <p className="text-sm text-text-muted max-w-md mx-auto">
                    El sistema procesará la imagen con inteligencia artificial para identificar patologías y evaluar la aptitud de exportación.
                  </p>
                </div>
                <ImageUploader
                  onFileSelected={handleFileSelected}
                  previewUrl={state.previewUrl}
                  selectedFile={state.selectedFile}
                  onClear={handleClear}
                  disabled={isAnalyzing}
                />
              </>
            )}
          </div>

          {/* Mensaje de error */}
          {(state.errorMessage || isNotMangoError) && (
            <div className={`mx-6 mb-4 p-3 rounded-lg border flex items-start gap-3 ${
              isNotMangoError ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
            }`}>
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                isNotMangoError ? 'text-amber-500' : 'text-red-500'
              }`} />
              <div className="flex-1">
                <p className={`text-sm ${
                  isNotMangoError ? 'text-amber-800 font-medium' : 'text-red-700'
                }`}>
                  {isNotMangoError
                    ? '🥭 La imagen procesada no parece ser un mango. Por favor sube una foto válida.'
                    : state.errorMessage}
                </p>
                {isNotMangoError && (
                  <button
                    onClick={handleClear}
                    className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded transition-colors"
                  >
                    Subir otra imagen
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Botón analizar */}
          {!isAnalyzing && (
            <div className="px-8 pb-8 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full py-4 rounded-xl font-bold text-white text-base
                  bg-primary hover:bg-primary-light disabled:bg-gray-100 disabled:text-text-muted disabled:cursor-not-allowed
                  transition-all shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:shadow-none"
              >
                {state.selectedFile && !state.imageBase64
                  ? 'Procesando imagen...'
                  : 'Analizar con Inteligencia Artificial'
                }
              </button>
              {!state.selectedFile && (
                <p className="text-center text-xs text-text-muted mt-3">
                  Selecciona una imagen para habilitar el análisis
                </p>
              )}
            </div>
          )}
        </div>

        {/* Nota informativa */}
        <p className="text-center text-xs text-text-muted mt-8">
          Sistema beta — El análisis puede tardar entre 5 y 15 segundos dependiendo de la conexión.<br />
          Los resultados son orientativos. Confirmar con agrónomo especialista.
        </p>
      </main>
    </div>
  );
}
