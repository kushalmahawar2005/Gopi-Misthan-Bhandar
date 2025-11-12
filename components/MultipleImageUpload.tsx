'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiPlus } from 'react-icons/fi';

interface MultipleImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  maxImages?: number;
  className?: string;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  value = [],
  onChange,
  folder = 'products',
  label = 'Additional Images',
  maxImages = 5,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File, index?: number) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    if (index !== undefined) {
      setUploadingIndex(index);
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        if (index !== undefined) {
          // Replace image at specific index
          const newImages = [...value];
          newImages[index] = data.data.url;
          onChange(newImages);
        } else {
          // Add new image
          if (value.length < maxImages) {
            onChange([...value, data.data.url]);
          } else {
            alert(`Maximum ${maxImages} images allowed`);
          }
        }
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadingIndex(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (value.length < maxImages) {
        handleFile(e.dataTransfer.files[0]);
      } else {
        alert(`Maximum ${maxImages} images allowed`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      if (value.length < maxImages) {
        handleFile(e.target.files[0]);
      } else {
        alert(`Maximum ${maxImages} images allowed`);
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleReplace = (index: number) => {
    fileInputRef.current?.click();
    // Store index for replacement
    const currentIndex = index;
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = 'image/*';
    tempInput.onchange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0], currentIndex);
      }
    };
    tempInput.click();
  };

  const handleClick = () => {
    if (value.length < maxImages) {
      fileInputRef.current?.click();
    } else {
      alert(`Maximum ${maxImages} images allowed`);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} ({value.length}/{maxImages})
      </label>

      {/* Existing Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full aspect-square border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <FiX size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleReplace(index)}
                  className="absolute bottom-1 left-1 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                >
                  Replace
                </button>
              </div>
              {uploadingIndex === index && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add More Images Button */}
      {value.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-primary-red bg-red-50' : 'border-gray-300 hover:border-primary-red hover:bg-gray-50'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            disabled={uploading}
            multiple={false}
          />
          
          {uploading && uploadingIndex === null ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FiPlus className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Input for each image */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const newImages = [...value];
                  newImages[index] = e.target.value;
                  onChange(newImages);
                }}
                placeholder={`Image ${index + 1} URL`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red text-sm"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;

