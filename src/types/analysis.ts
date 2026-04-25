export type DiseaseCode =
  | 'sano'
  | 'antracnosis'
  | 'oidio'
  | 'pudricion_pedunculo'
  | 'otras_lesiones';

export type SeverityLevel = 'sano' | 'leve' | 'moderado' | 'severo';

export type EstadoGeneral = 'optimo' | 'acceptable' | 'comprometido' | 'critico';

export interface DetectedDisease {
  codigo: DiseaseCode;
  nombre: string;
  nombre_cientifico: string | null;
  confianza: number;           // 0.0 – 1.0
  severidad: SeverityLevel;
  porcentaje_area: number;     // 0 – 100 (número entero)
  descripcion_visual: string;  // Texto que describe lo que observó el Sistema
}

export interface Recomendacion {
  prioridad: 'alta' | 'media' | 'baja';
  accion: string;
  producto_sugerido: string | null;
  plazo: string; // Ej: "Inmediato", "Dentro de 48 horas", "Preventivo"
}

export interface MangoAnalysisReport {
  // Metadatos (se completan en el frontend, NO vienen del Sistema)
  id_sesion: string;
  fecha_analisis: string;       // ISO 8601
  nombre_archivo: string;
  resolucion_imagen: string;    // "1536×1152 px"
  version_beta: string;
  modelo_ia: string;

  // Resultado principal (viene del Sistema)
  diagnostico_principal: DetectedDisease;
  diagnosticos_secundarios: DetectedDisease[];

  // Evaluación global (viene del Sistema)
  estado_general: EstadoGeneral;
  apto_exportacion: boolean;
  porcentaje_area_total_afectada: number;

  // Narrativa (viene del Sistema)
  descripcion_general: string;
  observaciones_adicionales: string[];
  recomendaciones: Recomendacion[];
  advertencias: string[];
}

// Estado interno de la aplicación
export type AppScreen = 'ANALYZER' | 'REPORT';

export type AnalysisStatus =
  | 'idle'
  | 'validating'
  | 'sending'
  | 'processing'
  | 'complete'
  | 'error';

export interface ImageInfo {
  base64: string;
  mediaType: string;
  width: number;
  height: number;
  sizeBytes: number;
  resolutionString: string;
}

export interface AppState {
  screen: AppScreen;
  selectedFile: File | null;
  previewUrl: string | null;
  imageBase64: string | null;
  imageInfo: ImageInfo | null;
  analysisStatus: AnalysisStatus;
  report: MangoAnalysisReport | null;
  errorMessage: string | null;
}
