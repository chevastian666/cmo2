import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../../utils/utils';

interface PhotoUploaderProps {
  onPhotosChange: (photos: File[]) => void;
  existingPhotos?: string[];
  maxPhotos?: number;
  maxSizeMB?: number;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotosChange,
  existingPhotos = [],
  maxPhotos = 5,
  maxSizeMB = 10
}) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} no es una imagen válida`);
        return;
      }

      // Check file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        errors.push(`${file.name} excede el tamaño máximo de ${maxSizeMB}MB`);
        return;
      }

      // Check max photos
      if (photos.length + validFiles.length >= maxPhotos) {
        errors.push(`Máximo ${maxPhotos} fotos permitidas`);
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviews(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      const newPhotos = [...photos, ...validFiles].slice(0, maxPhotos);
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPreviews(newPreviews);
    onPhotosChange(newPhotos);
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const totalPhotos = existingPhotos.length + photos.length;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-500" />
          Fotos del Precinto
        </h2>
        <span className="text-sm text-gray-400">
          {totalPhotos} / {maxPhotos} fotos
        </span>
      </div>

      {/* Compact Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Upload Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
            dragActive ? "border-blue-500 bg-blue-900/20" : "border-gray-600",
            totalPhotos >= maxPhotos && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            disabled={totalPhotos >= maxPhotos}
          />
          
          <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-300 mb-2">
            Arrastra fotos aquí
          </p>
          
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={totalPhotos >= maxPhotos}
              className={cn(
                "px-3 py-1 bg-gray-700 text-white text-sm rounded",
                "hover:bg-gray-600 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Seleccionar
            </button>
            
            <button
              onClick={openCamera}
              disabled={totalPhotos >= maxPhotos}
              className={cn(
                "px-3 py-1 bg-blue-600 text-white text-sm rounded",
                "hover:bg-blue-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Cámara
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-2">
          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Fotos existentes:</p>
              <div className="flex flex-wrap gap-2">
                {existingPhotos.map((photo, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={photo}
                      alt={`Foto existente ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border border-gray-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Photos */}
          {photos.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Nuevas fotos:</p>
              <div className="flex flex-wrap gap-2">
                {previews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={preview}
                      alt={`Nueva foto ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border border-gray-600"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar foto"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Formatos: JPG, PNG, GIF, WEBP. Máx {maxSizeMB}MB por imagen.
      </div>
    </div>
  );
};