
export type Supplier = {
  id: number;
  name: string;
  type: string;
  status: "active" | "inactive";
  address: string;
  contactPerson: string;
  phone: string;
  email?: string;
  contact?: string;
  totalCollections: number;
  monthlyAverage: number;
  collectionType: "regular" | "instore" | "mixed";
  preferredCollectionTypes?: string[];
  needsShredder: boolean;
  janitor: {
    name: string;
    shift: "Morning" | "Afternoon" | "Evening";
    phone: string;
  };
  lastCollection: string;
  notes: string;
};

export const suppliersData: Supplier[] = [
  {
    id: 1,
    name: "Addis Ababa University",
    type: "Educational Institution",
    status: "active",
    address: "Algeria Street, Addis Ababa, Ethiopia - Building A, 3rd Floor, Room 301",
    contactPerson: "Dr. Alemayehu Tekle",
    contact: "Dr. Alemayehu Tekle",
    phone: "+251-911-123-456",
    email: "alemayehu.tekle@aau.edu.et",
    totalCollections: 145,
    monthlyAverage: 25,
    collectionType: "regular",
    preferredCollectionTypes: ["carton", "mixed", "np"],
    needsShredder: true,
    janitor: {
      name: "Mulugeta Haile",
      shift: "Morning",
      phone: "+251-911-111-111"
    },
    lastCollection: "2025-05-30",
    notes: "High volume supplier, requires weekly visits"
  },
  {
    id: 2,
    name: "FDRE Ministry of Justice",
    type: "Government Office",
    status: "active",
    address: "Meskel Square Area, Addis Ababa, Ethiopia - Justice Building, 2nd Floor",
    contactPerson: "Ato Girma Wolde",
    contact: "Ato Girma Wolde",
    phone: "+251-911-234-567",
    email: "girma.wolde@moj.gov.et",
    totalCollections: 128,
    monthlyAverage: 22,
    collectionType: "instore",
    preferredCollectionTypes: ["mixed", "sw"],
    needsShredder: true,
    janitor: {
      name: "Zenebech Tulu",
      shift: "Evening",
      phone: "+251-911-222-222"
    },
    lastCollection: "2025-05-29",
    notes: "Government facility, requires security clearance"
  },
  {
    id: 3,
    name: "Ethiopian Chamber of Commerce",
    type: "Commercial Organization",
    status: "active",
    address: "Mexico Square, Addis Ababa, Ethiopia - Chamber Building, Ground Floor",
    contactPerson: "W/ro Meron Tadesse",
    contact: "W/ro Meron Tadesse",
    phone: "+251-911-345-678",
    email: "meron.tadesse@ethchamber.com",
    totalCollections: 112,
    monthlyAverage: 19,
    collectionType: "regular",
    preferredCollectionTypes: ["carton", "np"],
    needsShredder: false,
    janitor: {
      name: "Bekele Mekonnen",
      shift: "Morning",
      phone: "+251-911-333-333"
    },
    lastCollection: "2025-05-31",
    notes: "Commercial papers, good quality"
  },
  {
    id: 4,
    name: "AACA Farms Commission",
    type: "Government Agency",
    status: "inactive",
    address: "Bole Road, Addis Ababa, Ethiopia - AACA Building, 1st Floor",
    contactPerson: "Ato Tesfaye Lemma",
    contact: "Ato Tesfaye Lemma",
    phone: "+251-911-456-789",
    email: "tesfaye.lemma@aaca.gov.et",
    totalCollections: 95,
    monthlyAverage: 16,
    collectionType: "mixed",
    preferredCollectionTypes: ["mixed", "carton"],
    needsShredder: true,
    janitor: {
      name: "Aster Tsegaye",
      shift: "Afternoon",
      phone: "+251-911-444-444"
    },
    lastCollection: "2025-05-28",
    notes: "Seasonal variations in paper waste"
  },
  {
    id: 5,
    name: "Kotebe University",
    type: "Educational Institution",
    status: "active",
    address: "Kotebe Area, Addis Ababa, Ethiopia - Main Campus, Library Building",
    contactPerson: "Dr. Hana Getachew",
    contact: "Dr. Hana Getachew",
    phone: "+251-911-567-890",
    email: "hana.getachew@ku.edu.et",
    totalCollections: 88,
    monthlyAverage: 15,
    collectionType: "regular",
    preferredCollectionTypes: ["np", "mixed"],
    needsShredder: false,
    janitor: {
      name: "Dereje Kebede",
      shift: "Morning",
      phone: "+251-911-555-555"
    },
    lastCollection: "2025-05-27",
    notes: "Student papers and documents"
  },
  {
    id: 6,
    name: "Bole Federal Supreme Court",
    type: "Government Office",
    status: "active",
    address: "Bole Area, Addis Ababa, Ethiopia - Court Building, Records Section",
    contactPerson: "W/ro Selamawit Abebe",
    contact: "W/ro Selamawit Abebe",
    phone: "+251-911-678-901",
    email: "selamawit.abebe@court.gov.et",
    totalCollections: 76,
    monthlyAverage: 13,
    collectionType: "instore",
    preferredCollectionTypes: ["sw", "mixed"],
    needsShredder: true,
    janitor: {
      name: "Tigist Lemma",
      shift: "Evening",
      phone: "+251-911-666-666"
    },
    lastCollection: "2025-05-26",
    notes: "Confidential documents, shredding required"
  },
  {
    id: 7,
    name: "Federal First Instance Court Kirkos",
    type: "Government Office",
    status: "inactive",
    address: "Kirkos Area, Addis Ababa, Ethiopia - Court Building, Archive Room",
    contactPerson: "Ato Befekadu Sileshi",
    contact: "Ato Befekadu Sileshi",
    phone: "+251-911-789-012",
    email: "befekadu.sileshi@court.gov.et",
    totalCollections: 68,
    monthlyAverage: 11,
    collectionType: "mixed",
    preferredCollectionTypes: ["mixed", "sw"],
    needsShredder: true,
    janitor: {
      name: "Elias Getahun",
      shift: "Morning",
      phone: "+251-911-777-777"
    },
    lastCollection: "2025-05-25",
    notes: "Legal documents, requires careful handling"
  },
  {
    id: 8,
    name: "Educational Equipment Importer",
    type: "Commercial Organization",
    status: "active",
    address: "Arada Area, Addis Ababa, Ethiopia - Warehouse, 2nd Floor",
    contactPerson: "Ato Yared Tesfaye",
    contact: "Ato Yared Tesfaye",
    phone: "+251-911-890-123",
    email: "yared.tesfaye@eduequip.com",
    totalCollections: 62,
    monthlyAverage: 10,
    collectionType: "regular",
    preferredCollectionTypes: ["carton", "mixed"],
    needsShredder: false,
    janitor: {
      name: "Senait Desta",
      shift: "Afternoon",
      phone: "+251-911-888-888"
    },
    lastCollection: "2025-05-24",
    notes: "Packaging materials, cardboard"
  },
  {
    id: 9,
    name: "Addis Ketema Industrial College",
    type: "Educational Institution",
    status: "active",
    address: "Addis Ketema, Addis Ababa, Ethiopia - College Campus, Admin Office",
    contactPerson: "W/ro Tsion Haile",
    contact: "W/ro Tsion Haile",
    phone: "+251-911-901-234",
    email: "tsion.haile@akic.edu.et",
    totalCollections: 58,
    monthlyAverage: 9,
    collectionType: "regular",
    preferredCollectionTypes: ["np", "mixed"],
    needsShredder: false,
    janitor: {
      name: "Fitsum Abebe",
      shift: "Morning",
      phone: "+251-911-999-999"
    },
    lastCollection: "2025-05-23",
    notes: "Technical documents and papers"
  },
  {
    id: 10,
    name: "Dashin Bank Meskel Flower",
    type: "Financial Institution",
    status: "active",
    address: "Meskel Flower Area, Addis Ababa, Ethiopia - Bank Branch, Records Room",
    contactPerson: "Ato Habtamu Baye",
    contact: "Ato Habtamu Baye",
    phone: "+251-912-012-345",
    email: "habtamu.baye@dashinbank.com",
    totalCollections: 54,
    monthlyAverage: 9,
    collectionType: "instore",
    preferredCollectionTypes: ["sw", "mixed"],
    needsShredder: true,
    janitor: {
      name: "Rahel Teshome",
      shift: "Evening",
      phone: "+251-912-000-000"
    },
    lastCollection: "2025-05-22",
    notes: "Financial records, shredding required"
  },
  {
    id: 11,
    name: "AA Tax Payers Merkato No 2",
    type: "Government Office",
    status: "active",
    address: "Merkato Area, Addis Ababa, Ethiopia - Tax Office, Filing Section",
    contactPerson: "W/ro Eyerusalem Tamiru",
    contact: "W/ro Eyerusalem Tamiru",
    phone: "+251-912-123-456",
    email: "eyerusalem.tamiru@tax.gov.et",
    totalCollections: 50,
    monthlyAverage: 8,
    collectionType: "mixed",
    preferredCollectionTypes: ["mixed", "sw"],
    needsShredder: true,
    janitor: {
      name: "Dawit Lemma",
      shift: "Morning",
      phone: "+251-912-111-111"
    },
    lastCollection: "2025-05-21",
    notes: "Tax documents, requires secure disposal"
  },
  {
    id: 12,
    name: "ICS Solutions",
    type: "Technology Company",
    status: "active",
    address: "Bole, Addis Ababa, Ethiopia - ICS Building, 4th Floor",
    contactPerson: "Ato Ermias Kebede",
    contact: "Ato Ermias Kebede",
    phone: "+251-912-234-567",
    email: "ermias.kebede@ics.com",
    totalCollections: 46,
    monthlyAverage: 8,
    collectionType: "regular",
    preferredCollectionTypes: ["np", "mixed"],
    needsShredder: false,
    janitor: {
      name: "Haimanot Tesfaye",
      shift: "Afternoon",
      phone: "+251-912-222-222"
    },
    lastCollection: "2025-05-20",
    notes: "Office papers and printouts"
  },
  {
    id: 13,
    name: "AA Investment Commission",
    type: "Government Agency",
    status: "inactive",
    address: "Bole, Addis Ababa, Ethiopia - Commission Building, Archive Room",
    contactPerson: "W/ro Senait Gebre",
    contact: "W/ro Senait Gebre",
    phone: "+251-912-345-678",
    email: "senait.gebre@invest.gov.et",
    totalCollections: 42,
    monthlyAverage: 7,
    collectionType: "mixed",
    preferredCollectionTypes: ["mixed", "sw"],
    needsShredder: true,
    janitor: {
      name: "Yonas Haile",
      shift: "Evening",
      phone: "+251-912-333-333"
    },
    lastCollection: "2025-05-19",
    notes: "Investment documents, requires secure disposal"
  },
  {
    id: 14,
    name: "Industry Park",
    type: "Industrial Zone",
    status: "active",
    address: "Kaliti, Addis Ababa, Ethiopia - Admin Building, 1st Floor",
    contactPerson: "Ato Fikru Desta",
    contact: "Ato Fikru Desta",
    phone: "+251-912-456-789",
    email: "fikru.desta@industrialpark.com",
    totalCollections: 38,
    monthlyAverage: 6,
    collectionType: "regular",
    preferredCollectionTypes: ["carton", "mixed"],
    needsShredder: false,
    janitor: {
      name: "Marta Tadesse",
      shift: "Morning",
      phone: "+251-912-444-444"
    },
    lastCollection: "2025-05-18",
    notes: "Various industrial papers"
  },
  {
    id: 15,
    name: "First Instance Court Addis Ketema",
    type: "Government Office",
    status: "active",
    address: "Addis Ketema, Addis Ababa, Ethiopia - Court Building, Records Section",
    contactPerson: "W/ro Tigist Kebede",
    contact: "W/ro Tigist Kebede",
    phone: "+251-912-567-890",
    email: "tigist.kebede@court.gov.et",
    totalCollections: 34,
    monthlyAverage: 6,
    collectionType: "instore",
    preferredCollectionTypes: ["sw", "mixed"],
    needsShredder: true,
    janitor: {
      name: "Tesfaye Lemma",
      shift: "Afternoon",
      phone: "+251-912-555-555"
    },
    lastCollection: "2025-05-17",
    notes: "Legal documents, shredding required"
  },
  {
    id: 16,
    name: "Ethiopian Meteorology Institute",
    type: "Research Institute",
    status: "active",
    address: "Gullele, Addis Ababa, Ethiopia - Institute Building, Archive Room",
    contactPerson: "Dr. Getachew Haile",
    contact: "Dr. Getachew Haile",
    phone: "+251-912-678-901",
    email: "getachew.haile@meteo.gov.et",
    totalCollections: 30,
    monthlyAverage: 5,
    collectionType: "mixed",
    preferredCollectionTypes: ["np", "mixed"],
    needsShredder: false,
    janitor: {
      name: "Aster Tsegaye",
      shift: "Evening",
      phone: "+251-912-666-666"
    },
    lastCollection: "2025-05-16",
    notes: "Scientific papers and data"
  },
  {
    id: 17,
    name: "Dashin Bank Africa Andinet",
    type: "Financial Institution",
    status: "active",
    address: "Africa Andinet, Addis Ababa, Ethiopia - Bank Branch, Records Room",
    contactPerson: "Ato Yared Tesfaye",
    contact: "Ato Yared Tesfaye",
    phone: "+251-912-789-012",
    email: "yared.tesfaye@dashinbank.com",
    totalCollections: 26,
    monthlyAverage: 4,
    collectionType: "instore",
    preferredCollectionTypes: ["sw", "mixed"],
    needsShredder: true,
    janitor: {
      name: "Senait Desta",
      shift: "Morning",
      phone: "+251-912-777-777"
    },
    lastCollection: "2025-05-15",
    notes: "Financial records, shredding required"
  },
  {
    id: 18,
    name: "AA Tax Payers Merkato No 3",
    type: "Government Office",
    status: "inactive",
    address: "Merkato Area, Addis Ababa, Ethiopia - Tax Office, Filing Section",
    contactPerson: "W/ro Tsion Haile",
    contact: "W/ro Tsion Haile",
    phone: "+251-912-890-123",
    email: "tsion.haile@tax.gov.et",
    totalCollections: 22,
    monthlyAverage: 4,
    collectionType: "mixed",
    preferredCollectionTypes: ["mixed", "sw"],
    needsShredder: true,
    janitor: {
      name: "Fitsum Abebe",
      shift: "Afternoon",
      phone: "+251-912-888-888"
    },
    lastCollection: "2025-05-14",
    notes: "Tax documents, requires secure disposal"
  },
  {
    id: 19,
    name: "Bishoftu Automotive Factory",
    type: "Manufacturing Plant",
    status: "active",
    address: "Bishoftu, Oromia, Ethiopia - Factory Premises, Admin Office",
    contactPerson: "Ato Befekadu Sileshi",
    contact: "Ato Befekadu Sileshi",
    phone: "+251-912-901-234",
    email: "befekadu.sileshi@automotive.com",
    totalCollections: 18,
    monthlyAverage: 3,
    collectionType: "regular",
    preferredCollectionTypes: ["carton", "mixed"],
    needsShredder: false,
    janitor: {
      name: "Rahel Teshome",
      shift: "Evening",
      phone: "+251-912-999-999"
    },
    lastCollection: "2025-05-13",
    notes: "Manufacturing papers and documents"
  },
  {
    id: 20,
    name: "Adama General Hospital",
    type: "Healthcare Facility",
    status: "active",
    address: "Adama, Oromia, Ethiopia - Hospital Premises, Records Room",
    contactPerson: "Dr. Eyerusalem Tamiru",
    contact: "Dr. Eyerusalem Tamiru",
    phone: "+251-913-012-345",
    email: "eyerusalem.tamiru@adamahospital.gov.et",
    totalCollections: 14,
    monthlyAverage: 2,
    collectionType: "instore",
    preferredCollectionTypes: ["sw", "mixed"],
    needsShredder: true,
    janitor: {
      name: "Dawit Lemma",
      shift: "Morning",
      phone: "+251-913-000-000"
    },
    lastCollection: "2025-05-12",
    notes: "Medical records, shredding required"
  }
];

