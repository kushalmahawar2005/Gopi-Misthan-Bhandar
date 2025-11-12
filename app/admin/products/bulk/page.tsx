'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiUpload, FiDownload, FiFile, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

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

export default function BulkProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
      setImportResults(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch products');
      }

      const products = data.data || [];
      
      // Convert to CSV format
      const csvHeaders = [
        'name',
        'description',
        'price',
        'category',
        'image',
        'stock',
        'featured',
        'defaultWeight',
        'shelfLife',
        'deliveryTime',
      ];

      const csvRows = products.map((product: any) => [
        `"${product.name || ''}"`,
        `"${(product.description || '').replace(/"/g, '""')}"`,
        product.price || 0,
        product.category || '',
        product.image || '',
        product.stock || 0,
        product.featured ? 'true' : 'false',
        product.defaultWeight || '',
        product.shelfLife || '',
        product.deliveryTime || '',
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: string[]) => row.join(',')),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ type: 'success', text: `Exported ${products.length} products successfully!` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error exporting products' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file' });
      return;
    }

    setImporting(true);
    setMessage(null);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
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
          const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          
          const product: any = {};
          headers.forEach((header, index) => {
            product[header] = values[index] || '';
          });

          // Validate required fields
          if (!product.name || !product.price) {
            throw new Error(`Row ${i + 2}: Missing required fields (name, price)`);
          }

          // Handle image - if it's a URL, use it; if it's a local path, upload to Cloudinary
          let imageUrl = product.image;
          
          if (product.image && !product.image.startsWith('http')) {
            // If image is a local file path, you would need to handle file upload
            // For now, we'll skip images that aren't URLs
            results.errors.push(`Row ${i + 2}: Image must be a URL. Skipping local image.`);
            imageUrl = ''; // Or set a default image
          }

          // Convert types
          const productData = {
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            category: product.category || 'sweets',
            image: imageUrl || 'https://via.placeholder.com/400',
            stock: parseInt(product.stock) || 0,
            featured: product.featured === 'true' || product.featured === true,
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

      setImportResults(results);
      setMessage({
        type: results.failed === 0 ? 'success' : 'error',
        text: `Import completed: ${results.success} successful, ${results.failed} failed`,
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error importing products' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown font-serif">Bulk Product Operations</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Import or export products in bulk</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <FiCheckCircle size={20} />
          ) : (
            <FiAlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold font-serif mb-3 sm:mb-4 flex items-center gap-2">
          <FiDownload className="text-primary-red" size={20} />
          Export Products
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Export all products to CSV format. Images will be exported as URLs (Cloudinary links).
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-darkRed transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FiDownload size={18} />
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold font-serif mb-3 sm:mb-4 flex items-center gap-2">
          <FiUpload className="text-primary-red" size={20} />
          Import Products
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Import products from CSV file. Make sure your CSV has the following columns:
        </p>
        
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="text-xs sm:text-sm whitespace-nowrap">
            name, description, price, category, image, stock, featured, defaultWeight, shelfLife, deliveryTime
          </code>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-2 px-4 sm:px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-red transition-colors flex-1 sm:flex-initial">
              <FiFile size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base truncate">{file ? file.name : 'Choose CSV File'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {file && (
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-800 text-sm px-3 py-2 sm:px-0 sm:py-0"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4">
          <p className="text-xs sm:text-sm text-yellow-800 mb-2">
            <strong>Note:</strong> For images, use Cloudinary URLs. If you have local images, use the Advanced Import option below.
          </p>
          <Link
            href="/admin/products/bulk/import"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <FiUpload size={14} />
            <span className="break-words">Use Advanced Import (with Image Upload Support)</span>
          </Link>
        </div>

        <button
          onClick={handleImport}
          disabled={importing || !file}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-darkRed transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FiUpload size={18} />
          {importing ? 'Importing...' : 'Import from CSV'}
        </button>

        {importResults && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <FiCheckCircle size={18} />
                <span>Success: {importResults.success}</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <FiAlertCircle size={18} />
                <span>Failed: {importResults.failed}</span>
              </div>
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

      {/* Sample CSV */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold font-serif mb-3 sm:mb-4">Sample CSV Format</h3>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs sm:text-sm whitespace-pre-wrap break-words">
{`name,description,price,category,image,stock,featured,defaultWeight,shelfLife,deliveryTime
"Gulab Jamun","Traditional sweet made with khoya","250","sweets","https://res.cloudinary.com/your-cloud/image/upload/v1/gulab-jamun.jpg",50,true,"500g","7 days","2-3 days"
"Kaju Katli","Premium cashew sweet","450","sweets","https://res.cloudinary.com/your-cloud/image/upload/v1/kaju-katli.jpg",30,true,"250g","15 days","2-3 days"`}
          </pre>
        </div>
      </div>
    </div>
  );
}

