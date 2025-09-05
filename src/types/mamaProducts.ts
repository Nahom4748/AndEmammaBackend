export interface MamaProduct {
  id: string;
  mamaId: number;
  mamaName: string;
  productType: "mommasHandles" | "giftBaskets" | "wallDecor" | "andamma";
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  date: string;
  notes?: string;
  // For andamma products
  andammaProductId?: string;
  andammaProductName?: string;
  andammaType?: "withTube" | "withoutTube";
}

export interface Mama {
  id: number;
  name: string;
  phone?: string;
  status: "active" | "inactive";
  joinDate: string;
}

export interface MamaPayment {
  mamaId: number;
  mamaName: string;
  products: {
    mommasHandles: { quantity: number; amount: number };
    giftBaskets: { quantity: number; amount: number };
    wallDecor: { quantity: number; amount: number };
  };
  totalQuantity: number;
  totalAmount: number;
  workingDays: number;
}

export const PRODUCT_PRICES = {
  mommasHandles: 15,
  giftBaskets: 25,
  wallDecor: 20,
  andamma: 0  // Dynamic price based on selected product
} as const;

export const PRODUCT_LABELS = {
  mommasHandles: "Momma's Handles",
  giftBaskets: "Gift Baskets",
  wallDecor: "Wall Decor",
  andamma: "Andamma Products"
} as const;