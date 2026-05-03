import React, { useState } from 'react';
import { Transaction, Budget } from '../lib/types';
import { calculateProjections } from '../lib/calculations';
import { isBefore, startOfDay, isAfter, format, isSameMonth, addDays, isSameDay, endOfMonth, differenceInDays, startOfMonth, addMonths } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { DynamicIcon } from './DynamicIcon';

export function Dashboard({ transactions, budgets }: { transactions: Transaction[], budgets: Budget[] }) {
  const [daysAhead, setDaysAhead] = useState(365);
  const projections = calculateProjections(transactions, daysAhead);
  
  const today = startOfDay(new Date());
  
  // Calculate current actual balance (all transactions before or on today)
  let currentBalance = 0;
  let hasShortage = false;
  let shortageDate: Date | null = null;
  let shortageBalance = 0;

  let runningBalance = 0;
  for (const day of projections) {
      if (isBefore(day.date, today) || day.date.getTime() === today.getTime()) {
          runningBalance = day.balance;
      } else {
          // Future projection
          // We assume the first event sets the starting balance for future if not already tracked
          // Wait, the projection `balance` property already accumulates correctly!
          if (day.balance < 0 && !hasShortage) {
              hasShortage = true;
              shortageDate = day.date;
              shortageBalance = day.balance;
          }
      }
  }

  // Current balance is the last running balance up to today.
  // Actually, wait, the `calculateProjections` returns `balance` property for each day which is the accumulated balance.
  // Let's just find the max date <= today.
  const pastEvents = projections.filter(p => isBefore(p.date, today) || p.date.getTime() === today.getTime());
  if (pastEvents.length > 0) {
      currentBalance = pastEvents[pastEvents.length - 1].balance;
  }

  const incomeThisMonth = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0); // Need proper date filter for "this month"
  
  // Calculate current month's spending by category for budget comparison
  const currentMonthEvents = projections.filter(p => isSameMonth(p.date, today));
  const spendingByCategory = new Map<string, number>();
  
  let currentMonthIncome = 0;
  let currentMonthExpenses = 0;
  
  currentMonthEvents.forEach(day => {
     day.changes.forEach(change => {
         if (change.type === 'expense') {
             const cat = change.category || 'Uncategorized';
             spendingByCategory.set(cat, (spendingByCategory.get(cat) || 0) + change.amount);
         }
         if (change.type === 'income') currentMonthIncome += change.amount;
         if (change.type === 'expense') currentMonthExpenses += change.amount;
     });
  });

  const endOfCurrentMonthDay = startOfDay(endOfMonth(today));
  const pastOrCurrentMonthEvents = projections.filter(p => isBefore(p.date, endOfCurrentMonthDay) || p.date.getTime() === endOfCurrentMonthDay.getTime());
  const endOfCurrentMonthBalance = pastOrCurrentMonthEvents.length > 0 ? pastOrCurrentMonthEvents[pastOrCurrentMonthEvents.length - 1].balance : currentBalance;

  const currentMonthEstimate = {
      income: currentMonthIncome,
      expenses: currentMonthExpenses,
      net: currentMonthIncome - currentMonthExpenses,
      endBalance: endOfCurrentMonthBalance,
      monthName: format(today, 'MMMM')
  };

  // Calculate upcoming recurring payments in the next 14 days
  const next14Days = addDays(today, 14);
  const upcomingPayments = projections
    .filter(p => isAfter(p.date, today) && (isBefore(p.date, next14Days) || isSameDay(p.date, next14Days)))
    .flatMap(p => p.changes.map(c => ({ ...c, date: p.date })))
    .filter(c => c.type === 'expense' && c.isRecurring);

  // Next month estimate notification
  const endOfCurrentMonth = endOfMonth(today);
  const daysUntilEndOfMonth = differenceInDays(endOfCurrentMonth, today);
  const showNextMonthEstimate = true; // Always show for preview, but highlight condition

  const startOfNextMonth = startOfMonth(addMonths(today, 1));
  const endOfNextMonthDay = startOfDay(endOfMonth(addMonths(today, 1)));
  
  const nextMonthEvents = projections.filter(p => 
      (isAfter(p.date, startOfNextMonth) || p.date.getTime() === startOfNextMonth.getTime()) &&
      (isBefore(p.date, endOfNextMonthDay) || p.date.getTime() === endOfNextMonthDay.getTime())
  );
  
  let nextMonthIncome = 0;
  let nextMonthExpenses = 0;
  
  nextMonthEvents.forEach(day => {
      day.changes.forEach(change => {
          if (change.type === 'income') nextMonthIncome += change.amount;
          if (change.type === 'expense') nextMonthExpenses += change.amount;
      });
  });

  const pastOrNextMonthEvents = projections.filter(p => isBefore(p.date, endOfNextMonthDay) || p.date.getTime() === endOfNextMonthDay.getTime());
  const endOfNextMonthBalance = pastOrNextMonthEvents.length > 0 ? pastOrNextMonthEvents[pastOrNextMonthEvents.length - 1].balance : currentBalance;
  
  const nextMonthEstimate = {
      income: nextMonthIncome,
      expenses: nextMonthExpenses,
      net: nextMonthIncome - nextMonthExpenses,
      endBalance: endOfNextMonthBalance,
      monthName: format(startOfNextMonth, 'MMMM')
  };

  const chartData = [];
  let tempBal = currentBalance;
  let projIdx = 0;
  const futureProjections = projections.filter(p => isAfter(p.date, today));
  
  for (let i = 0; i <= daysAhead; i++) {
    const loopDate = addDays(today, i);
    if (projIdx < futureProjections.length && isSameDay(futureProjections[projIdx].date, loopDate)) {
        tempBal = futureProjections[projIdx].balance;
        projIdx++;
    }
    chartData.push({
      date: format(loopDate, 'MMM d'),
      balance: tempBal
    });
  }

  const widgetProps = {
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: { once: true, margin: "0px 0px -50px 0px" },
    variants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <motion.div {...widgetProps} className="card p-6 bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center">
          <div className="text-muted text-sm text-gray-500 mb-2 font-medium">Current Balance</div>
          <div className="text-5xl font-light tracking-tight text-gray-900">
             ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </motion.div>

        {hasShortage && (
            <motion.div {...widgetProps} className="card p-6 bg-red-50 rounded-3xl border border-red-100 col-span-1 md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <DynamicIcon gif="26a0" alt="warning" className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-red-900 font-medium">Cash Shortage Alert</h3>
                   <p className="text-red-700 text-sm mt-1">
                     You are projected to drop below $0.00 on <strong>{shortageDate && format(shortageDate, 'MMM d, yyyy')}</strong>. 
                     Expected balance: <strong>${shortageBalance.toLocaleString()}</strong>
                   </p>
                </div>
            </motion.div>
        )}
        {!hasShortage && (
            <motion.div {...widgetProps} className="card p-6 bg-emerald-50 rounded-3xl border border-emerald-100 col-span-1 md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <DynamicIcon gif="1f4c8" alt="trending up" className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-emerald-900 font-medium text-lg">Finances Looking Good</h3>
                   <p className="text-emerald-700 mt-1 leading-relaxed">
                     No cash shortages projected in the next {daysAhead} days. Keep up the good work!
                   </p>
                </div>
            </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div {...widgetProps} className="bg-fuchsia-50 rounded-3xl border border-fuchsia-100 p-6 flex flex-col md:flex-row md:items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-fuchsia-100 flex items-center justify-center shrink-0 text-fuchsia-600">
                  <DynamicIcon gif="1f4ca" alt="chart" className="w-6 h-6" />
              </div>
              <div className="flex-1 w-full">
                  <h3 className="text-fuchsia-900 font-medium mb-1">
                     This Month's Estimate ({currentMonthEstimate.monthName})
                  </h3>
                  <p className="text-fuchsia-700 text-sm mb-4">
                     Projected balance by month end: <strong>${currentMonthEstimate.endBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>.
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                     <div className="bg-white/60 border border-fuchsia-100 rounded-xl p-3">
                         <div className="text-xs text-fuchsia-600/80 mb-0.5">Total Income</div>
                         <div className="text-sm font-medium text-emerald-700">+${currentMonthEstimate.income.toLocaleString()}</div>
                     </div>
                     <div className="bg-white/60 border border-fuchsia-100 rounded-xl p-3">
                         <div className="text-xs text-fuchsia-600/80 mb-0.5">Total Expenses</div>
                         <div className="text-sm font-medium text-red-700">-${currentMonthEstimate.expenses.toLocaleString()}</div>
                     </div>
                     <div className="bg-white/60 border border-fuchsia-100 rounded-xl p-3 col-span-2 lg:col-span-1">
                         <div className="text-xs text-fuchsia-600/80 mb-0.5">Net Flow</div>
                         <div className={cn("text-sm font-medium", currentMonthEstimate.net >= 0 ? "text-emerald-700" : "text-red-700")}>
                             {currentMonthEstimate.net > 0 ? '+' : ''}${currentMonthEstimate.net.toLocaleString()}
                         </div>
                     </div>
                  </div>
              </div>
          </motion.div>

          <motion.div {...widgetProps} className="bg-purple-50 rounded-3xl border border-purple-100 p-6 flex flex-col md:flex-row md:items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
                  <DynamicIcon gif="1f514" alt="bell" className="w-6 h-6" />
              </div>
              <div className="flex-1 w-full">
                  <h3 className="text-purple-900 font-medium mb-1">
                     Next Month's Estimate ({nextMonthEstimate.monthName})
                  </h3>
                  <p className="text-purple-700 text-sm mb-4">
                     Projected balance by month end: <strong>${nextMonthEstimate.endBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>.
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                     <div className="bg-white/60 border border-purple-100 rounded-xl p-3">
                         <div className="text-xs text-purple-600/80 mb-0.5">Est. Income</div>
                         <div className="text-sm font-medium text-emerald-700">+${nextMonthEstimate.income.toLocaleString()}</div>
                     </div>
                     <div className="bg-white/60 border border-purple-100 rounded-xl p-3">
                         <div className="text-xs text-purple-600/80 mb-0.5">Est. Expenses</div>
                         <div className="text-sm font-medium text-red-700">-${nextMonthEstimate.expenses.toLocaleString()}</div>
                     </div>
                     <div className="bg-white/60 border border-purple-100 rounded-xl p-3 col-span-2 lg:col-span-1">
                         <div className="text-xs text-purple-600/80 mb-0.5">Est. Net Flow</div>
                         <div className={cn("text-sm font-medium", nextMonthEstimate.net >= 0 ? "text-emerald-700" : "text-red-700")}>
                             {nextMonthEstimate.net > 0 ? '+' : ''}${nextMonthEstimate.net.toLocaleString()}
                         </div>
                     </div>
                  </div>
              </div>
          </motion.div>
      </div>

      {upcomingPayments.length > 0 && (
         <motion.div {...widgetProps} className="bg-blue-50 rounded-3xl border border-blue-100 p-6 flex flex-col md:flex-row md:items-start gap-4">
             <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                 <DynamicIcon gif="23f0" alt="clock" className="w-6 h-6" />
             </div>
             <div className="flex-1">
                 <h3 className="text-blue-900 font-medium mb-3">Approaching Recurring Payments</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {upcomingPayments.map((payment, i) => (
                        <div key={i} className="bg-white/60 border border-blue-100 rounded-xl p-3 flex justify-between items-center">
                            <div>
                               <div className="text-sm font-medium text-gray-900">{payment.title}</div>
                               <div className="text-xs text-gray-500 mt-0.5">Due {format(payment.date, 'MMM d, yyyy')}</div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                               ${payment.amount.toLocaleString()}
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
         </motion.div>
      )}

      <motion.div {...widgetProps} className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Projected Balance (1 Year)</h3>
            <div className="text-sm text-emerald-600 font-medium">Trend</div>
        </div>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#9ca3af' }} 
                        minTickGap={45} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#9ca3af' }} 
                        tickFormatter={(value) => `$${value}`} 
                        width={60}
                    />
                    <Tooltip 
                        cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}
                        itemStyle={{ color: '#10b981', fontWeight: 500 }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorBalance)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {budgets.length > 0 && (
             <motion.div {...widgetProps} className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 overflow-hidden">
                 <h3 className="text-lg font-medium text-gray-900 mb-6">Monthly Budgets</h3>
                 <div className="space-y-5">
                    {budgets.map(budget => {
                        const spent = spendingByCategory.get(budget.category) || 0;
                        const percent = Math.min(100, Math.max(0, (spent / budget.amount) * 100));
                        const isOver = spent > budget.amount;
                        const isWarning = percent >= 80 && !isOver;
                        
                        return (
                            <div key={budget.id} className="space-y-2">
                               <div className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-900">{budget.category}</span>
                                  <span className="text-gray-500">
                                     <span className={isOver ? 'text-red-600 font-medium' : 'text-gray-900'}>
                                        ${spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                     </span> 
                                     <span className="mx-1">/</span> 
                                     ${budget.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </span>
                               </div>
                               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={cn(
                                       "h-full rounded-full",
                                       isOver ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-emerald-500"
                                    )}
                                  />
                               </div>
                            </div>
                        )
                    })}
                 </div>
             </motion.div>
          )}

          <motion.div {...widgetProps} className={cn("bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 overflow-hidden", budgets.length === 0 ? "md:col-span-2" : "")}>
             <h3 className="text-lg font-medium text-gray-900 mb-6">Upcoming Events</h3>
         <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {projections.filter(p => isAfter(p.date, today)).slice(0, 10).map((day, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-2">
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium w-16 text-gray-500">
                           {format(day.date, 'MMM d')}
                        </div>
                        <div className="space-y-1">
                           {day.changes.map((change, cidx) => (
                               <div key={cidx} className="flex items-center gap-2">
                                  <span className={cn(
                                      "text-sm font-medium",
                                      change.type === 'income' ? "text-emerald-600" : "text-gray-900"
                                  )}>
                                      {change.type === 'income' ? '+' : '-'}${change.amount.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-500">{change.title}</span>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div className="text-sm text-gray-400 font-mono text-right mt-2 sm:mt-0">
                         Bal: ${day.balance.toLocaleString()}
                    </div>
                </div>
            ))}
            {projections.filter(p => isAfter(p.date, today)).length === 0 && (
                <div className="text-sm text-gray-500 italic py-4">No upcoming events projected.</div>
            )}
         </div>
      </motion.div>
      </div>
    </div>
  );
}
