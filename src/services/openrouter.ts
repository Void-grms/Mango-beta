import type { MangoAnalysisReport } from '../types/analysis';
import {
  VISION_SYSTEM_PROMPT,
  buildVisionUserPrompt,
  EXPERT_SYSTEM_PROMPT,
  buildExpertUserPrompt
} from '../prompts/mangoAnalysisPrompt';
import { generateUUID } from '../utils/formatters';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// La clave y el modelo se leen del .env — nunca del usuario
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const MODEL   = import.meta.env.VITE_OPENROUTER_MODEL   as string;
const EXPERT_MODELS_ENV = import.meta.env.VITE_OPENROUTER_EXPERT_MODELS as string;

/**
 * Error tipado de OpenRouter con mensaje amigable para el usuario.
 */
export class OpenRouterError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'OpenRouterError';
    this.statusCode = statusCode;
  }

  getUserMessage(): string {
    switch (this.statusCode) {
      case 401: return 'Clave API inválida. Verifica VITE_OPENROUTER_API_KEY en el archivo .env.';
      case 402: return 'Créditos insuficientes en OpenRouter. Recarga la cuenta.';
      case 429: return 'Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.';
      case 400: return 'Solicitud inválida. Verifica el formato de la imagen.';
      default:  return `Error de la API (${this.statusCode}): ${this.message}`;
    }
  }
}

// ─── Utilidades de rate-limit ─────────────────────────────────────────────────

/** Espera `ms` milisegundos. */
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Delay mínimo entre llamadas sucesivas a la API para reducir la probabilidad
 * de recibir un 429 antes de que se produzca.
 */
const INTER_CALL_DELAY_MS = 1_500; // 1.5 s

/**
 * Configuración del backoff exponencial.
 * Intentos: 1 inicial + MAX_RETRIES reintentos.
 */
const MAX_RETRIES   = 4;
const BASE_DELAY_MS = 2_000; // 2 s — se duplica en cada intento
const MAX_DELAY_MS  = 32_000; // tope de 32 s

// ─── Llamada base a OpenRouter ────────────────────────────────────────────────

/**
 * Realiza la petición HTTP pura a OpenRouter, sin reintentos.
 * Lanza OpenRouterError en respuestas no-2xx.
 */
async function fetchOpenRouter(model: string, messages: any[]): Promise<string> {
  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type':  'application/json',
        'HTTP-Referer':  'https://araexport.pe',
        'X-Title':       'ARAExport Mango Disease Analyzer Beta',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        messages,
      }),
    });
  } catch {
    throw new Error('No se pudo conectar con OpenRouter. Verifica tu conexión a internet.');
  }

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error?.message ?? errorMsg;
    } catch { /* ignorar */ }
    throw new OpenRouterError(response.status, errorMsg);
  }

  const data = await response.json();
  const rawContent: string = data?.choices?.[0]?.message?.content ?? '';

  if (!rawContent) {
    throw new Error('La API devolvió una respuesta vacía.');
  }

  return rawContent;
}

/**
 * Llama a OpenRouter con reintentos y backoff exponencial para errores 429.
 *
 * Estrategia:
 *   intento 0 → inmediato
 *   intento 1 → espera ~2 s  (BASE_DELAY_MS × 2^0 + jitter)
 *   intento 2 → espera ~4 s  (BASE_DELAY_MS × 2^1 + jitter)
 *   intento 3 → espera ~8 s  …
 *   intento 4 → espera ~16 s …
 * El jitter (±20 %) evita que múltiples pestañas reintenten al mismo tiempo.
 */
async function callOpenRouter(model: string, messages: any[]): Promise<string> {
  let attempt = 0;

  while (true) {
    try {
      return await fetchOpenRouter(model, messages);
    } catch (err) {
      const isRateLimit =
        err instanceof OpenRouterError && err.statusCode === 429;

      if (!isRateLimit || attempt >= MAX_RETRIES) {
        throw err; // error no recuperable o agotados los reintentos
      }

      const expDelay  = BASE_DELAY_MS * Math.pow(2, attempt);
      const jitter    = expDelay * 0.2 * (Math.random() * 2 - 1); // ±20 %
      const waitMs    = Math.min(expDelay + jitter, MAX_DELAY_MS);

      console.warn(
        `[OpenRouter] 429 Rate Limit — reintento ${attempt + 1}/${MAX_RETRIES} ` +
        `en ${(waitMs / 1000).toFixed(1)} s (modelo: ${model})`
      );

      await sleep(waitMs);
      attempt++;
    }
  }
}

/**
 * Envía la imagen a OpenRouter y devuelve el informe completo usando doble modelo.
 * @param imageBase64  - Imagen en base64 (sin prefijo data:...)
 * @param mediaType    - "image/jpeg" | "image/png" | "image/webp"
 * @param filename     - Nombre original del archivo (para el prompt)
 * @param resolutionString - Resolución formateada, ej: "1536×1152 px"
 */
export async function analyzeMango(
  imageBase64: string,
  mediaType: string,
  filename: string,
  resolutionString: string
): Promise<MangoAnalysisReport> {

  if (!API_KEY) {
    throw new Error('VITE_OPENROUTER_API_KEY no está configurada en el archivo .env.');
  }

  // ============== FASE 1: VISIÓN ==============
  const visionModel = MODEL || 'nvidia/nemotron-nano-12b-v2-vl:free';
  const visionMessages = [
    {
      role:    'system',
      content: VISION_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: [
        {
          type:      'image_url',
          image_url: { url: `data:${mediaType};base64,${imageBase64}` },
        },
        {
          type: 'text',
          text: buildVisionUserPrompt(filename),
        },
      ],
    },
  ];

  const visionRawOutput = await callOpenRouter(visionModel, visionMessages);

  // Delay entre la llamada de visión y la del experto para no saturar la API
  await sleep(INTER_CALL_DELAY_MS);
  const visionResult = parseAIResponse(visionRawOutput);


  // ============== FASE 2: EXPERTO (FALLBACKS) ==============
  const defaultExpertModels = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.1-405b-instruct:free',
    'z-ai/glm-4.5-air:free'
  ];
  const expertModels = EXPERT_MODELS_ENV 
    ? EXPERT_MODELS_ENV.split(',').map(m => m.trim())
    : defaultExpertModels;

  const expertMessages = [
    {
      role: 'system',
      content: EXPERT_SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: buildExpertUserPrompt(JSON.stringify(visionResult, null, 2))
    }
  ];

  let expertResult: any = null;
  let lastExpertError: any = null;
  let successExpertModel: string = '';

  for (let i = 0; i < expertModels.length; i++) {
    const expModel = expertModels[i];

    // Delay entre modelos expertos sucesivos (excepto el primero)
    if (i > 0) await sleep(INTER_CALL_DELAY_MS);

    try {
      const expertRawOutput = await callOpenRouter(expModel, expertMessages);
      expertResult = parseAIResponse(expertRawOutput);
      successExpertModel = expModel;
      break; // Éxito, salir del loop
    } catch (err) {
      lastExpertError = err;
      console.warn(`Falló el modelo experto ${expModel}:`, err);
      // Intentar con el siguiente
    }
  }

  if (!expertResult) {
    // Si todos los modelos fallaron, devolvemos un reporte parcial o lanzamos error
    throw new Error('Fallaron todos los modelos expertos para generar recomendaciones: ' + (lastExpertError?.message || 'Error desconocido'));
  }

  // ============== FASE 3: COMBINAR ==============
  const report: MangoAnalysisReport = {
    ...visionResult,
    ...expertResult,
    id_sesion:         generateUUID(),
    fecha_analisis:    new Date().toISOString(),
    nombre_archivo:    filename,
    resolucion_imagen: resolutionString,
    version_beta:      '1.0-beta',
    modelo_ia:         `${visionModel} + ${successExpertModel}`,
  };

  return report;
}

/**
 * Parsea la respuesta cruda del Sistema a objeto.
 * Limpia posibles bloques de código markdown que el modelo a veces incluye.
 */
function parseAIResponse(raw: string): any {
  let cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i,     '')
    .replace(/```\s*$/,      '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Si falla el parseo directo, intentar extraer el bloque entre el primer '{' y el último '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (innerErr) {
        console.error("Error al parsear el JSON extraído:", jsonStr);
      }
    }
    
    // Si todo falla, loguear la respuesta cruda para depuración
    console.error("Fallo al parsear respuesta cruda del Sistema:", raw);
    throw new Error('El Sistema devolvió un formato no válido. Por favor, intenta de nuevo.');
  }
}
