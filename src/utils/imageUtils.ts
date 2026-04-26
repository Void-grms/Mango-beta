import type { ImageInfo } from '../types/analysis';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Valida el archivo de imagen. Devuelve string con error o null si es válida.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Formato no soportado: "${file.type}". Usa JPG, PNG o WebP.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Imagen muy grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo: 10 MB.`;
  }
  return null;
}

/**
 * Convierte un File a base64, redimensionando si supera MAX_DIMENSION 
 * y forzando la compresión a formato WebP para ahorro de payload y tokens.
 * Devuelve ImageInfo con todos los metadatos.
 */
export function processImageFile(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();

      img.onerror = () => reject(new Error('No se pudo decodificar la imagen.'));

      img.onload = () => {
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          // Redimensionar manteniendo proporción
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Forzar siempre usar canvas para re-codificar a WebP (0.85)
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrlStr = canvas.toDataURL('image/webp', 0.85);
        let finalBase64: string;
        let finalMediaType: string;

        if (!dataUrlStr.startsWith('data:image/webp')) {
          console.warn('WebP not supported by browser encoding, falling back to JPEG');
          const fallbackDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          finalBase64 = fallbackDataUrl.split(',')[1];
          finalMediaType = 'image/jpeg';
        } else {
          finalBase64 = dataUrlStr.split(',')[1];
          finalMediaType = 'image/webp';
        }

        resolve({
          base64:           finalBase64,
          mediaType:        finalMediaType,
          width,
          height,
          sizeBytes:        Math.round(finalBase64.length * 0.75), // Estimación del tamaño del base64
          resolutionString: `${width}×${height} px`,
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
