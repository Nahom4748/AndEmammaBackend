import { Employee, Mama, StoreInventory } from "@/types/employee";

export const employeeData: Employee[] = [
  {
    id: 1,
    name: "Aschlew",
    fullName: "Aschlew Bekele Worku",
    role: "coordinator",
    email: "aschlew.bekele@company.com",
    phone: "+251-911-111-111",
    joinDate: "2023-01-15",
    status: "active",
    salary: 8000,
    address: "Addis Ababa, Kirkos",
    emergencyContact: "+251-911-222-222",
    accountNumber: "EMP-001-2023"
  },
  {
    id: 2,
    name: "Sefu",
    fullName: "Sefu Tekle Mamo",
    role: "coordinator",
    email: "sefu.tekle@company.com",
    phone: "+251-911-123-456",
    joinDate: "2023-02-20",
    status: "active",
    salary: 8000,
    address: "Addis Ababa, Bole",
    emergencyContact: "+251-911-333-333",
    accountNumber: "EMP-002-2023"
  },
  {
    id: 3,
    name: "Zelalem",
    fullName: "Zelalem Haile Gebremedhin",
    role: "regular",
    email: "zelalem.haile@company.com",
    phone: "+251-911-444-444",
    joinDate: "2023-03-10",
    status: "active",
    salary: 6000,
    address: "Addis Ababa, Arada",
    emergencyContact: "+251-911-555-555",
    accountNumber: "EMP-003-2023"
  },
  {
    id: 4,
    name: "Manzefro",
    fullName: "Manzefro Haile Mariam",
    role: "instore",
    email: "manzefro.haile@company.com",
    phone: "+251-911-666-666",
    joinDate: "2023-04-05",
    status: "active",
    salary: 5500,
    address: "Addis Ababa, Yeka",
    emergencyContact: "+251-911-777-777",
    accountNumber: "EMP-004-2023"
  },
  {
    id: 5,
    name: "Abrar",
    fullName: "Abrar Mohammed Ali",
    role: "driver",
    email: "abrar.mohammed@company.com",
    phone: "+251-911-234-567",
    joinDate: "2023-05-12",
    status: "active",
    salary: 7000,
    address: "Addis Ababa, Gulele",
    emergencyContact: "+251-911-888-888",
    accountNumber: "EMP-005-2023"
  }
];

export const mamasData: Mama[] = [
  {
    id: 1,
    fullName: "Almaz Tadesse Bekele",
    woreda: "Kirkos Woreda 01",
    phone: "+251-911-100-001",
    joinDate: "2023-06-01",
    accountNumber: "MAMA-001-2023",
    status: "active",
    totalCollections: 145,
    monthlyEarnings: 7250,
    assignedArea: "Arat Kilo"
  },
  {
    id: 2,
    fullName: "Hanan Ibrahim Mohammed",
    woreda: "Bole Woreda 03",
    phone: "+251-911-100-002",
    joinDate: "2023-06-15",
    accountNumber: "MAMA-002-2023",
    status: "active",
    totalCollections: 132,
    monthlyEarnings: 6600,
    assignedArea: "Bole Medhanialem"
  },
  {
    id: 3,
    fullName: "Tigist Mekonnen Wolde",
    woreda: "Arada Woreda 02",
    phone: "+251-911-100-003",
    joinDate: "2023-07-01",
    accountNumber: "MAMA-003-2023",
    status: "active",
    totalCollections: 98,
    monthlyEarnings: 4900,
    assignedArea: "Piassa"
  },
  {
    id: 4,
    fullName: "Meseret Girma Desta",
    woreda: "Yeka Woreda 05",
    phone: "+251-911-100-004",
    joinDate: "2023-07-20",
    accountNumber: "MAMA-004-2023",
    status: "active",
    totalCollections: 87,
    monthlyEarnings: 4350,
    assignedArea: "Gerji"
  },
  {
    id: 5,
    fullName: "Birtukan Asefa Negash",
    woreda: "Gulele Woreda 04",
    phone: "+251-911-100-005",
    joinDate: "2023-08-10",
    accountNumber: "MAMA-005-2023",
    status: "inactive",
    totalCollections: 45,
    monthlyEarnings: 2250,
    assignedArea: "Entoto"
  }
];

export const storeInventoryData: StoreInventory[] = [
  {
    id: 1,
    type: "mixed",
    totalKg: 15420,
    currentMonth: {
      collected: 3250,
      sold: 2980,
      revenue: 14900
    },
    lastUpdated: "2024-01-28",
    price: 5
  },
  {
    id: 2,
    type: "carton",
    totalKg: 8960,
    currentMonth: {
      collected: 1890,
      sold: 1650,
      revenue: 11550
    },
    lastUpdated: "2024-01-28",
    price: 7
  },
  {
    id: 3,
    type: "newspaper",
    totalKg: 4320,
    currentMonth: {
      collected: 980,
      sold: 850,
      revenue: 25500
    },
    lastUpdated: "2024-01-28",
    price: 30
  },
  {
    id: 4,
    type: "sc",
    totalKg: 2150,
    currentMonth: {
      collected: 450,
      sold: 380,
      revenue: 1900
    },
    lastUpdated: "2024-01-28",
    price: 5
  },
  {
    id: 5,
    type: "sw",
    totalKg: 1890,
    currentMonth: {
      collected: 320,
      sold: 290,
      revenue: 1450
    },
    lastUpdated: "2024-01-28",
    price: 5
  }
];