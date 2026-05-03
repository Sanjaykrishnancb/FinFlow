import React, { useState, useEffect } from 'react';
import { Budget, Category } from '../lib/types';
import { DynamicIcon } from './DynamicIcon';

interface Props {
  budgets: Budget[];
  categories: Category[];
  onAdd: (budget: Omit<Budget, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function BudgetManager({ budgets, categories, onAdd, onDelete }: Props) {
  const availableCategories = categories
    .map(c => c.name)
    .filter(cat => !budgets.some(b => b.category === cat));

  const [category, setCategory] = useState(availableCategories[0] || '');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!availableCategories.includes(category) && availableCategories.length > 0) {
       setCategory(availableCategories[0]);
    }
  }, [budgets, category, availableCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    onAdd({ category, amount: parseFloat(amount) });
    setAmount('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 space-y-6 mt-8">
       <h2 className="text-lg font-medium text-gray-900">Monthly Budgets</h2>
       
       <form onSubmit={handleSubmit} className="space-y-4">
         <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                 value={category}
                 onChange={e => setCategory(e.target.value)}
                 className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                 disabled={availableCategories.length === 0}
              >
                 {availableCategories.map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
                 {availableCategories.length === 0 && (
                   <option value="">All tracked</option>
                 )}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">$</div>
                 <input 
                   type="number" 
                   required
                   min="1"
                   step="1"
                   value={amount}
                   onChange={e => setAmount(e.target.value)}
                   disabled={availableCategories.length === 0}
                   placeholder="0"
                   className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors font-mono"
                 />
              </div>
           </div>
         </div>
         <button 
            type="submit"
            disabled={availableCategories.length === 0 || !amount}
            className="w-full py-2 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
         >
            Add Budget
         </button>
       </form>

       {budgets.length > 0 && (
         <div className="space-y-3 pt-4 border-t border-gray-100">
           {budgets.map(b => (
             <div key={b.id} className="flex items-center justify-between">
               <div>
                 <div className="font-medium text-sm text-gray-900">{b.category}</div>
                 <div className="text-xs text-gray-500">${b.amount.toLocaleString()}/mo</div>
               </div>
               <button
                 onClick={() => onDelete(b.id)}
                 className="p-2 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center rounded-full hover:bg-red-50 grayscale hover:grayscale-0"
               >
                 <DynamicIcon gif="1f5d1" alt="delete" className="w-5 h-5" />
               </button>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}
