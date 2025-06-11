
export interface Marketer {
  id: number;
  name: string;
  email: string;
  phone: string;
  assignedSuppliers: number[];
  totalCollections: number;
  monthlyEarnings: number;
  status: "active" | "inactive";
  joinDate: string;
}

export interface Collection {
  id: number;
  date: string;
  day: string;
  supplier: string;
  carType: string;
  bagCode?: string;
  type: string;
  collectionType: "regular" | "instore";
  paperType: "sw" | "mixed" | "carton" | "sc" | "np";
  quantity: number;
  marketerId: number;
  amount: number;
}

export interface PaymentRate {
  sw: number;
  mixed: number;
  carton: number;
  sc: number;
  np: number;
}

export const PAYMENT_RATES: PaymentRate = {
  sw: 5,
  mixed: 5,
  carton: 7,
  sc: 5,
  np: 30
};
