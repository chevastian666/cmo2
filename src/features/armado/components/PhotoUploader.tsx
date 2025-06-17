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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-500" />
          Fotos del Precinto
        </h2>
        <span className="text-sm text-gray-400">
          {totalPhotos} / {maxPhotos} fotos
        </span>
      </div>

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Fotos existentes:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {existingPhotos.map((photo, index) => (
              <div key={`existing-${index}`} className="relative group">
                <img
                  src={photo}
                  alt={`Foto existente ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-600"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
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
        
        <>
            <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">
              Arrastra y suelta imágenes aquí
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o usa los botones para seleccionar
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={totalPhotos >= maxPhotos}
                className={cn(
                  "px-4 py-2 bg-gray-700 text-white rounded-lg",
                  "hover:bg-gray-600 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center space-x-2"
                )}
              >
                <Upload className="h-4 w-4" />
                <span>Seleccionar Archivos</span>
              </button>
              
              <button
                onClick={openCamera}
                disabled={totalPhotos >= maxPhotos}
                className={cn(
                  "px-4 py-2 bg-blue-600 text-white rounded-lg",
                  "hover:bg-blue-700 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center space-x-2"
                )}
              >
                <Camera className="h-4 w-4" />
                <span>Usar Cámara</span>
              </button>
            </div>
          </>
      </div>

      {/* New Photos Preview */}
      {photos.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Nuevas fotos:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {previews.map((preview, index) => (
              <div key={`new-${index}`} className="relative group">
                <img
                  src={preview}
                  alt={`Nueva foto ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-600"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar foto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong>Formatos aceptados:</strong> JPG, PNG, GIF, WEBP. 
          Máximo {maxSizeMB}MB por imagen.
        </p>
      </div>
    </div>
  );
};