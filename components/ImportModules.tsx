'use client';

import { useState } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface ImportModulesProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModules({ onClose, onSuccess }: ImportModulesProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const downloadTemplate = () => {
    const template = [
      {
        'Module Name': 'Introduction to Economics',
        'Study Level': 'ليسانس',
        'Specialty ID': '1',
        'Semester': 'S1',
        'Is Active': 'TRUE'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modules Template');
    XLSX.writeFile(wb, 'modules_import_template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Map Excel columns to API format
      const modules = jsonData.map((row: any) => ({
        moduleName: row['Module Name'],
        studyLevel: row['Study Level'],
        specialtyId: row['Specialty ID'] ? parseInt(row['Specialty ID']) : null,
        semester: row['Semester'],
        isActive: row['Is Active'] === 'TRUE' || row['Is Active'] === true
      }));

      const response = await fetch('/api/admin/modules/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules })
      });

      const resultData = await response.json();

      if (response.ok) {
        setResult(resultData.results);
        if (resultData.results.success > 0) {
          onSuccess();
        }
      } else {
        setResult({
          success: 0,
          failed: 1,
          errors: [resultData.error || 'Import failed']
        });
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 1,
        errors: [error.message || 'Failed to process file']
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Import Modules from Excel
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Download Template */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300 mb-3">
                Download the Excel template, fill in module data, and upload it here.
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Template</span>
              </button>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Excel File
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-modules"
                />
                <label
                  htmlFor="file-upload-modules"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-12 w-12 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {file ? file.name : 'Click to upload Excel file'}
                  </span>
                </label>
              </div>
            </div>

            {/* Import Result */}
            {result && (
              <div className={`rounded-lg p-4 ${
                result.failed === 0 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {result.failed === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  )}
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Import Results
                  </p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Success: {result.success} | Failed: {result.failed}
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Errors:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {importing ? 'Importing...' : 'Import Modules'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
