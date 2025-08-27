export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: "mama_products" | "bags" | "paper_bags" | "handcrafted" | "home_decor" | "accessories" | "other";
  type: "outlet_item" | "supplier_item"; // Company products vs supplier items
  currentStock: number; // Changed from kg to qty
  unitPrice: number;
  salePrice: number; // Different from unit price for profit margin
  minStockLevel: number;
  lastUpdated: string;
  totalCollected: number;
  totalSold: number;
  supplier?: string; // For supplier items
  barcode?: string; // Product barcode
  sku?: string; // Stock keeping unit
  vatRate: number; // VAT percentage (15% standard in Ethiopia)
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  status: "active" | "inactive";
  totalCollections: number;
  lastCollection?: string;
}

export interface CollectionTransaction {
  id: string;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  image?: string;
  date: string;
  notes?: string;
  receiptNumber: string;
}

export interface SaleTransaction {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  date: string;
  receiptNumber: string;
  paymentMethod: "cash" | "mobile" | "bank";
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  type: "collection" | "sale";
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    vatAmount: number;
  }>;
  subtotal: number;
  totalVAT: number;
  totalAmount: number;
  date: string;
  supplierName?: string;
  customerName?: string;
  notes?: string;
  paymentMethod?: "cash" | "mobile" | "bank";
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    tinNumber: string;
    vatNumber: string;
  };
}

export interface InventoryReport {
  totalItems: number;
  totalValue: number;
  lowStockItems: InventoryItem[];
  topSellingItems: Array<{
    item: InventoryItem;
    salesCount: number;
    revenue: number;
  }>;
  monthlyCollections: number;
  monthlySales: number;
  profitMargin: number;
}