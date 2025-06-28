
import { Marketer } from "@/types";

export const marketersData: Marketer[] = [
  {
    id: 1,
    name: "Sefu Tekle",
    fullName: "Sefu Tekle Mamo",
    account: "MKT-001-2024",
    email: "sefu.tekle@company.com",
    phone: "+251-911-123-456",
    assignedSuppliers: [1, 2, 3, 8, 10, 11, 12, 13],
    totalCollections: 245,
    monthlyEarnings: 12250,
    status: "active",
    joinDate: "2024-01-15",
    products: {
      mommasHandles: 45,
      giftBaskets: 32,
      wallDecor: 28,
      totalProducts: 105
    },
    training: {
      productTraining: true,
      salesTraining: true,
      customerServiceTraining: true,
      completedDate: "2024-02-20"
    },
    ambassador: {
      isAmbassador: true,
      level: "Gold",
      achievementDate: "2024-06-15",
      specialties: ["Paper Collection", "Customer Relations", "Training"]
    },
    weeklySchedule: {
      monday: ["Addis Ababa University", "FDRE Ministry of Justice"],
      tuesday: ["Ethiopian Chamber", "ICS Solutions"],
      wednesday: ["AA Tax Payers Merkato No 2", "AA Tax Payers Merkato No 3"],
      thursday: ["FDRE Ministry of Justice Arada", "Educational Equipment"],
      friday: ["Addis Ababa University", "Ethiopian Chamber"],
      saturday: ["ICS Solutions"],
      sunday: []
    }
  },
  {
    id: 2,
    name: "Abrar Mohammed",
    fullName: "Abrar Mohammed Ali",
    account: "MKT-002-2024",
    email: "abrar.mohammed@company.com",
    phone: "+251-911-234-567",
    assignedSuppliers: [4, 5, 6, 14, 15],
    totalCollections: 189,
    monthlyEarnings: 9450,
    status: "active",
    joinDate: "2024-02-20",
    products: {
      mommasHandles: 38,
      giftBaskets: 25,
      wallDecor: 22,
      totalProducts: 85
    },
    training: {
      productTraining: true,
      salesTraining: true,
      customerServiceTraining: false
    },
    ambassador: {
      isAmbassador: true,
      level: "Silver",
      achievementDate: "2024-08-10",
      specialties: ["Product Development", "Quality Control"]
    },
    weeklySchedule: {
      monday: ["AACA Farms Commission", "Kotebe Educational University"],
      tuesday: ["Bole Federal Supreme Court", "Educational Equipment"],
      wednesday: ["Ethiopian Meteorology Institute"],
      thursday: ["AACA Farms Commission", "Kotebe Educational University"],
      friday: ["Bole Federal Supreme Court"],
      saturday: [],
      sunday: []
    }
  },
  {
    id: 3,
    name: "Adisu Bekele",
    fullName: "Adisu Bekele Worku",
    account: "MKT-003-2024",
    email: "adisu.bekele@company.com",
    phone: "+251-911-345-678",
    assignedSuppliers: [7, 9, 16, 17, 18],
    totalCollections: 167,
    monthlyEarnings: 8350,
    status: "active",
    joinDate: "2024-03-10",
    products: {
      mommasHandles: 32,
      giftBaskets: 28,
      wallDecor: 19,
      totalProducts: 79
    },
    training: {
      productTraining: true,
      salesTraining: false,
      customerServiceTraining: true
    },
    ambassador: {
      isAmbassador: false,
      specialties: []
    },
    weeklySchedule: {
      monday: ["Federal First Instance Court Kirkos", "Addis Ketema Industrial College"],
      tuesday: ["Dashin Bank Mesikel Flower", "Dashin Bank Africa Andinet"],
      wednesday: ["AA Investment Commission"],
      thursday: ["Federal First Instance Court Kirkos"],
      friday: ["Addis Ketema Industrial College", "Dashin Bank Africa Andinet"],
      saturday: [],
      sunday: []
    }
  },
  {
    id: 4,
    name: "Aberar Haile",
    fullName: "Aberar Haile Gebremedhin",
    account: "MKT-004-2024",
    email: "aberar.haile@company.com",
    phone: "+251-911-456-789",
    assignedSuppliers: [19, 20],
    totalCollections: 98,
    monthlyEarnings: 4900,
    status: "inactive",
    joinDate: "2024-04-05",
    products: {
      mommasHandles: 18,
      giftBaskets: 12,
      wallDecor: 8,
      totalProducts: 38
    },
    training: {
      productTraining: false,
      salesTraining: false,
      customerServiceTraining: false
    },
    ambassador: {
      isAmbassador: false,
      specialties: []
    },
    weeklySchedule: {
      monday: ["Industry Park"],
      tuesday: ["First Instance Court Addis Ketema"],
      wednesday: [],
      thursday: ["Industry Park"],
      friday: [],
      saturday: [],
      sunday: []
    }
  }
];
