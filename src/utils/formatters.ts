/**
 * Formatea una fecha ISO 8601 en formato legible en español.
 * Ej: "2025-04-13T15:30:00.000Z" → "13 de abril de 2025 — 15:30 hrs"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString('es-PE', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
  const timeStr = date.toLocaleTimeString('es-PE', {
    hour:   '2-digit',
    minute: '2-digit',
  });
  return `${dateStr} — ${timeStr} hrs`;
}

/**
 * Genera un UUID v4 simple sin dependencias externas.
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Formatea el nombre del modelo para mostrarlo de forma legible.
 * Ej: "nvidia/nemotron-nano-12b-v2-vl:free" → "NVIDIA Nemotron Nano 12B VL"
 */
export function formatModelName(modelId: string): string {
  const map: Record<string, string> = {
    'google/gemini-2.0-flash-exp': 'Google Gemini 2.0 Flash',
    'nvidia/nemotron-nano-12b-v2-vl:free': 'NVIDIA Nemotron Nano 12B VL',
    'anthropic/claude-3-5-haiku':  'Anthropic Claude 3.5 Haiku',
    'openai/gpt-4o-mini':          'OpenAI GPT-4o Mini',
  };
  return map[modelId] ?? modelId;
}
