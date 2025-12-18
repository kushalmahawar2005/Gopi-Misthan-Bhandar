'use client';

import React, { useState } from 'react';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface ProductRow {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string; // URL or file path
  stock: number;
  featured: boolean;
  defaultWeight: string;
  shelfLife: string;
  deliveryTime: string;
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File }>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
      setImportResults(null);
    }
  };

  // Proper CSV parser that handles quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote (double quote)
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    return result;
  };

  const handleImageSelect = (productName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFiles((prev) => ({
        ...prev,
        [productName]: e.target.files![0],
      }));
    }
  };

  const uploadImageToCloudinary = async (imageFile: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
      throw new Error('Failed to upload image');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file' });
      return;
    }

    setImporting(true);
    setUploadingImages(true);
    setMessage(null);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header and one data row');
      }

      const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1);

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.trim()) continue;

        try {
          const values = parseCSVLine(row).map(v => v.trim().replace(/^"|"$/g, ''));
          
          const product: any = {};
          headers.forEach((header, index) => {
            product[header] = values[index] || '';
          });

          // Validate required fields
          if (!product.name || !product.price) {
            throw new Error(`Row ${i + 2}: Missing required fields (name, price)`);
          }

          // Handle image - make it optional
          let imageUrl = '';
          
          // If image file is provided for this product, upload it
          if (imageFiles[product.name]) {
            try {
              imageUrl = await uploadImageToCloudinary(imageFiles[product.name]);
            } catch (error: any) {
              results.errors.push(`Row ${i + 2}: Failed to upload image - ${error.message}`);
              // Continue without image - can be added manually later
              imageUrl = '';
            }
          } else if (product.image && product.image.startsWith('http')) {
            // If image is a URL, use it
            imageUrl = product.image;
          } else if (product.image && !product.image.startsWith('http')) {
            // If image is a local path but no file provided, skip it
            results.errors.push(`Row ${i + 2}: Image must be a URL or upload image file. Skipping - can be added manually later.`);
            imageUrl = '';
          }

          // Convert types - featured field removed from bulk operation
          const productData = {
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            category: product.category || 'sweets',
            image: imageUrl, // Can be empty - user can add manually later
            stock: parseInt(product.stock) || 0,
            featured: false, // Always false in bulk operation - user can set manually
            defaultWeight: product.defaultWeight || '500g',
            shelfLife: product.shelfLife || '',
            deliveryTime: product.deliveryTime || '',
          };

          // Create product via API
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });

          const data = await response.json();

          if (data.success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`Row ${i + 2}: ${data.error || 'Failed to create product'}`);
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: ${error.message || 'Error processing row'}`);
        }
      }
     
      setUploadingImages(false);
      setImportResults(results);
      setMessage({
        type: results.failed === 0 ? 'success' : 'error',
        text: `Import completed: ${results.success} successful, ${results.failed} failed`,
      });
    } catch (error: any) {
      setUploadingImages(false);
      setMessage({ type: 'error', text: error.message || 'Error importing products' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-brown font-serif">Bulk Product Import</h1>
        <p className="text-gray-600 mt-1">Import products from CSV with image upload support</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Import Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
          <FiUpload className="text-primary-red" />
          Import Products
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <label className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-red transition-colors">
            <FiUpload size={20} />
            <span>{file ? file.name : 'Choose CSV File'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Image Upload Options:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
            <li>Use Cloudinary URLs directly in CSV (recommended)</li>
            <li>Or upload image files after CSV import (see below)</li>
            <li>Images will be automatically uploaded to Cloudinary</li>
          </ul>
        </div>

        <button
          onClick={handleImport}
          disabled={importing || !file}
          className="px-6 py-3 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-darkRed transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FiUpload size={18} />
          {importing ? (uploadingImages ? 'Uploading Images...' : 'Importing...') : 'Import from CSV'}
        </button>

        {importResults && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-4">
              <div className="text-green-600 font-semibold">Success: {importResults.success}</div>
              <div className="text-red-600 font-semibold">Failed: {importResults.failed}</div>
            </div>
            
            {importResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="font-semibold text-red-800 mb-2">Errors:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResults.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      {file && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold font-serif mb-4">Upload Product Images</h3>
          <p className="text-gray-600 mb-4 text-sm">
            If your CSV has product names but images need to be uploaded, you can upload them here.
            Images will be matched by product name and uploaded to Cloudinary.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Product Image</p>
                <p className="text-sm text-gray-500">Upload image file</p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <FiImage size={18} />
                <span className="text-sm">Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    // You can enhance this to match with product names from CSV
                    if (e.target.files && e.target.files[0]) {
                      const fileName = e.target.files[0].name;
                      const productName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
                      handleImageSelect(productName, e);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

