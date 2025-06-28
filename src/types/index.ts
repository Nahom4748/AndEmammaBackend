export interface Marketer {
  id: number;
  name: string;
  fullName: string;
  account: string;
  email: string;
  phone: string;
  assignedSuppliers: number[];
  totalCollections: number;
  monthlyEarnings: number;
  status: "active" | "inactive";
  joinDate: string;
  products: {
    mommasHandles: number;
    giftBaskets: number;
    wallDecor: number;
    totalProducts: number;
  };
  training: {
    productTraining: boolean;
    salesTraining: boolean;
    customerServiceTraining: boolean;
    completedDate?: string;
  };
  ambassador: {
    isAmbassador: boolean;
    level?: "Bronze" | "Silver" | "Gold" | "Platinum";
    achievementDate?: string;
    specialties: string[];
  };
  weeklySchedule: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
}

export interface CollectionReport {
  id: number;
  supplierId: number;
  supplierName: string;
  date: string;
  type: "instore" | "regular";
  contactPerson: string;
  description: string;
  needsShredder: boolean;
  collectionTypes: string[];
  totalWeight: number;
  marketerId: number;
  status: "scheduled" | "completed" | "pending";
  followUpRequired: boolean;
  notes?: string;
}

export interface DailyReport {
  date: string;
  totalCollections: number;
  totalWeight: number;
  completedReports: CollectionReport[];
  pendingReports: CollectionReport[];
  issues: string[];
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalCollections: number;
  totalWeight: number;
  supplierPerformance: {
    supplierId: number;
    supplierName: string;
    collections: number;
    weight: number;
  }[];
  marketerPerformance: {
    marketerId: number;
    marketerName: string;
    collections: number;
    efficiency: number;
  }[];
}

export const PAYMENT_RATES = {
  sw: 5,
  mixed: 5,
  carton: 7,
  sc: 5,
  np: 30
} as const;
