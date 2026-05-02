import React, { useRef, useState } from 'react';
import { Transaction, Budget, Category, Goal } from '../lib/types';
import { Download, Upload, Trash2, AlertTriangle, Check, X } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  goals: Goal[];
  onImport: (transactions: Transaction[], budgets: Budget[], categories?: Category[], goals?: Goal[]) => void;
  onClearAll: () => void;
}

export function DataManagement({ transactions, budgets, categories, goals, onImport, onClearAll }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<{
    transactions: Transaction[];
    budgets: Budget[];
    categories?: Category[];
    goals?: Goal[];
  } | null>(null);

  const handleExport = () => {
    const data = {
      transactions,
      budgets,
      categories,
      goals,
      exportDate: new Date().toISOString(),
      version: 1
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-guard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (parsed.transactions || parsed.budgets || parsed.categories || parsed.goals) {
          setImportData({
            transactions: parsed.transactions || [],
            budgets: parsed.budgets || [],
            categories: parsed.categories,
            goals: parsed.goals
          });
        } else {
          alert('Invalid backup file format.');
        }
      } catch (error) {
        alert('Error reading backup file.');
        console.error(error);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (window.confirm('Are you absolutely sure you want to delete all your data? This cannot be undone unless you have a backup.')) {
      onClearAll();
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-medium text-gray-900">Data Management</h2>
        <p className="text-sm text-gray-500">
          All your data is stored locally on this device. You can export a backup or import existing data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-colors border border-gray-200"
          >
            <Download className="w-4 h-4" />
            Export Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-colors border border-gray-200"
          >
            <Upload className="w-4 h-4" />
            Import Backup
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        </div>
      </div>

      {importData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                 <Upload className="w-5 h-5 text-blue-600" />
                 Confirm Import
              </h3>
              <button onClick={() => setImportData(null)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>This will replace all your current data with the imported data. This cannot be undone.</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Import Summary</h4>
                <ul className="space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <li className="flex justify-between">
                    <span>Transactions</span>
                    <span className="font-medium text-gray-900">{importData.transactions.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Budgets</span>
                    <span className="font-medium text-gray-900">{importData.budgets.length}</span>
                  </li>
                  {importData.categories && (
                    <li className="flex justify-between">
                      <span>Categories</span>
                      <span className="font-medium text-gray-900">{importData.categories.length}</span>
                    </li>
                  )}
                  {importData.goals && (
                    <li className="flex justify-between">
                      <span>Goals</span>
                      <span className="font-medium text-gray-900">{importData.goals.length}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setImportData(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onImport(importData.transactions, importData.budgets, importData.categories, importData.goals);
                  setImportData(null);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                <Check className="w-4 h-4 ml-[-4px]" />
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
