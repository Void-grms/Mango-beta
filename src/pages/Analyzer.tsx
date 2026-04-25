import { useState, useCallback } from 'react';
import { FileDown, RotateCcw, Leaf, AlertCircle } from 'lucide-react';
import type { AppState, AnalysisStatus } from '../types/analysis';
import { ImageUploader } from '../components/ImageUploader';
import { AnalysisLoader } from '../components/AnalysisLoader';
import { ReportDisplay } from '../components/ReportDisplay';
import { analyzeMango, OpenRouterError } from '../services/openrouter';
import { generatePDF } from '../services/reportGenerator';
import { processImageFile } from '../utils/imageUtils';

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

export function Analyzer() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // ── Seleccionar imagen ──────────────────────────────────────
  const handleFileSelected = useCallback(async (file: File) => {
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
      const msg = err instanceof OpenRouterError
        ? err.getUserMessage()
        : err instanceof Error
          ? err.message
          : 'Error desconocido. Intenta de nuevo.';

      setState((s) => ({ ...s, analysisStatus: 'error', errorMessage: msg }));
    }
  }, [state.selectedFile, state.imageBase64, state.imageInfo]);

  // ── Nuevo análisis ────────────────────────────────────────────
  const handleNewAnalysis = useCallback(() => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
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
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        {/* Barra de acciones */}
        <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between">
          <button
            onClick={handleNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Nuevo análisis
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-60 transition text-sm font-semibold shadow"
          >
            <FileDown className="w-4 h-4" />
            {isDownloadingPDF ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        </div>

        {/* Informe */}
        <div className="max-w-3xl mx-auto shadow-xl rounded-2xl overflow-hidden">
          <ReportDisplay report={state.report} imageUrl={state.previewUrl} />
        </div>
      </div>
    );
  }

  // ── RENDER: pantalla ANALYZER ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-700 text-white py-5 px-6 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Leaf className="w-8 h-8 text-green-300" />
          <div>
            <h1 className="text-xl font-bold leading-tight">
              Diagnóstico de Enfermedades de Mango
            </h1>
            <p className="text-green-300 text-sm">ARAExport S.A.C. — Sistema Beta · Análisis con Sistema</p>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Cuerpo: uploader o loader */}
          <div className="p-6">
            {isAnalyzing ? (
              <AnalysisLoader />
            ) : (
              <>
                <h2 className="text-base font-semibold text-gray-700 mb-1">
                  Sube una fotografía del mango
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  El Sistema analizará la imagen e identificará posibles enfermedades,
                  nivel de severidad y aptitud para exportación.
                </p>
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
          {state.errorMessage && (
            <div className="mx-6 mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{state.errorMessage}</p>
            </div>
          )}

          {/* Botón analizar */}
          {!isAnalyzing && (
            <div className="px-6 pb-6">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full py-3 rounded-xl font-semibold text-white text-base
                  bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-colors shadow-sm"
              >
                {state.selectedFile && !state.imageBase64
                  ? 'Procesando imagen...'
                  : 'Analizar en el Sistema'
                }
              </button>
              {!state.selectedFile && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  Selecciona una imagen para habilitar el análisis
                </p>
              )}
            </div>
          )}
        </div>

        {/* Nota informativa */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Sistema beta — El análisis puede tardar entre 5 y 15 segundos dependiendo de la conexión.<br />
          Los resultados son orientativos. Confirmar con agrónomo especialista.
        </p>
      </main>
    </div>
  );
}
