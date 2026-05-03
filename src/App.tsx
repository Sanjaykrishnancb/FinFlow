import React, { useState, useEffect } from 'react';
import { Transaction, Budget, Category, Goal, DEFAULT_CATEGORIES } from './lib/types';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { BudgetManager } from './components/BudgetManager';
import { CategoryManager } from './components/CategoryManager';
import { GoalManager } from './components/GoalManager';
import { DataManagement } from './components/DataManagement';
import { CalendarView } from './components/CalendarView';
import { SplashScreen } from './components/SplashScreen';
import { DynamicIcon } from './components/DynamicIcon';
import { Wallet, LayoutDashboard, ArrowLeftRight, Target, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'calendar' | 'transactions' | 'plan' | 'settings';


export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cashflow_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cashflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('cashflow_budgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cashflow_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cashflow_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CATEGORIES.map(c => ({ id: crypto.randomUUID(), name: c }));
      }
    }
    return DEFAULT_CATEGORIES.map(c => ({ id: crypto.randomUUID(), name: c }));
  });

  useEffect(() => {
    localStorage.setItem('cashflow_categories', JSON.stringify(categories));
  }, [categories]);

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('cashflow_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cashflow_goals', JSON.stringify(goals));
  }, [goals]);

  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...t,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [...prev, newTx]);
  };

  const handleEditTransaction = (id: string, updatedT: Omit<Transaction, 'id'>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...updatedT, id } : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddBudget = (b: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...b,
      id: crypto.randomUUID(),
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const handleAddCategory = (name: string) => {
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    setCategories(prev => [...prev, { id: crypto.randomUUID(), name }]);
  };

  const handleEditCategory = (id: string, newName: string) => {
    if (categories.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== id)) return;
    
    // We should ideally update all transactions and budgets that use this category, 
    // but right now they store category names instead of IDs. 
    // So if the name changes, the old transactions keep the old name unless updated.
    // Let's update existing transactions and budgets to use the new name.
    const oldCat = categories.find(c => c.id === id);
    if (oldCat && oldCat.name !== newName) {
        setTransactions(prev => prev.map(t => t.category === oldCat.name ? { ...t, category: newName } : t));
        setBudgets(prev => prev.map(b => b.category === oldCat.name ? { ...b, category: newName } : b));
    }

    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleDeleteCategory = (id: string) => {
    // If a category is deleted, do we remove it from transactions?
    // Let's just remove the category from the list. The transactions can still have the old name.
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleAddGoal = (goal: Omit<Goal, 'id'>) => {
    setGoals(prev => [...prev, { ...goal, id: crypto.randomUUID() }]);
  };

  const handleUpdateGoalAmount = (id: string, amountToAdd: number) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, currentAmount: g.currentAmount + amountToAdd } : g
    ));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleImportData = (importedTransactions: Transaction[], importedBudgets: Budget[], importedCategories?: Category[], importedGoals?: Goal[]) => {
    setTransactions(importedTransactions);
    setBudgets(importedBudgets);
    if (importedCategories) {
        setCategories(importedCategories);
    }
    if (importedGoals) {
        setGoals(importedGoals);
    }
  };

  const handleClearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setCategories(DEFAULT_CATEGORIES.map(c => ({ id: crypto.randomUUID(), name: c })));
  };

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', gif: '1f4ca' },
    { id: 'calendar', label: 'Monthly List', gif: '1f4c5' },
    { id: 'transactions', label: 'Transactions', gif: '1f4b8' },
    { id: 'plan', label: 'Plan', gif: '1f3af' },
    { id: 'settings', label: 'Settings', gif: '2699' },
  ] as const;

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 md:pb-0 md:pt-16">
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-20 md:flex hidden h-16">
        <div className="max-w-6xl mx-auto w-full px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
             <DynamicIcon gif="1f4b8" alt="wallet" className="w-8 h-8" />
            <h1 className="font-semibold text-lg tracking-tight">FinFlow</h1>
          </div>
          <nav className="flex gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === item.id 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <DynamicIcon gif={item.gif} alt={item.label} className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 md:hidden h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
           <DynamicIcon gif="1f4b8" alt="wallet" className="w-6 h-6" />
          <h1 className="font-semibold text-base tracking-tight">FinFlow</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {activeTab === 'dashboard' && (
              <Dashboard transactions={transactions} budgets={budgets} />
            )}

            {activeTab === 'calendar' && (
              <CalendarView transactions={transactions} />
            )}

            {activeTab === 'transactions' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <TransactionForm 
                    onAdd={handleAddTransaction} 
                    onEdit={handleEditTransaction}
                    categories={categories} 
                    editingTransaction={editingTransaction}
                    onCancelEdit={() => setEditingTransaction(null)}
                  />
                </div>
                <div className="lg:col-span-2">
                  <TransactionList 
                    transactions={transactions} 
                    onDelete={handleDeleteTransaction}
                    onEditClick={(t) => setEditingTransaction(t)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                   <GoalManager 
                     goals={goals}
                     onAdd={handleAddGoal}
                     onUpdateAmount={handleUpdateGoalAmount}
                     onDelete={handleDeleteGoal}
                   />
                   <BudgetManager budgets={budgets} onAdd={handleAddBudget} onDelete={handleDeleteBudget} categories={categories} />
                </div>
                <div className="space-y-8">
                   <CategoryManager 
                     categories={categories} 
                     onAdd={handleAddCategory} 
                     onEdit={handleEditCategory} 
                     onDelete={handleDeleteCategory} 
                   />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto">
                <DataManagement 
                  transactions={transactions} 
                  budgets={budgets} 
                  categories={categories}
                  goals={goals}
                  onImport={handleImportData} 
                  onClearAll={handleClearAllData} 
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-2 z-30 md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
           {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  activeTab === item.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${activeTab === item.id ? 'bg-gray-100' : ''}`}>
                   <DynamicIcon gif={item.gif} alt={item.label} className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
           ))}
        </div>
      </nav>
    </div>
    </>
  );
}

