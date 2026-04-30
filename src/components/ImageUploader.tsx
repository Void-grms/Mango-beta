import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';
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
      <div className="relative rounded-2xl overflow-hidden border border-border bg-surface-alt">
        <img
          src={previewUrl}
          alt="Vista previa del mango"
          className="w-full max-h-80 object-contain bg-gray-50"
        />
        <div className="p-4 bg-white border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg border border-primary-100">
              <ImageIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-text-primary font-medium truncate max-w-[200px] sm:max-w-xs">
                {selectedFile.name}
              </span>
              <span className="text-xs text-text-muted">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="p-2 rounded-xl hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
              title="Quitar imagen"
            >
              <X className="w-5 h-5" />
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
          border-2 border-dashed rounded-2xl p-12
          cursor-pointer transition-all duration-300
          ${dragging
            ? 'border-primary bg-primary-50 scale-[1.02] shadow-[0_0_30px_rgba(22,163,74,0.1)]'
            : 'border-border bg-surface-alt hover:border-primary/40 hover:bg-primary-50/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${dragging ? 'bg-primary-100 text-primary' : 'bg-gray-100 text-text-muted'}`}>
          <Upload className={`w-8 h-8 ${dragging ? 'animate-bounce' : ''}`} />
        </div>
        <p className="text-lg font-semibold text-text-primary font-outfit mb-1">
          {dragging ? 'Suelta la imagen aquí' : 'Arrastra una foto del fruto'}
        </p>
        <p className="text-sm text-text-muted mb-4">o haz clic para explorar tus archivos</p>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-white px-3 py-1.5 rounded-full border border-border">
          <span>JPG, PNG, WebP</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Máx. 10 MB</span>
        </div>
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
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{fileError}</p>
        </div>
      )}
    </div>
  );
}
