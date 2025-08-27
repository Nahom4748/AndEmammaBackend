export interface SupplierRequest {
  id: number;
  supplierId: number;
  supplierName: string;
  requestType: "paper" | "collection" | "payment" | "schedule";
  paperTypes: {
    carton: number;
    mixed: number;
    sw: number; // sorted white
    sc: number; // sorted colored
    np: number; // newspaper
  };
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "processing";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedValue: number;
  notes?: string;
  adminResponse?: string;
  responseDate?: string;
}

export interface AdminNotification {
  id: number;
  type: "supplier_request" | "payment_due" | "low_stock" | "performance_alert";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedId?: number;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface PaymentCalculation {
  supplierId: number;
  supplierName: string;
  dateRange: {
    from: string;
    to: string;
  };
  collections: {
    carton: { quantity: number; rate: number; amount: number };
    mixed: { quantity: number; rate: number; amount: number };
    sw: { quantity: number; rate: number; amount: number };
    sc: { quantity: number; rate: number; amount: number };
    np: { quantity: number; rate: number; amount: number };
  };
  totalAmount: number;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
}

export const UPDATED_PAYMENT_RATES = {
  mixed: 5,
  carton: 7,
  sw: 7, // sorted white  
  sc: 5, // sorted colored
  np: 30 // newspaper
} as const;