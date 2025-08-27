import { InventoryItem, Supplier, CollectionTransaction, SaleTransaction, Receipt } from '@/types/inventory';

// Storage keys
const INVENTORY_KEY = 'inventory_items';
const SUPPLIERS_KEY = 'suppliers';
const COLLECTIONS_KEY = 'collection_transactions';
const SALES_KEY = 'sale_transactions';
const RECEIPTS_KEY = 'receipts';

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

const generateReceiptNumber = (type: 'COL' | 'SAL'): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${type}-${timestamp}-${random}`;
};

// Inventory Items
export const getInventoryItems = (): InventoryItem[] => {
  return getFromStorage(INVENTORY_KEY, []);
};

export const saveInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem => {
  const items = getInventoryItems();
  const newItem: InventoryItem = {
    ...item,
    id: crypto.randomUUID(),
    lastUpdated: new Date().toISOString(),
  };
  items.push(newItem);
  saveToStorage(INVENTORY_KEY, items);
  return newItem;
};

export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): InventoryItem | null => {
  const items = getInventoryItems();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates, lastUpdated: new Date().toISOString() };
  saveToStorage(INVENTORY_KEY, items);
  return items[index];
};

export const deleteInventoryItem = (id: string): boolean => {
  const items = getInventoryItems();
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  
  saveToStorage(INVENTORY_KEY, filtered);
  return true;
};

// Suppliers
export const getSuppliers = (): Supplier[] => {
  return getFromStorage(SUPPLIERS_KEY, []);
};

export const saveSupplier = (supplier: Omit<Supplier, 'id'>): Supplier => {
  const suppliers = getSuppliers();
  const newSupplier: Supplier = {
    ...supplier,
    id: crypto.randomUUID(),
  };
  suppliers.push(newSupplier);
  saveToStorage(SUPPLIERS_KEY, suppliers);
  return newSupplier;
};

export const updateSupplier = (id: string, updates: Partial<Supplier>): Supplier | null => {
  const suppliers = getSuppliers();
  const index = suppliers.findIndex(supplier => supplier.id === id);
  if (index === -1) return null;
  
  suppliers[index] = { ...suppliers[index], ...updates };
  saveToStorage(SUPPLIERS_KEY, suppliers);
  return suppliers[index];
};

// Collection Transactions
export const getCollectionTransactions = (): CollectionTransaction[] => {
  return getFromStorage(COLLECTIONS_KEY, []);
};

export const saveCollectionTransaction = (transaction: Omit<CollectionTransaction, 'id' | 'date' | 'receiptNumber'>): CollectionTransaction => {
  const transactions = getCollectionTransactions();
  const newTransaction: CollectionTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    receiptNumber: generateReceiptNumber('COL'),
  };
  
  // Update inventory stock
  const items = getInventoryItems();
  const itemIndex = items.findIndex(item => item.id === transaction.itemId);
  if (itemIndex !== -1) {
    items[itemIndex].currentStock += transaction.quantity;
    items[itemIndex].totalCollected += transaction.quantity;
    items[itemIndex].lastUpdated = new Date().toISOString();
    saveToStorage(INVENTORY_KEY, items);
  }
  
  // Update supplier stats
  const suppliers = getSuppliers();
  const supplierIndex = suppliers.findIndex(supplier => supplier.id === transaction.supplierId);
  if (supplierIndex !== -1) {
    suppliers[supplierIndex].totalCollections += transaction.totalAmount;
    suppliers[supplierIndex].lastCollection = new Date().toISOString();
    saveToStorage(SUPPLIERS_KEY, suppliers);
  }
  
  transactions.push(newTransaction);
  saveToStorage(COLLECTIONS_KEY, transactions);
  
  // Generate receipt
  const receipt: Receipt = {
    id: crypto.randomUUID(),
    receiptNumber: newTransaction.receiptNumber,
    type: 'collection',
    items: [{
      name: transaction.itemName,
      quantity: transaction.quantity,
      unitPrice: transaction.unitPrice,
      totalAmount: transaction.totalAmount,
    }],
    totalAmount: transaction.totalAmount,
    date: newTransaction.date,
    supplierName: transaction.supplierName,
    notes: transaction.notes,
  };
  saveReceipt(receipt);
  
  return newTransaction;
};

// Sale Transactions
export const getSaleTransactions = (): SaleTransaction[] => {
  return getFromStorage(SALES_KEY, []);
};

export const saveSaleTransaction = (transaction: Omit<SaleTransaction, 'id' | 'date' | 'receiptNumber'>): SaleTransaction | null => {
  const items = getInventoryItems();
  const itemIndex = items.findIndex(item => item.id === transaction.itemId);
  
  if (itemIndex === -1 || items[itemIndex].currentStock < transaction.quantity) {
    return null; // Insufficient stock
  }
  
  const transactions = getSaleTransactions();
  const newTransaction: SaleTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    receiptNumber: generateReceiptNumber('SAL'),
  };
  
  // Update inventory stock
  items[itemIndex].currentStock -= transaction.quantity;
  items[itemIndex].totalSold += transaction.quantity;
  items[itemIndex].lastUpdated = new Date().toISOString();
  saveToStorage(INVENTORY_KEY, items);
  
  transactions.push(newTransaction);
  saveToStorage(SALES_KEY, transactions);
  
  // Generate receipt
  const receipt: Receipt = {
    id: crypto.randomUUID(),
    receiptNumber: newTransaction.receiptNumber,
    type: 'sale',
    items: [{
      name: transaction.itemName,
      quantity: transaction.quantity,
      unitPrice: transaction.unitPrice,
      totalAmount: transaction.totalAmount,
    }],
    totalAmount: transaction.totalAmount,
    date: newTransaction.date,
    customerName: transaction.customerName,
  };
  saveReceipt(receipt);
  
  return newTransaction;
};

// Receipts
export const getReceipts = (): Receipt[] => {
  return getFromStorage(RECEIPTS_KEY, []);
};

export const saveReceipt = (receipt: Receipt): void => {
  const receipts = getReceipts();
  receipts.push(receipt);
  saveToStorage(RECEIPTS_KEY, receipts);
};

export const getReceiptByNumber = (receiptNumber: string): Receipt | null => {
  const receipts = getReceipts();
  return receipts.find(receipt => receipt.receiptNumber === receiptNumber) || null;
};
