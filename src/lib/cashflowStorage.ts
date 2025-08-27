import { BankAccount, CashFlowTransaction, Payable, Receivable, FinancialSummary } from '@/types/cashflow';

// Storage keys
const BANKS_KEY = 'bank_accounts';
const TRANSACTIONS_KEY = 'cashflow_transactions';
const PAYABLES_KEY = 'payables';
const RECEIVABLES_KEY = 'receivables';

// Helper functions
const getFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Default banks
const defaultBanks: BankAccount[] = [
  { id: '1', name: 'CBE Bank', balance: 620252.27, lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Awash Bank', balance: 150000.00, lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Abissinia Bank', balance: 85000.00, lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Zemen Bank', balance: 42000.00, lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Dashen Bank', balance: 125000.00, lastUpdated: new Date().toISOString() },
  { id: '6', name: 'Abay Bank', balance: 95000.00, lastUpdated: new Date().toISOString() },
  { id: '7', name: 'Enat Bank', balance: 78000.00, lastUpdated: new Date().toISOString() },
];

// Bank operations
export const getBankAccounts = (): BankAccount[] => {
  const banks = getFromStorage(BANKS_KEY, defaultBanks);
  if (banks.length === 0) {
    saveToStorage(BANKS_KEY, defaultBanks);
    return defaultBanks;
  }
  return banks;
};

export const updateBankBalance = (bankId: string, amount: number, isDebit: boolean): BankAccount | null => {
  const banks = getBankAccounts();
  const bankIndex = banks.findIndex(bank => bank.id === bankId);
  if (bankIndex === -1) return null;

  const currentBalance = banks[bankIndex].balance;
  const newBalance = isDebit ? currentBalance - amount : currentBalance + amount;
  
  banks[bankIndex] = {
    ...banks[bankIndex],
    balance: newBalance,
    lastUpdated: new Date().toISOString()
  };
  
  saveToStorage(BANKS_KEY, banks);
  return banks[bankIndex];
};

// Transaction operations
export const getCashFlowTransactions = (): CashFlowTransaction[] => {
  return getFromStorage(TRANSACTIONS_KEY, []);
};

export const saveCashFlowTransaction = (transaction: Omit<CashFlowTransaction, 'id' | 'createdAt' | 'balance' | 'bankBalance'>): CashFlowTransaction | null => {
  const transactions = getCashFlowTransactions();
  const banks = getBankAccounts();
  
  const bank = banks.find(b => b.id === transaction.bankId);
  if (!bank) return null;

  // Update bank balance
  const isDebit = transaction.debit > 0;
  const updatedBank = updateBankBalance(transaction.bankId, isDebit ? transaction.debit : transaction.credit, isDebit);
  if (!updatedBank) return null;

  // Calculate running balance
  const bankTransactions = transactions.filter(t => t.bankId === transaction.bankId);
  const lastTransaction = bankTransactions[bankTransactions.length - 1];
  const previousBalance = lastTransaction ? lastTransaction.balance : bank.balance;
  const newBalance = isDebit ? previousBalance - transaction.debit : previousBalance + transaction.credit;

  const newTransaction: CashFlowTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    balance: newBalance,
    bankBalance: updatedBank.balance,
    createdAt: new Date().toISOString(),
  };

  transactions.push(newTransaction);
  saveToStorage(TRANSACTIONS_KEY, transactions);
  return newTransaction;
};

// Payables operations
export const getPayables = (): Payable[] => {
  return getFromStorage(PAYABLES_KEY, []);
};

export const savePayable = (payable: Omit<Payable, 'id' | 'createdAt' | 'pending'>): Payable => {
  const payables = getPayables();
  const newPayable: Payable = {
    ...payable,
    id: crypto.randomUUID(),
    pending: payable.amount - payable.paid,
    createdAt: new Date().toISOString(),
  };
  
  payables.push(newPayable);
  saveToStorage(PAYABLES_KEY, payables);
  return newPayable;
};

export const updatePayable = (id: string, updates: Partial<Payable>): Payable | null => {
  const payables = getPayables();
  const index = payables.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedPayable = {
    ...payables[index],
    ...updates,
    pending: updates.amount ? (updates.amount - (updates.paid || payables[index].paid)) : payables[index].pending
  };

  payables[index] = updatedPayable;
  saveToStorage(PAYABLES_KEY, payables);
  return updatedPayable;
};

// Receivables operations
export const getReceivables = (): Receivable[] => {
  return getFromStorage(RECEIVABLES_KEY, []);
};

export const saveReceivable = (receivable: Omit<Receivable, 'id' | 'createdAt'>): Receivable => {
  const receivables = getReceivables();
  const newReceivable: Receivable = {
    ...receivable,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  receivables.push(newReceivable);
  saveToStorage(RECEIVABLES_KEY, receivables);
  return newReceivable;
};

export const updateReceivable = (id: string, updates: Partial<Receivable>): Receivable | null => {
  const receivables = getReceivables();
  const index = receivables.findIndex(r => r.id === id);
  if (index === -1) return null;

  receivables[index] = { ...receivables[index], ...updates };
  saveToStorage(RECEIVABLES_KEY, receivables);
  return receivables[index];
};

// Financial summary
export const getFinancialSummary = (): FinancialSummary => {
  const payables = getPayables();
  const receivables = getReceivables();
  const banks = getBankAccounts();

  const totalPayable = payables.reduce((sum, p) => sum + p.pending, 0);
  const totalReceivable = receivables.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + r.amount, 0);
  const totalBankBalance = banks.reduce((sum, b) => sum + b.balance, 0);
  const cashBalance = totalBankBalance;
  const cashReceivableBalance = cashBalance + totalReceivable - totalPayable;
  const difference = totalReceivable - totalPayable;

  return {
    totalPayable,
    totalReceivable,
    totalBankBalance,
    cashBalance,
    cashReceivableBalance,
    difference
  };
};