import React, { useState } from 'react';
import { Transaction } from '../lib/types';
import { format, parseISO } from 'date-fns';
import { getRecurringDates } from '../lib/calculations';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEditClick: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDelete, onEditClick }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
         <h2 className="text-lg font-medium text-gray-900">All Transactions</h2>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
           No transactions added yet.
        </div>
      ) : (
        <motion.div 
          className="divide-y divide-gray-50"
          initial="hidden" animate="visible" exit="hidden"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          <AnimatePresence mode="popLayout">
          {transactions.map((t) => {
            const recurringDates = t.recurrence !== 'none' ? getRecurringDates(t.date, t.recurrence) : null;
            
            return (
              <motion.div 
                key={t.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                     t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                   }`}>
                      {t.type === 'income' ? <span className="text-lg">+</span> : <span className="text-lg">-</span>}
                   </div>
                   
                   <div>
                      <h4 className="text-gray-900 font-medium">{t.title}</h4>
                      <div className="flex flex-col gap-1.5 mt-1">
                         <div className="flex items-center gap-3">
                             <div className="flex items-center text-gray-500 text-xs">
                                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/231b/512.gif" alt="date" className="w-4 h-4 mr-1 pb-0.5" />
                                {format(parseISO(t.date), 'MMM d, yyyy')}
                             </div>
                             {t.recurrence !== 'none' && (
                                 <div className="flex items-center text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.gif" alt="recurring" className="w-4 h-4 mr-1 pb-0.5" />
                                    {t.recurrence}
                                 </div>
                             )}
                             {t.type === 'expense' && t.category && (
                                 <div className="flex items-center text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                    {t.category}
                                 </div>
                             )}
                         </div>
                         {recurringDates && (
                             <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                 {recurringDates.previous && (
                                     <span>Prev: {format(recurringDates.previous, 'MMM d, yyyy')}</span>
                                 )}
                                 <span>Next: {format(recurringDates.next!, 'MMM d, yyyy')}</span>
                             </div>
                         )}
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 ml-[56px] sm:ml-0">
                   <div className={`text-lg font-mono ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                      ${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                   </div>
                   <div className="flex items-center gap-2">
                     <button
                        onClick={() => onEditClick(t)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50 flex items-center justify-center grayscale hover:grayscale-0"
                        title="Edit transaction"
                     >
                        <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/270f/512.gif" alt="edit" className="w-5 h-5" />
                     </button>
                     <button
                        onClick={() => onDelete(t.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 flex items-center justify-center grayscale hover:grayscale-0"
                        title="Delete transaction"
                     >
                        <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f5d1/512.gif" alt="delete" className="w-5 h-5" />
                     </button>
                   </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
