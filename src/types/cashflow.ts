  id: string;
  name: string;
  balance: number;
  lastUpdated: string;
}

export interface CashFlowTransaction {
  id: string;
  date: string;
  paidTo?: string;
  receivedFrom?: string;
  description: string;
  pvNumber?: string;
  chequeNumber?: string;
  fsNumber?: string;
  debit: number;
  credit: number;
  balance: number;
  bankBalance: number;
  remark?: string;
  bankId: string;
  bankName: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer';
  createdAt: string;
}

export interface Payable {
  id: string;
  dueDate: string;
  paidTo: string;
  purpose: string;
  amount: number;
  paid: number;
  pending: number;
  status: 'paid' | 'unpaid' | 'partial';
  firstPriority: number;
  secondPriority: number;
  thirdPriority: number;
  remark?: string;
  createdAt: string;
}

export interface Receivable {
  id: string;
  dueDate: string;
  receivableFrom: string;
  purpose: string;
  amount: number;
  bank: string;
  status: 'paid' | 'unpaid' | 'partial';
  remark?: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalPayable: number;
  totalReceivable: number;
  totalBankBalance: number;
  cashBalance: number;
  cashReceivableBalance: number;
  difference: number;
}