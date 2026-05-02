import { addMonths, addYears, isAfter, isBefore, startOfDay, parseISO, compareAsc, differenceInMonths, differenceInYears } from 'date-fns';
import { Transaction } from './types';

export interface ProjectedDay {
  date: Date;
  balance: number;
  changes: { title: string; amount: number; type: 'income' | 'expense'; category?: string; isRecurring?: boolean; transactionId?: string }[];
}

export function calculateProjections(transactions: Transaction[], daysAhead: number = 365): ProjectedDay[] {
  const today = startOfDay(new Date());
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysAhead);

  interface Event {
    date: Date;
    transaction: Transaction;
  }

  const events: Event[] = [];

  transactions.forEach((t) => {
    const tDate = startOfDay(parseISO(t.date));
    
    // Add original occurrence
    events.push({ date: tDate, transaction: t });

    // Generate future recurrences
    if (t.recurrence !== 'none') {
      let currentRecurrence = tDate;
      let failsafe = 0;
      while (isBefore(currentRecurrence, endDate) && failsafe < 500) {
        failsafe++;
        if (t.recurrence === 'monthly') {
          currentRecurrence = addMonths(currentRecurrence, 1);
        } else if (t.recurrence === 'yearly') {
          currentRecurrence = addYears(currentRecurrence, 1);
        }

        if (isBefore(currentRecurrence, endDate) || currentRecurrence.getTime() === endDate.getTime()) {
            // only push if it's strictly greater than the original date
            if (isAfter(currentRecurrence, tDate)) {
                events.push({ date: currentRecurrence, transaction: t });
            }
        }
      }
    }
  });

  // Sort events by date
  events.sort((a, b) => compareAsc(a.date, b.date));

  // Accumulate balances day by day
  let currentBalance = 0;
  const projectedDaysMap = new Map<number, ProjectedDay>();

  // Initialize today
  projectedDaysMap.set(today.getTime(), { date: today, balance: 0, changes: [] });

  let balanceBeforeEvent = 0;
  
  events.forEach((event) => {
    const dayTime = event.date.getTime();
    const changeAmount = event.transaction.type === 'income' ? event.transaction.amount : -event.transaction.amount;
    
    if (!projectedDaysMap.has(dayTime)) {
      projectedDaysMap.set(dayTime, { date: event.date, balance: balanceBeforeEvent, changes: [] });
    }
    
    const day = projectedDaysMap.get(dayTime)!;
    day.balance += changeAmount;
    day.changes.push({
      title: event.transaction.title,
      amount: event.transaction.amount,
      type: event.transaction.type,
      category: event.transaction.category,
      isRecurring: event.transaction.recurrence !== 'none',
      transactionId: event.transaction.id
    });
    balanceBeforeEvent = day.balance;
  });

  // Re-calculate the continuous balance line if needed, but we only really care about the points where something changed.
  // Actually, we want to know the balance on `today`, and if any FUTURE day dips below 0.
  
  // Let's create an ordered list of projected events
  const sortedDays = Array.from(projectedDaysMap.values()).sort((a, b) => compareAsc(a.date, b.date));

  // The true current balance is the balance at the end of `today` or closest past event
  return sortedDays;
}

export function getRecurringDates(dateStr: string, recurrence: 'monthly' | 'yearly') {
  const tDate = startOfDay(parseISO(dateStr));
  const today = startOfDay(new Date());

  if (isAfter(tDate, today)) {
    return { next: tDate, previous: null };
  }

  let diff = 0;
  let nextDate = tDate;
  
  if (recurrence === 'monthly') {
     diff = differenceInMonths(today, tDate);
     nextDate = addMonths(tDate, diff);
     if (isBefore(nextDate, today)) {
         nextDate = addMonths(tDate, diff + 1);
         diff += 1;
     }
     const prevDate = diff > 0 ? addMonths(tDate, diff - 1) : null;
     return { next: nextDate, previous: prevDate };
  } else if (recurrence === 'yearly') {
     diff = differenceInYears(today, tDate);
     nextDate = addYears(tDate, diff);
     if (isBefore(nextDate, today)) {
         nextDate = addYears(tDate, diff + 1);
         diff += 1;
     }
     const prevDate = diff > 0 ? addYears(tDate, diff - 1) : null;
     return { next: nextDate, previous: prevDate };
  }
  return { next: null, previous: null };
}
