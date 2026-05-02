import React, { useState } from 'react';
import { Category } from '../lib/types';
import { Edit2, Save, Trash2, X } from 'lucide-react';

interface Props {
  categories: Category[];
  onAdd: (name: string) => void;
  onEdit: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export function CategoryManager({ categories, onAdd, onEdit, onDelete }: Props) {
  const [newCat, setNewCat] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    onAdd(newCat.trim());
    setNewCat('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onEdit(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Manage Categories</h2>
      
      <form onSubmit={handleAdd} className="flex gap-2">
        <input 
          type="text" 
          required
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          placeholder="New category name"
          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            {editingId === cat.id ? (
              <div className="flex flex-1 items-center gap-2 mr-2">
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm"
                  autoFocus
                />
                <button onClick={handleSaveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Save className="w-4 h-4" /></button>
                <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleStartEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
