export interface Supplier {
  id: number;
  name: string;
  type: "Educational" | "Government" | "Private" | "Healthcare" | "Financial" | "Insurance" | "Legal";
  contact: string;
  phone: string;
  email: string;
  address: string;
  detailedAddress: {
    street: string;
    subcity: string;
    woreda: string;
    houseNumber: string;
    landmark?: string;
  };
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
  collectionSchedule: {
    frequency: "Daily" | "Weekly" | "Bi-weekly" | "Monthly";
    preferredDays: string[];
    preferredTime: string;
  };
  followUpRequired: boolean;
  shredderRequired: boolean;
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
    detailedAddress: {
      street: "4 Kilo Campus Main Road",
      subcity: "Kirkos",
      woreda: "07",
      houseNumber: "AAU-001",
      landmark: "Near Arat Kilo Monument"
    },
    status: "active",
    lastCollection: "2025-05-30",
    totalCollections: 45,
    janitor: { name: "Ato Bekele Mamo", phone: "+251-911-234-567", shift: "Morning" },
    preferredCollectionTypes: ["mixed", "carton", "sw"],
    collectionSchedule: {
      frequency: "Weekly",
      preferredDays: ["Monday", "Friday"],
      preferredTime: "8:00 AM - 10:00 AM"
    },
    followUpRequired: true,
    shredderRequired: true,
    notes: "Large volume expected during semester periods"
  },
  {
    id: 2,
    name: "FDRE Ministry of Justice",
    type: "Government",
    contact: "Ato Bekele Mamo",
    phone: "+251-11-234-5678",
    email: "info@moj.gov.et",
    address: "Main Office, Addis Ababa",
    detailedAddress: {
      street: "Justice Ministry Road",
      subcity: "Addis Ketema",
      woreda: "03",
      houseNumber: "MOJ-HQ",
      landmark: "Behind Piassa Commercial Area"
    },
    status: "active",
    lastCollection: "2025-05-28",
    totalCollections: 38,
    janitor: { name: "W/ro Hanan Ahmed", phone: "+251-911-345-678", shift: "Afternoon" },
    preferredCollectionTypes: ["carton", "mixed"],
    collectionSchedule: {
      frequency: "Weekly",
      preferredDays: ["Tuesday", "Thursday"],
      preferredTime: "2:00 PM - 4:00 PM"
    },
    followUpRequired: false,
    shredderRequired: true,
    notes: "Confidential documents require secure handling"
  },
  {
    id: 3,
    name: "Ethiopian Chamber of Commerce",
    type: "Private",
    contact: "W/ro Hanan Ahmed",
    phone: "+251-11-345-6789",
    email: "contact@ethiopianchamber.com",
    address: "Mexico Square, Addis Ababa",
    detailedAddress: {
      street: "Mexico Square Business District",
      subcity: "Kirkos",
      woreda: "08",
      houseNumber: "ECC-001",
      landmark: "Near Mexico Square Roundabout"
    },
    status: "active",
    lastCollection: "2025-05-29",
    totalCollections: 32,
    janitor: { name: "Ato Samuel Kifle", phone: "+251-911-456-789", shift: "Morning" },
    preferredCollectionTypes: ["carton", "mixed", "sc"],
    collectionSchedule: {
      frequency: "Weekly",
      preferredDays: ["Wednesday"],
      preferredTime: "9:00 AM - 11:00 AM"
    },
    followUpRequired: true,
    shredderRequired: false
  },
  {
    id: 4,
    name: "AACA Farms Commission",
    type: "Government",
    contact: "Ato Samuel Kifle",
    phone: "+251-11-456-7890",
    email: "farms@addisababa.gov.et",
    address: "Head Office, Addis Ababa",
    detailedAddress: {
      street: "Head Office Building",
      subcity: "Kirkos",
      woreda: "04",
      houseNumber: "AACA-001",
      landmark: "Near AACA Headquarters"
    },
    status: "active",
    lastCollection: "2025-05-15",
    totalCollections: 28,
    janitor: { name: "Ato Girma Tesfaye", phone: "+251-911-567-890", shift: "Morning" },
    preferredCollectionTypes: ["sc", "carton", "mixed"],
    collectionSchedule: {
      frequency: "Monthly",
      preferredDays: ["Saturday"],
      preferredTime: "10:00 AM - 12:00 PM"
    },
    followUpRequired: true,
    shredderRequired: true
  },
  {
    id: 5,
    name: "Kotebe Educational University",
    type: "Educational",
    contact: "Dr. Meron Zeleke",
    phone: "+251-11-567-8901",
    email: "admin@keu.edu.et",
    address: "Kotebe Campus, Addis Ababa",
    detailedAddress: {
      street: "Kotebe Campus Road",
      subcity: "Kirkos",
      woreda: "05",
      houseNumber: "KEU-001",
      landmark: "Near Kotebe University Gate"
    },
    status: "active",
    lastCollection: "2025-05-27",
    totalCollections: 25,
    janitor: { name: "Ato Desta Worku", phone: "+251-911-678-901", shift: "Afternoon" },
    preferredCollectionTypes: ["sw", "mixed", "carton"],
    collectionSchedule: {
      frequency: "Bi-weekly",
      preferredDays: ["Friday", "Sunday"],
      preferredTime: "1:00 PM - 3:00 PM"
    },
    followUpRequired: false,
    shredderRequired: false
  },
  {
    id: 6,
    name: "Bole Federal Supreme Court",
    type: "Legal",
    contact: "Judge Almaz Gebru",
    phone: "+251-11-678-9012",
    email: "info@supremecourt.gov.et",
    address: "Bole, Addis Ababa",
    detailedAddress: {
      street: "Bole Court Road",
      subcity: "Bole",
      woreda: "06",
      houseNumber: "SC-001",
      landmark: "Near Supreme Court Building"
    },
    status: "active",
    lastCollection: "2025-05-02",
    totalCollections: 22,
    janitor: { name: "Ato Tadesse Alemu", phone: "+251-911-789-012", shift: "Morning" },
    preferredCollectionTypes: ["carton", "mixed", "sw", "sc"],
    collectionSchedule: {
      frequency: "Daily",
      preferredDays: ["Monday", "Wednesday", "Friday"],
      preferredTime: "11:00 AM - 1:00 PM"
    },
    followUpRequired: true,
    shredderRequired: true
  },
  {
    id: 7,
    name: "Federal First Instance Court Kirkos",
    type: "Legal",
    contact: "Judge Tekle Hailu",
    phone: "+251-11-789-0123",
    email: "kirkos@federalcourt.gov.et",
    address: "Kirkos Subcity, Addis Ababa",
    detailedAddress: {
      street: "Kirkos Subcity Road",
      subcity: "Kirkos",
      woreda: "07",
      houseNumber: "FC-001",
      landmark: "Near Kirkos Subcity Office"
    },
    status: "active",
    lastCollection: "2025-05-02",
    totalCollections: 19,
    janitor: { name: "W/ro Almaz Bekele", phone: "+251-911-890-123", shift: "Afternoon" },
    preferredCollectionTypes: ["sw", "carton", "sc", "mixed"],
    collectionSchedule: {
      frequency: "Bi-weekly",
      preferredDays: ["Tuesday", "Thursday", "Saturday"],
      preferredTime: "3:00 PM - 5:00 PM"
    },
    followUpRequired: false,
    shredderRequired: true
  },
  {
    id: 8,
    name: "Federal House Corporation Head Office",
    type: "Government",
    contact: "Ato Mehari Teshome",
    phone: "+251-11-890-1234",
    email: "info@federalhouse.gov.et",
    address: "Head Office, Addis Ababa",
    detailedAddress: {
      street: "Federal House Head Office Road",
      subcity: "Kirkos",
      woreda: "08",
      houseNumber: "FH-001",
      landmark: "Near Federal House Building"
    },
    status: "active",
    lastCollection: "2025-05-03",
    totalCollections: 16,
    janitor: { name: "Ato Yonas Mulatu", phone: "+251-911-901-234", shift: "Morning" },
    preferredCollectionTypes: ["carton", "sc"],
    collectionSchedule: {
      frequency: "Monthly",
      preferredDays: ["Sunday"],
      preferredTime: "12:00 PM - 2:00 PM"
    },
    followUpRequired: true,
    shredderRequired: false
  },
  {
    id: 9,
    name: "Addis Ketema Industrial College",
    type: "Educational",
    contact: "Dr. Fasil Demissie",
    phone: "+251-11-901-2345",
    email: "info@akic.edu.et",
    address: "Addis Ketema, Addis Ababa",
    detailedAddress: {
      street: "Addis Ketema Campus Road",
      subcity: "Kirkos",
      woreda: "09",
      houseNumber: "AKIC-001",
      landmark: "Near AKIC Campus Gate"
    },
    status: "active",
    lastCollection: "2025-05-06",
    totalCollections: 14,
    janitor: { name: "Ato Kidane Wolde", phone: "+251-911-012-345", shift: "Evening" },
    preferredCollectionTypes: ["np", "carton", "mixed", "sw"],
    collectionSchedule: {
      frequency: "Weekly",
      preferredDays: ["Saturday"],
      preferredTime: "5:00 PM - 7:00 PM"
    },
    followUpRequired: false,
    shredderRequired: true
  },
  {
    id: 10,
    name: "ICS (Information Communication Solutions)",
    type: "Private",
    contact: "Ato Tesfaye Negash",
    phone: "+251-11-012-3456",
    email: "contact@ics.com.et",
    address: "Bole, Addis Ababa",
    detailedAddress: {
      street: "Bole Business District",
      subcity: "Bole",
      woreda: "10",
      houseNumber: "ICS-001",
      landmark: "Near ICS Office"
    },
    status: "active",
    lastCollection: "2025-05-07",
    totalCollections: 12,
    janitor: { name: "W/ro Selamawit Tadesse", phone: "+251-911-123-456", shift: "Morning" },
    preferredCollectionTypes: ["sw", "carton"],
    collectionSchedule: {
      frequency: "Bi-weekly",
      preferredDays: ["Monday", "Wednesday"],
      preferredTime: "10:00 AM - 12:00 PM"
    },
    followUpRequired: true,
    shredderRequired: false
  },
  {
    id: 11,
    name: "FDRE Ministry of Justice Arada Branch",
    type: "Government",
    contact: "Ato Dawit Haile",
    phone: "+251-11-123-4567",
    email: "arada@moj.gov.et",
    address: "Arada Subcity, Addis Ababa",
    detailedAddress: {
      street: "Arada Subcity Road",
      subcity: "Arada",
      woreda: "11",
      houseNumber: "MOJ-ARADA",
      landmark: "Near Arada Subcity Office"
    },
    status: "active",
    lastCollection: "2025-05-07",
    totalCollections: 11,
    janitor: { name: "Ato Mulugeta Eshetu", phone: "+251-911-234-567", shift: "Afternoon" },
    preferredCollectionTypes: ["carton", "mixed"],
    collectionSchedule: {
      frequency: "Weekly",
      preferredDays: ["Friday"],
      preferredTime: "3:00 PM - 5:00 PM"
    },
    followUpRequired: true,
    shredderRequired: true
  },
  {
    id: 12,
    name: "AA Small Tax Payers Merkato No 2",
    type: "Government",
    contact: "W/ro Tigist Abebe",
    phone: "+251-11-234-5678",
    email: "merkato2@aarevenue.gov.et",
    address: "Merkato, Addis Ababa",
    detailedAddress: {
      street: "Merkato Road",
      subcity: "Kirkos",
      woreda: "12",
      houseNumber: "MT-001",
      landmark: "Near Merkato Market"
    },
    status: "active",
    lastCollection: "2025-05-08",
    totalCollections: 9,
    janitor: { name: "Ato Getachew Bekele", phone: "+251-911-345-678", shift: "Morning" },
    preferredCollectionTypes: ["carton"],
    collectionSchedule: {
      frequency: "Daily",
      preferredDays: ["Tuesday"],
      preferredTime: "9:00 AM - 11:00 AM"
    },
    followUpRequired: false,
    shredderRequired: false
  },
  {
    id: 13,
    name: "AA Small Tax Payers Merkato No 3",
    type: "Government",
    contact: "Ato Solomon Mekonnen",
    phone: "+251-11-345-6789",
    email: "merkato3@aarevenue.gov.et",
    address: "Merkato, Addis Ababa",
    detailedAddress: {
      street: "Merkato Road",
      subcity: "Kirkos",
      woreda: "13",
      houseNumber: "MT-002",
      landmark: "Near Merkato Market"
    },
    status: "active",
    lastCollection: "2025-05-08",
    totalCollections: 8,
    janitor: { name: "W/ro Rahel Teshome", phone: "+251-911-456-789", shift: "Afternoon" },
    preferredCollectionTypes: ["mixed"],
    collectionSchedule: {
      frequency: "Bi-weekly",
      preferredDays: ["Wednesday"],
      preferredTime: "1:00 PM - 3:00 PM"
    },
    followUpRequired: true,
    shredderRequired: false
  },
  {
    id: 14,
    name: "Educational Equipment",
    type: "Private",
    contact: "Ato Bereket Wolde",
    phone: "+251-11-456-7890",
    email: "info@eduequip.com.et",
    address: "Bole, Addis Ababa",
    detailedAddress: {
      street: "Bole Business District",
      subcity: "Bole",
      woreda: "14",
      houseNumber: "EDU-001",
      landmark: "Near Educational Equipment Office"
    },
    status: "active",
    lastCollection: "2025-05-08",
    totalCollections: 7,
    janitor: { name: "Ato Tesfaye Girma", phone: "+251-911-567-890", shift: "Morning" },
    preferredCollectionTypes: ["sw", "mixed"],
    collectionSchedule: {
      frequency: "Weekly",
      preferredDays: ["Thursday"],
      preferredTime: "10:00 AM - 12:00 PM"
    },
    followUpRequired: true,
    shredderRequired: true
  },
  {
    id: 15,
    name: "Ethiopian Meteorology Institute",
    type: "Government",
    contact: "Dr. Worku Legesse",
    phone: "+251-11-567-8901",
    email: "info@ethiomet.gov.et",
    address: "Observatory Area, Addis Ababa",
    detailedAddress: {
      street: "Observatory Road",
      subcity: "Kirkos",
      woreda: "15",
      houseNumber: "EMI-001",
      landmark: "Near Observatory Building"
    },
    status: "active",
    lastCollection: "2025-05-08",
    totalCollections: 15,
    janitor: { name: "Ato Assefa Mengistu", phone: "+251-911-678-901", shift: "Evening" },
    preferredCollectionTypes: ["sw", "carton", "mixed"],
    collectionSchedule: {
      frequency: "Bi-weekly",
      preferredDays: ["Friday"],
      preferredTime: "2:00 PM - 4:00 PM"
    },
    followUpRequired: false,
    shredderRequired: true
  },
  {
    id: 16,
    name: "Dashin Bank Mesikel Flower Branch",
    type: "Financial",
    contact: "Ato Yemane Berhe",
    phone: "+251-11-678-9012",
    email: "mesikel@dashinbank.com",
    address: "Mesikel Flower, Addis Ababa",
    detailedAddress: {
      street: "Mesikel Flower Road",
      subcity: "Kirkos",
      woreda: "16",
      houseNumber: "DB-001",
      landmark: "Near Dashin Bank Flower Branch"
    },
    status: "active",
    lastCollection: "2025-05-09",
    totalCollections: 6,
    janitor: { name: "W/ro Birtukan Alemayehu", phone: "+251-911-789-012", shift: "Morning" },
    preferredCollectionTypes: ["mixed"],
    collectionSchedule: {
      frequency: "Daily",
      preferredDays: ["Monday"],
      preferredTime: "8:00 AM - 10:00 AM"
    },
    followUpRequired: true,
    shredderRequired: true
  },
  {
    id: 17,
    name: "Dashin Bank Africa Andinet Branch",
    type: "Financial",
    contact: "W/ro Hirut Tadesse",
    phone: "+251-11-789-0123",
    email: "andinet@dashinbank.com",
    address: "Africa Avenue, Addis Ababa",
    detailedAddress: {
      street: "Africa Avenue Road",
      subcity: "Kirkos",
      woreda: "17",
      houseNumber: "DB-002",
      landmark: "Near Dashin Bank Africa Andinet Branch"
    },
    status: "active",
    lastCollection: "2025-05-09",
    totalCollections: 10,
    janitor: { name: "Ato Daniel Tekle", phone: "+251-911-890-123", shift: "Afternoon" },
    preferredCollectionTypes: ["sw", "carton", "mixed"],
    collectionSchedule: {
      frequency: "Weekly",
      preferredDays: ["Tuesday", "Thursday"],
      preferredTime: "1:00 PM - 3:00 PM"
    },
    followUpRequired: false,
    shredderRequired: true
  },
  {
    id: 18,
    name: "AA Investment Commission",
    type: "Government",
    contact: "Ato Fisseha Mekuria",
    phone: "+251-11-890-1234",
    email: "info@aainvestment.gov.et",
    address: "Investment Area, Addis Ababa",
    detailedAddress: {
      street: "Investment Area Road",
      subcity: "Kirkos",
      woreda: "18",
      houseNumber: "AI-001",
      landmark: "Near AA Investment Commission Office"
    },
    status: "active",
    lastCollection: "2025-05-09",
    totalCollections: 5,
    janitor: { name: "Ato Hailu Wolde", phone: "+251-911-901-234", shift: "Morning" },
    preferredCollectionTypes: ["mixed"],
    collectionSchedule: {
      frequency: "Bi-weekly",
      preferredDays: ["Wednesday"],
      preferredTime: "9:00 AM - 11:00 AM"
    },
    followUpRequired: true,
    shredderRequired: false
  },
  {
    id: 19,
    name: "Industry Park",
    type: "Government",
    contact: "Eng. Meseret Haile",
    phone: "+251-11-901-2345",
    email: "info@industrypark.gov.et",
    address: "Industrial Area, Addis Ababa",
    detailedAddress: {
      street: "Industrial Area Road",
      subcity: "Kirkos",
      woreda: "19",
      houseNumber: "IP-001",
      landmark: "Near Industry Park Office"
    },
    status: "active",
    lastCollection: "2025-05-12",
    totalCollections: 8,
    janitor: { name: "Ato Berhanu Tesfaye", phone: "+251-911-012-345", shift: "Evening" },
    preferredCollectionTypes: ["sw", "mixed"],
    collectionSchedule: {
      frequency: "Monthly",
      preferredDays: ["Saturday"],
      preferredTime: "10:00 AM - 12:00 PM"
    },
    followUpRequired: false,
    shredderRequired: true
  },
  {
    id: 20,
    name: "First Instance Court Addis Ketema",
    type: "Legal",
    contact: "Judge Genet Worku",
    phone: "+251-11-012-3456",
    email: "addisketema@federalcourt.gov.et",
    address: "Addis Ketema, Addis Ababa",
    detailedAddress: {
      street: "Addis Ketema Court Road",
      subcity: "Kirkos",
      woreda: "20",
      houseNumber: "FC-002",
      landmark: "Near First Instance Court Addis Ketema"
    },
    status: "active",
    lastCollection: "2025-05-12",
    totalCollections: 4,
    janitor: { name: "W/ro Marta Bekele", phone: "+251-911-123-456", shift: "Morning" },
    preferredCollectionTypes: ["sw", "sc"],
    collectionSchedule: {
      frequency: "Bi-weekly",
      preferredDays: ["Friday"],
      preferredTime: "1:00 PM - 3:00 PM"
    },
    followUpRequired: true,
    shredderRequired: false
  }
  // Continue with more suppliers... (truncated for brevity but would include all ~200)
];
