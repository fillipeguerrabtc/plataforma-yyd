'use client';

import { useState, useRef } from 'react';

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string) => void;
  disabled?: boolean;
}

export default function ProfilePhotoUpload({
  currentPhoto,
  onPhotoChange,
  disabled = false,
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentPhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onPhotoChange(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload da foto. Tente novamente.');
      setPreview(currentPhoto);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(undefined);
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Foto de Perfil (Opcional)
      </label>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="profile-photo-input"
          />

          <div className="flex gap-2">
            <label
              htmlFor="profile-photo-input"
              className={`px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                disabled || uploading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {uploading ? 'Enviando...' : preview ? 'Alterar Foto' : 'Escolher Foto'}
            </label>

            {preview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={disabled || uploading}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Remover
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            JPG, PNG ou WebP. Máximo 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
