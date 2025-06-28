
export interface EmployeePerformance {
  id: number;
  name: string;
  role: "coordinator" | "regular" | "instore";
  monthlyTarget: number; // in kg
  weeklyTarget: number; // in kg
  currentMonthCollection: number; // in kg
  currentWeekCollection: number; // in kg
  monthlyPercentage: number;
  weeklyPercentage: number;
  averageDaily: number;
  totalCollections: number;
  efficiency: number;
}

export interface CarPerformance {
  carName: string;
  driver: string;
  totalCollections: number;
  totalKg: number;
  weeklyCollections: number;
  weeklyKg: number;
  efficiency: number;
  fuelCost: number;
  routesCompleted: number;
}

export interface StorePerformance {
  storeName: string;
  manager: string;
  totalCollections: number;
  totalKg: number;
  weeklyCollections: number;
  weeklyKg: number;
  efficiency: number;
  revenue: number;
}

export interface SupplierPerformance {
  id: number;
  name: string;
  address: string;
  totalCollections: number;
  totalKg: number;
  weeklyCollections: number;
  weeklyKg: number;
  efficiency: number;
  lastCollection: string;
  preferredCollector: string;
}
