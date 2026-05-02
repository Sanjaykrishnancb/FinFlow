import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Recurrence, Category } from '../lib/types';
import { format } from 'date-fns';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onEdit?: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

export function TransactionForm({ onAdd, onEdit, categories, editingTransaction, onCancelEdit }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setRecurrence(editingTransaction.recurrence);
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category || (categories[0]?.name || ''));
    } else {
      setTitle('');
      setAmount('');
      // Keep type, date, as they are often reused, or reset them if prefered
    }
  }, [editingTransaction, categories]);

  useEffect(() => {
    if (!editingTransaction && !categories.find(c => c.name === category) && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [categories, category, editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    
    const txData = {
      title,
      amount: parseFloat(amount),
      type,
      recurrence,
      date,
      category: type === 'expense' ? category : undefined,
    };

    if (editingTransaction && onEdit) {
      onEdit(editingTransaction.id, txData);
      if (onCancelEdit) onCancelEdit();
    } else {
      onAdd(txData);
      setTitle('');
      setAmount('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-lg font-medium text-gray-900">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
         {editingTransaction && (
           <button type="button" onClick={onCancelEdit} className="text-gray-400 hover:text-gray-600">
              <span className="sr-only">Cancel</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
         )}
       </div>
       
       <div className="flex bg-gray-100 p-1 rounded-xl">
         <button
           type="button"
           onClick={() => setType('expense')}
           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
         >
           Expense
         </button>
         <button
           type="button"
           onClick={() => setType('income')}
           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
         >
           Income
         </button>
       </div>

       <div className="space-y-4">
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Salary, Rent, Groceries"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
         </div>
         
         <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">$</div>
                   <input 
                     type="number" 
                     required
                     min="0.01"
                     step="0.01"
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                     placeholder="0.00"
                     className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors font-mono"
                   />
                </div>
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                <select
                   value={recurrence}
                   onChange={e => setRecurrence(e.target.value as Recurrence)}
                   className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                >
                   <option value="none">One-time</option>
                   <option value="monthly">Monthly</option>
                   <option value="yearly">Yearly</option>
                </select>
             </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {recurrence === 'none' ? 'Date' : 'Start / Repeat Date'}
                </label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-gray-600 uppercase text-sm"
                />
                {recurrence === 'monthly' && date && (
                   <p className="text-xs text-gray-500 mt-1.5 ml-1">Repeats on the <strong>{format(new Date(date), 'do')}</strong> of each month.</p>
                )}
                {recurrence === 'yearly' && date && (
                   <p className="text-xs text-gray-500 mt-1.5 ml-1">Repeats on <strong>{format(new Date(date), 'MMM do')}</strong> each year.</p>
                )}
             </div>

             {type === 'expense' && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                       value={category}
                       onChange={e => setCategory(e.target.value)}
                       className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    >
                       {categories.map(cat => (
                         <option key={cat.id} value={cat.name}>{cat.name}</option>
                       ))}
                    </select>
                 </div>
             )}
         </div>
       </div>

       <button 
          type="submit"
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
       >
          {editingTransaction ? 'Save Changes' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
       </button>
       
       {editingTransaction && (
         <button 
            type="button"
            onClick={onCancelEdit}
            className="w-full py-2 mt-2 bg-transparent text-gray-500 rounded-xl font-medium hover:text-gray-900 transition-colors"
         >
            Cancel Edit
         </button>
       )}
    </form>
  );
}
