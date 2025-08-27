export interface Employee {
  id: number;
  name: string;
  fullName: string;
  role: "coordinator" | "regular" | "instore" | "manager" | "driver";
  email?: string;
  phone: string;
  joinDate: string;
  status: "active" | "inactive";
  salary?: number;
  address?: string;
  emergencyContact?: string;
  accountNumber?: string;
}

export interface Mama {
  id: number;
  fullName: string;
  woreda: string;
  phone: string;
  joinDate: string;
  accountNumber: string;
  status: "active" | "inactive";
  totalCollections?: number;
  monthlyEarnings?: number;
  assignedArea?: string;
}

export interface StoreInventory {
  id: number;
  type: "mixed" | "carton" | "newspaper" | "sc" | "sw";
  totalKg: number;
  currentMonth: {
    collected: number;
    sold: number;
    revenue: number;
  };
  lastUpdated: string;
  price: number; // per kg
}