import type { ImageInfo } from '../types/analysis';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 1536;
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
 * Convierte un File a base64, redimensionando si supera MAX_DIMENSION.
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
        let finalBase64: string;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          // Redimensionar manteniendo proporción
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          const canvas = document.createElement('canvas');
          canvas.width  = Math.round(width  * ratio);
          canvas.height = Math.round(height * ratio);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          finalBase64 = canvas.toDataURL(file.type, 0.92).split(',')[1];
          width  = canvas.width;
          height = canvas.height;
        } else {
          finalBase64 = dataUrl.split(',')[1];
        }

        resolve({
          base64:           finalBase64,
          mediaType:        file.type,
          width,
          height,
          sizeBytes:        file.size,
          resolutionString: `${width}×${height} px`,
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
