import React, { useState, useMemo } from 'react';
import { Transaction } from '../lib/types';
import { calculateProjections } from '../lib/calculations';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths, isSameDay, startOfWeek, endOfWeek, isBefore } from 'date-fns';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { DynamicIcon } from './DynamicIcon';

interface Props {
  transactions: Transaction[];
}

export function CalendarView({ transactions }: Props) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  // Calculate projections 
  const projections = useMemo(() => calculateProjections(transactions, 365 * 2), [transactions]);

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);

  // Get days in the current month that have transactions
  const daysInMonth = projections.filter(p => !isBefore(p.date, monthStart) && p.date <= monthEnd && p.changes.length > 0);

  let monthIncome = 0;
  let monthExpenses = 0;

  daysInMonth.forEach(day => {
    day.changes.forEach(change => {
      if (change.type === 'income') monthIncome += change.amount;
      if (change.type === 'expense') monthExpenses += change.amount;
    });
  });

  const monthNet = monthIncome - monthExpenses;

  // Find balance at the end of the selected month
  const allDaysInMonth = projections.filter(p => !isBefore(p.date, monthStart) && p.date <= monthEnd);
  // Default to 0 if no projections, but usually there's at least one from calculating running balance
  const endOfMonthBalance = allDaysInMonth.length > 0 ? allDaysInMonth[allDaysInMonth.length - 1].balance : 0;

  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                <DynamicIcon gif="1f4c5" alt="calendar" className="w-6 h-6" />
                Monthly Record
            </h2>
            <div className="flex items-center gap-4">
                <button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-medium text-lg w-40 text-center text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
               <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Total Income</span>
               <div className="font-medium text-emerald-700 text-lg">+${monthIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
               <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Total Expenses</span>
               <div className="font-medium text-red-700 text-lg">-${monthExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
             <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
               <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Net Flow</span>
               <div className={cn("font-medium text-lg", monthNet >= 0 ? "text-emerald-700" : "text-red-700")}>
                   {monthNet >= 0 ? '+' : '-'}${Math.abs(monthNet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
               <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">End Balance</span>
               <div className={cn("font-medium text-lg", endOfMonthBalance >= 0 ? "text-gray-900" : "text-red-700")}>
                   ${endOfMonthBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </div>
            </div>
        </div>
        
        <div className="divide-y divide-gray-100">
            {daysInMonth.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    No transactions projected for this month.
                </div>
            ) : (
                daysInMonth.map((day) => (
                    <div key={day.date.toString()} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">{format(day.date, 'EEEE, MMMM do, yyyy')}</h3>
                            <span className="text-sm text-gray-500">End Balance: <span className={cn("font-medium", day.balance < 0 ? "text-red-600" : "text-gray-900")}>${day.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                        </div>
                        <div className="space-y-3 pl-4 border-l-2 border-gray-100 mt-2">
                            {day.changes.map((change, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            change.type === 'income' ? "bg-emerald-500" : "bg-red-500"
                                        )} />
                                        <span className="text-gray-700">{change.title}</span>
                                        {change.category && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                {change.category}
                                            </span>
                                        )}
                                        {change.isRecurring && (
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                Recurring
                                            </span>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "font-mono font-medium",
                                        change.type === 'income' ? "text-emerald-700" : "text-gray-900"
                                    )}>
                                        {change.type === 'income' ? '+' : '-'}${change.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}
