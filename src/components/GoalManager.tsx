import React, { useState } from 'react';
import { Goal } from '../lib/types';
import { Target, Trash2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  goals: Goal[];
  onAdd: (goal: Omit<Goal, 'id'>) => void;
  onUpdateAmount: (id: string, amountToAdd: number) => void;
  onDelete: (id: string) => void;
}

export function GoalManager({ goals, onAdd, onUpdateAmount, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [addFundsId, setAddFundsId] = useState<string | null>(null);
  const [fundsToAdd, setFundsToAdd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    onAdd({
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
    });
    setTitle('');
    setTargetAmount('');
    setIsAdding(false);
  };

  const handleAddFunds = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!fundsToAdd) return;
    onUpdateAmount(id, parseFloat(fundsToAdd));
    setFundsToAdd('');
    setAddFundsId(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Financial Goals
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-lg"
          >
            <Plus className="w-4 h-4" /> New Goal
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Vacation, Emergency Fund"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">$</div>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors font-mono"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Save Goal
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {goals.length === 0 && !isAdding ? (
        <div className="text-center py-6 text-sm text-gray-500">
          No financial goals set. Start saving for your future!
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map(goal => {
            const percent = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <div className="text-sm text-gray-500 space-x-1 mt-0.5">
                      <span className="font-medium text-gray-900">${goal.currentAmount.toLocaleString()}</span>
                      <span>/</span>
                      <span>${goal.targetAmount.toLocaleString()}</span>
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={percent}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-xs ml-2 px-2 py-0.5 bg-gray-100 rounded-full inline-block"
                        >
                          {percent.toFixed(0)}%
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!isCompleted && addFundsId !== goal.id && (
                      <button
                        onClick={() => setAddFundsId(goal.id)}
                        className="text-xs font-medium text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                      >
                        Add Funds
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(goal.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {addFundsId === goal.id ? (
                  <form onSubmit={(e) => handleAddFunds(e, goal.id)} className="flex gap-2">
                    <div className="relative flex-1">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</div>
                       <input
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          value={fundsToAdd}
                          onChange={e => setFundsToAdd(e.target.value)}
                          placeholder="Amount"
                          className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors font-mono"
                          autoFocus
                       />
                    </div>
                    <button type="submit" className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      Add
                    </button>
                    <button type="button" onClick={() => setAddFundsId(null)} className="px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={cn(
                        "h-full rounded-full",
                        isCompleted ? "bg-emerald-500" : "bg-purple-500"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
