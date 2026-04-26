import type { MangoAnalysisReport } from '../types/analysis';
import { MangoValidationError } from '../utils/errors';
import {
  PREVALIDATION_PROMPT,
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
 * @param maxTokens - Límite de tokens de salida. Usar 800 para Fase 1 y 1200 para Fase 2.
 */
async function fetchOpenRouter(model: string, messages: any[], maxTokens = 800): Promise<string> {
  let response: Response;
  const supportsJsonMode = ['llama-3', 'gpt-', 'claude-', 'gemini'].some(m => model.toLowerCase().includes(m));
  
  const bodyPayload: any = {
    model,
    max_tokens: maxTokens,
    messages,
  };
  
  if (supportsJsonMode) {
    bodyPayload.response_format = { type: 'json_object' };
  }

  try {
    response = await fetch(OPENROUTER_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type':  'application/json',
        'HTTP-Referer':  'https://araexport.pe',
        'X-Title':       'ARAExport Mango Disease Analyzer Beta',
      },
      body: JSON.stringify(bodyPayload),
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
async function callOpenRouter(model: string, messages: any[], maxTokens = 800): Promise<string> {
  let attempt = 0;

  while (true) {
    try {
      return await fetchOpenRouter(model, messages, maxTokens);
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
 * Realiza una pre-validación de bajísimo costo para confirmar si hay un mango.
 * Lanza MangoValidationError si detecta que NO es un mango.
 * Fail-open: si el servicio cae (no-2xx, timeout), permite continuar el flujo.
 * Usa fetchOpenRouter directamente — SIN retries/backoff — para fallar rápido.
 */
async function cheapPreValidation(imageBase64: string, mediaType: string): Promise<void> {
  const PREVALIDATION_MODELS = [
    'nvidia/nemotron-nano-12b-v2-vl:free', // visión + free + rápido
    'google/gemma-3-4b-it:free',           // Fallback
  ];

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
        { type: 'text', text: PREVALIDATION_PROMPT },
      ],
    },
  ];

  let rawOutput = '';
  let validationSuccess = false;

  for (const model of PREVALIDATION_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20_000);
      let response: Response;
      
      try {
        response = await fetch(OPENROUTER_URL, {
          method:  'POST',
          signal:  controller.signal,
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type':  'application/json',
            'HTTP-Referer':  'https://araexport.pe',
            'X-Title':       'ARAExport Mango Disease Analyzer Beta',
          },
          body: JSON.stringify({ model, max_tokens: 100, messages }),
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        console.warn(`[PreValidation] Modelo ${model} no disponible (HTTP ${response.status})`);
        continue; // Intentar con el siguiente modelo
      }

      const data = await response.json();
      rawOutput = data?.choices?.[0]?.message?.content ?? '';
      console.log(`[PreValidation] Respuesta cruda de ${model}:`, rawOutput);
      validationSuccess = true;
      break; // Salimos del loop porque tuvimos éxito
    } catch (err) {
      console.warn(`[PreValidation] Error con el modelo ${model}:`, err);
      continue; // Intentar con el siguiente modelo
    }
  }

  // Si TODOS los modelos de pre-validación fallaron (red caída, créditos), hacemos fail-open
  // (es preferible analizar algo raro que bloquear la app completa si el guardián está caído)
  if (!validationSuccess) {
    console.error('[PreValidation] Todos los modelos guardianes fallaron. Omitiendo pre-validación.');
    return; 
  }

  const raw = rawOutput.trim().toLowerCase();
  
  // Analizamos la respuesta
  const saysTrue = raw.includes('true') || raw.includes('yes');
  const saysFalse = raw.includes('false') || raw.includes('no');

  // Rechazamos si explícitamente dice false, o si NO dice true (ej. responde "This is a basket of eggs")
  if ((saysFalse && !saysTrue) || !saysTrue) {
    throw new MangoValidationError();
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

  // ============== FASE 0: PRE-VALIDACIÓN ==============
  await cheapPreValidation(imageBase64, mediaType);

  // ============== FASE 1: VISIÓN ==============
  const visionModel = MODEL || 'nvidia/nemotron-nano-12b-v2-vl:free';
  const visionMessages = [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: VISION_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
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

  const visionRawOutput = await callOpenRouter(visionModel, visionMessages, 800);

  // Delay entre la llamada de visión y la del experto para no saturar la API
  await sleep(INTER_CALL_DELAY_MS);
  const visionResult = parseAIResponse(visionRawOutput);


  // ============== FASE 2: EXPERTO (FALLBACKS) ==============
  const defaultExpertModels = [
    'openai/gpt-oss-120b:free',               // 131K ctx, MoE, structured output
    'nvidia/nemotron-3-super-120b-a12b:free', // 262K ctx, muy capaz
    'z-ai/glm-4.5-air:free',                  // 131K ctx, buen fallback
    'openrouter/free'                         // comodín final de la plataforma
  ];
  const expertModels = EXPERT_MODELS_ENV 
    ? EXPERT_MODELS_ENV.split(',').map(m => m.trim())
    : defaultExpertModels;

  const expertMessages = [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: EXPERT_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
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
      const expertRawOutput = await callOpenRouter(expModel, expertMessages, 1200);
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
    diagnostico_principal: {
      codigo: visionResult.diag?.codigo || '',
      nombre: visionResult.diag?.nombre || '',
      nombre_cientifico: visionResult.diag?.sci || null,
      confianza: visionResult.diag?.conf || 0,
      severidad: visionResult.diag?.severidad || 'sano',
      porcentaje_area: visionResult.diag?.pct || 0,
      descripcion_visual: visionResult.diag?.descripcion_visual || ''
    },
    diagnosticos_secundarios: visionResult.alt || [],
    estado_general: visionResult.estado_general || 'optimo',
    porcentaje_area_total_afectada: visionResult.porcentaje_area_total_afectada || 0,
    descripcion_general: visionResult.descripcion_general || '',
    advertencias: visionResult.advertencias || [],
    apto_exportacion: expertResult.apto_exportacion ?? false,
    observaciones_adicionales: expertResult.observaciones_adicionales || [],
    recomendaciones: expertResult.recs || [],
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
 * Parsea la respuesta cruda del modelo a objeto JS.
 * Elimina agresivamente markdown fences (```json ... ```) que algunos modelos
 * incluyen aunque se les pida JSON puro.
 */
function parseAIResponse(raw: string): any {
  // Eliminar markdown fences en CUALQUIER posición del texto
  // Cubre: texto previo al fence, fence al inicio, fence al final
  const cleaned = raw
    .replace(/```json\s*/gi, '') // Eliminar ```json (con o sin salto de línea)
    .replace(/```\s*/gi,     '') // Eliminar ``` restantes
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: extraer el bloque entre primer '{' y último '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace  = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonStr);
      } catch {
        console.error('[parseAIResponse] JSON extraído inválido:', jsonStr);
      }
    }

    console.error('[parseAIResponse] Respuesta cruda no parseable:', raw);
    throw new Error('El Sistema devolvió un formato no válido. Por favor, intenta de nuevo.');
  }
}
