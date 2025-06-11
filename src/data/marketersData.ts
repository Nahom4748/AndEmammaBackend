
import { Marketer } from "@/types";

export const marketersData: Marketer[] = [
  {
    id: 1,
    name: "Sefu Tekle",
    email: "sefu.tekle@company.com",
    phone: "+251-911-123-456",
    assignedSuppliers: [1, 2, 3, 8, 10, 11, 12, 13],
    totalCollections: 245,
    monthlyEarnings: 12250,
    status: "active",
    joinDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Abrar Mohammed",
    email: "abrar.mohammed@company.com",
    phone: "+251-911-234-567",
    assignedSuppliers: [4, 5, 6, 14, 15],
    totalCollections: 189,
    monthlyEarnings: 9450,
    status: "active",
    joinDate: "2024-02-20"
  },
  {
    id: 3,
    name: "Adisu Bekele",
    email: "adisu.bekele@company.com",
    phone: "+251-911-345-678",
    assignedSuppliers: [7, 9, 16, 17, 18],
    totalCollections: 167,
    monthlyEarnings: 8350,
    status: "active",
    joinDate: "2024-03-10"
  },
  {
    id: 4,
    name: "Aberar Haile",
    email: "aberar.haile@company.com",
    phone: "+251-911-456-789",
    assignedSuppliers: [19, 20],
    totalCollections: 98,
    monthlyEarnings: 4900,
    status: "inactive",
    joinDate: "2024-04-05"
  }
];
