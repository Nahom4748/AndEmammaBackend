
export interface Supplier {
  id: number;
  name: string;
  type: "Educational" | "Government" | "Private" | "Healthcare" | "Financial" | "Insurance" | "Legal";
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: "active" | "inactive";
  lastCollection: string;
  totalCollections: number;
  janitor: {
    name: string;
    phone: string;
    shift: "Morning" | "Afternoon" | "Evening";
  };
  preferredCollectionTypes: string[];
  notes?: string;
}

export const suppliersData: Supplier[] = [
  {
    id: 1,
    name: "Addis Ababa University",
    type: "Educational",
    contact: "Dr. Alemayehu Tadese",
    phone: "+251-11-123-4567",
    email: "contact@aau.edu.et",
    address: "4 Kilo Campus, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-30",
    totalCollections: 45,
    janitor: { name: "Ato Bekele Mamo", phone: "+251-911-234-567", shift: "Morning" },
    preferredCollectionTypes: ["mixed", "carton", "sw"]
  },
  {
    id: 2,
    name: "FDRE Ministry of Justice",
    type: "Government",
    contact: "Ato Bekele Mamo",
    phone: "+251-11-234-5678",
    email: "info@moj.gov.et",
    address: "Main Office, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-28",
    totalCollections: 38,
    janitor: { name: "W/ro Hanan Ahmed", phone: "+251-911-345-678", shift: "Afternoon" },
    preferredCollectionTypes: ["carton", "mixed"]
  },
  {
    id: 3,
    name: "Ethiopian Chamber of Commerce",
    type: "Private",
    contact: "W/ro Hanan Ahmed",
    phone: "+251-11-345-6789",
    email: "contact@ethiopianchamber.com",
    address: "Mexico Square, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-29",
    totalCollections: 32,
    janitor: { name: "Ato Samuel Kifle", phone: "+251-911-456-789", shift: "Morning" },
    preferredCollectionTypes: ["carton", "mixed", "sc"]
  },
  {
    id: 4,
    name: "AACA Farms Commission",
    type: "Government",
    contact: "Ato Samuel Kifle",
    phone: "+251-11-456-7890",
    email: "farms@addisababa.gov.et",
    address: "Head Office, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-15",
    totalCollections: 28,
    janitor: { name: "Ato Girma Tesfaye", phone: "+251-911-567-890", shift: "Morning" },
    preferredCollectionTypes: ["sc", "carton", "mixed"]
  },
  {
    id: 5,
    name: "Kotebe Educational University",
    type: "Educational",
    contact: "Dr. Meron Zeleke",
    phone: "+251-11-567-8901",
    email: "admin@keu.edu.et",
    address: "Kotebe Campus, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-27",
    totalCollections: 25,
    janitor: { name: "Ato Desta Worku", phone: "+251-911-678-901", shift: "Afternoon" },
    preferredCollectionTypes: ["sw", "mixed", "carton"]
  },
  {
    id: 6,
    name: "Bole Federal Supreme Court",
    type: "Legal",
    contact: "Judge Almaz Gebru",
    phone: "+251-11-678-9012",
    email: "info@supremecourt.gov.et",
    address: "Bole, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-02",
    totalCollections: 22,
    janitor: { name: "Ato Tadesse Alemu", phone: "+251-911-789-012", shift: "Morning" },
    preferredCollectionTypes: ["carton", "mixed", "sw", "sc"]
  },
  {
    id: 7,
    name: "Federal First Instance Court Kirkos",
    type: "Legal",
    contact: "Judge Tekle Hailu",
    phone: "+251-11-789-0123",
    email: "kirkos@federalcourt.gov.et",
    address: "Kirkos Subcity, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-02",
    totalCollections: 19,
    janitor: { name: "W/ro Almaz Bekele", phone: "+251-911-890-123", shift: "Afternoon" },
    preferredCollectionTypes: ["sw", "carton", "sc", "mixed"]
  },
  {
    id: 8,
    name: "Federal House Corporation Head Office",
    type: "Government",
    contact: "Ato Mehari Teshome",
    phone: "+251-11-890-1234",
    email: "info@federalhouse.gov.et",
    address: "Head Office, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-03",
    totalCollections: 16,
    janitor: { name: "Ato Yonas Mulatu", phone: "+251-911-901-234", shift: "Morning" },
    preferredCollectionTypes: ["carton", "sc"]
  },
  {
    id: 9,
    name: "Addis Ketema Industrial College",
    type: "Educational",
    contact: "Dr. Fasil Demissie",
    phone: "+251-11-901-2345",
    email: "info@akic.edu.et",
    address: "Addis Ketema, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-06",
    totalCollections: 14,
    janitor: { name: "Ato Kidane Wolde", phone: "+251-911-012-345", shift: "Evening" },
    preferredCollectionTypes: ["np", "carton", "mixed", "sw"]
  },
  {
    id: 10,
    name: "ICS (Information Communication Solutions)",
    type: "Private",
    contact: "Ato Tesfaye Negash",
    phone: "+251-11-012-3456",
    email: "contact@ics.com.et",
    address: "Bole, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-07",
    totalCollections: 12,
    janitor: { name: "W/ro Selamawit Tadesse", phone: "+251-911-123-456", shift: "Morning" },
    preferredCollectionTypes: ["sw", "carton"]
  },
  {
    id: 11,
    name: "FDRE Ministry of Justice Arada Branch",
    type: "Government",
    contact: "Ato Dawit Haile",
    phone: "+251-11-123-4567",
    email: "arada@moj.gov.et",
    address: "Arada Subcity, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-07",
    totalCollections: 11,
    janitor: { name: "Ato Mulugeta Eshetu", phone: "+251-911-234-567", shift: "Afternoon" },
    preferredCollectionTypes: ["carton", "mixed"]
  },
  {
    id: 12,
    name: "AA Small Tax Payers Merkato No 2",
    type: "Government",
    contact: "W/ro Tigist Abebe",
    phone: "+251-11-234-5678",
    email: "merkato2@aarevenue.gov.et",
    address: "Merkato, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-08",
    totalCollections: 9,
    janitor: { name: "Ato Getachew Bekele", phone: "+251-911-345-678", shift: "Morning" },
    preferredCollectionTypes: ["carton"]
  },
  {
    id: 13,
    name: "AA Small Tax Payers Merkato No 3",
    type: "Government",
    contact: "Ato Solomon Mekonnen",
    phone: "+251-11-345-6789",
    email: "merkato3@aarevenue.gov.et",
    address: "Merkato, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-08",
    totalCollections: 8,
    janitor: { name: "W/ro Rahel Teshome", phone: "+251-911-456-789", shift: "Afternoon" },
    preferredCollectionTypes: ["mixed"]
  },
  {
    id: 14,
    name: "Educational Equipment",
    type: "Private",
    contact: "Ato Bereket Wolde",
    phone: "+251-11-456-7890",
    email: "info@eduequip.com.et",
    address: "Bole, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-08",
    totalCollections: 7,
    janitor: { name: "Ato Tesfaye Girma", phone: "+251-911-567-890", shift: "Morning" },
    preferredCollectionTypes: ["sw", "mixed"]
  },
  {
    id: 15,
    name: "Ethiopian Meteorology Institute",
    type: "Government",
    contact: "Dr. Worku Legesse",
    phone: "+251-11-567-8901",
    email: "info@ethiomet.gov.et",
    address: "Observatory Area, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-08",
    totalCollections: 15,
    janitor: { name: "Ato Assefa Mengistu", phone: "+251-911-678-901", shift: "Evening" },
    preferredCollectionTypes: ["sw", "carton", "mixed"]
  },
  {
    id: 16,
    name: "Dashin Bank Mesikel Flower Branch",
    type: "Financial",
    contact: "Ato Yemane Berhe",
    phone: "+251-11-678-9012",
    email: "mesikel@dashinbank.com",
    address: "Mesikel Flower, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-09",
    totalCollections: 6,
    janitor: { name: "W/ro Birtukan Alemayehu", phone: "+251-911-789-012", shift: "Morning" },
    preferredCollectionTypes: ["mixed"]
  },
  {
    id: 17,
    name: "Dashin Bank Africa Andinet Branch",
    type: "Financial",
    contact: "W/ro Hirut Tadesse",
    phone: "+251-11-789-0123",
    email: "andinet@dashinbank.com",
    address: "Africa Avenue, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-09",
    totalCollections: 10,
    janitor: { name: "Ato Daniel Tekle", phone: "+251-911-890-123", shift: "Afternoon" },
    preferredCollectionTypes: ["sw", "carton", "mixed"]
  },
  {
    id: 18,
    name: "AA Investment Commission",
    type: "Government",
    contact: "Ato Fisseha Mekuria",
    phone: "+251-11-890-1234",
    email: "info@aainvestment.gov.et",
    address: "Investment Area, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-09",
    totalCollections: 5,
    janitor: { name: "Ato Hailu Wolde", phone: "+251-911-901-234", shift: "Morning" },
    preferredCollectionTypes: ["mixed"]
  },
  {
    id: 19,
    name: "Industry Park",
    type: "Government",
    contact: "Eng. Meseret Haile",
    phone: "+251-11-901-2345",
    email: "info@industrypark.gov.et",
    address: "Industrial Area, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-12",
    totalCollections: 8,
    janitor: { name: "Ato Berhanu Tesfaye", phone: "+251-911-012-345", shift: "Evening" },
    preferredCollectionTypes: ["sw", "mixed"]
  },
  {
    id: 20,
    name: "First Instance Court Addis Ketema",
    type: "Legal",
    contact: "Judge Genet Worku",
    phone: "+251-11-012-3456",
    email: "addisketema@federalcourt.gov.et",
    address: "Addis Ketema, Addis Ababa",
    status: "active",
    lastCollection: "2025-05-12",
    totalCollections: 4,
    janitor: { name: "W/ro Marta Bekele", phone: "+251-911-123-456", shift: "Morning" },
    preferredCollectionTypes: ["sw", "sc"]
  }
  // Continue with more suppliers... (truncated for brevity but would include all ~200)
];
