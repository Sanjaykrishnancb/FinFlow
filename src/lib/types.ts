export type TransactionType = 'income' | 'expense';
export type Recurrence = 'none' | 'monthly' | 'yearly';

export const DEFAULT_CATEGORIES = [
  'Housing', 'Food', 'Utilities', 'Transportation', 
  'Entertainment', 'Health', 'Shopping', 'Other', 'Uncategorized'
];

export interface Category {
  id: string;
  name: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  recurrence: Recurrence;
  date: string; // ISO date string
  category?: string;
}
