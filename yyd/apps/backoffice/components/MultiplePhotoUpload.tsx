'use client';

import { useState, useRef } from 'react';

interface MultiplePhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  disabled?: boolean;
  maxPhotos?: number;
}

export default function MultiplePhotoUpload({
  photos,
  onPhotosChange,
  disabled = false,
  maxPhotos = 10,
}: MultiplePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      alert(`Máximo de ${maxPhotos} fotos permitidas.`);
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/profile', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      onPhotosChange([...photos, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload das fotos.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Fotos Extras ({photos.length}/{maxPhotos})
      </label>

      <div className="grid grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo}
              alt={`Foto ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={() => handleRemovePhoto(index)}
              disabled={disabled || uploading}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {photos.length < maxPhotos && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="multiple-photo-input"
          />
          <label
            htmlFor="multiple-photo-input"
            className={`inline-block px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
              disabled || uploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {uploading ? 'Enviando...' : '+ Adicionar Fotos'}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG ou WebP. Máximo {maxPhotos} fotos, 5MB cada.
          </p>
        </div>
      )}
    </div>
  );
}
