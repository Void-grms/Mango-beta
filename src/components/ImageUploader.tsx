import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { validateImageFile } from '../utils/imageUtils';

interface Props {
  onFileSelected: (file: File) => void;
  previewUrl:     string | null;
  selectedFile:   File | null;
  onClear:        () => void;
  disabled?:      boolean;
}

export function ImageUploader({ onFileSelected, previewUrl, selectedFile, onClear, disabled }: Props) {
  const inputRef       = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]   = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFile(file: File) {
    const error = validateImageFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    onFileSelected(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // reset para permitir re-selección del mismo archivo
  }

  // Vista cuando ya hay imagen seleccionada
  if (previewUrl && selectedFile) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-green-400 bg-green-50">
        <img
          src={previewUrl}
          alt="Vista previa del mango"
          className="w-full max-h-80 object-contain"
        />
        <div className="p-3 bg-white border-t border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700 font-medium truncate max-w-xs">
              {selectedFile.name}
            </span>
            <span className="text-xs text-gray-400">
              ({(selectedFile.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
              title="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Vista de zona de drop vacía
  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true);  }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center
          border-2 border-dashed rounded-xl p-12
          cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-green-500 bg-green-50 scale-[1.01]'
            : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Upload className={`w-12 h-12 mb-3 ${dragging ? 'text-green-600' : 'text-gray-400'}`} />
        <p className="text-base font-semibold text-gray-700 mb-1">
          {dragging ? 'Suelta la imagen aquí' : 'Arrastra una foto de mango'}
        </p>
        <p className="text-sm text-gray-500 mb-3">o haz clic para seleccionar un archivo</p>
        <p className="text-xs text-gray-400">JPG, PNG, WebP · Máximo 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {fileError && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" /> {fileError}
        </p>
      )}
    </div>
  );
}
