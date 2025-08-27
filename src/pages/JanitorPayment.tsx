import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Calculator, Download, Filter, Calendar, User, Building, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

// Payment rates based on requirements
const PAYMENT_RATES = {
  regular: {
    'boxfile': 5.5,
    'Card': 5.5,
    'Carton': 7,
    'metal': 5.5,
    'MG': 5.5,
    'Mixed': 5.5,
    'Np': 30,
    'SC': 5.5,
    'SW': 7
  },
  instore: {
    'boxfile': 5.5,
    'Card': 5.5,
    'Carton': 5.5,
    'metal': 5.5,
    'MG': 5.5,
    'Mixed': 5.5,
    'Np': 5.5,
    'SC': 5.5,
    'SW': 5.5
  }
} as const;

interface CollectionItem {
  collection_type: string;
  paper_type_id: number;
  paper_type: string;
  total_kg: string;
  total_bag: string;
  janitor_name: string;
  janitor_account: string;
}

interface SupplierData {
  supplier_id: number;
  supplier_name: string;
  collections: CollectionItem[];
}

interface ProcessedCollection {
  supplierId: number;
  supplierName: string;
  collectionType: "regular" | "instore";
  paperType: string;
  paperTypeCode: string;
  weight: number;
  janitorName: string;
  janitorAccount: string;
  rate: number;
  amount: number;
}

interface PaperTypeSummary {
  paperType: string;
  paperTypeCode: string;
  weight: number;
  amount: number;
}

interface JanitorSummary {
  janitorName: string;
  janitorAccount: string;
  collectionType: string;
  paperTypes: PaperTypeSummary[];
  totalWeight: number;
  totalAmount: number;
}

interface SupplierSummary {
  supplierId: number;
  supplierName: string;
  janitors: JanitorSummary[];
  totalWeight: number;
  totalAmount: number;
}

// Paper types in the desired order
const PAPER_TYPES = ['boxfile', 'Card', 'Carton', 'metal', 'MG', 'Mixed', 'Np', 'SC', 'SW'];

export default function JanitorPayment() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(false);

  // Set default dates to current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
  }, []);

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fetch collection data from backend
  const fetchCollectionData = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing dates",
        description: "Please select both start and end dates",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/payment?startDate=${startDate}&endDate=${endDate}`
      );
      
      setSupplierData(response.data);
      toast({
        title: "Data loaded successfully",
        description: `Found ${response.data.length} suppliers with collections`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Error fetching collection data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Process and flatten all collections
  const processedCollections = useMemo(() => {
    const collections: ProcessedCollection[] = [];
    
    supplierData.forEach(supplier => {
      supplier.collections.forEach(collection => {
        // Map paper type to code (simplified mapping)
        let paperTypeCode = "Mixed";
        if (collection.paper_type.includes("White") || collection.paper_type === "SW") paperTypeCode = "SW";
        else if (collection.paper_type.includes("Colored") || collection.paper_type === "SC") paperTypeCode = "SC";
        else if (collection.paper_type.includes("Mixed")) paperTypeCode = "Mixed";
        else if (collection.paper_type.includes("Carton") || collection.paper_type === "Carton") paperTypeCode = "Carton";
        else if (collection.paper_type.includes("Newspaper") || collection.paper_type === "Np") paperTypeCode = "Np";
        else if (collection.paper_type.includes("Metal") || collection.paper_type === "metal") paperTypeCode = "metal";
        else if (collection.paper_type.includes("Card")) paperTypeCode = "Card";
        else if (collection.paper_type.includes("boxfile")) paperTypeCode = "boxfile";
        else if (collection.paper_type.includes("MG")) paperTypeCode = "MG";
        
        // Determine collection type
        const collectionType = collection.collection_type.toLowerCase().includes("instore") 
          ? "instore" as const 
          : "regular" as const;
        
        // Calculate rate based on collection type and paper type
        let rate = 0;
        if (collectionType === "instore") {
          rate = PAYMENT_RATES.instore[paperTypeCode as keyof typeof PAYMENT_RATES.instore] || 5.5;
        } else {
          rate = PAYMENT_RATES.regular[paperTypeCode as keyof typeof PAYMENT_RATES.regular] || 5.5;
        }
        
        const weight = parseFloat(collection.total_kg) || 0;
        const amount = weight * rate;
        
        collections.push({
          supplierId: supplier.supplier_id,
          supplierName: supplier.supplier_name,
          collectionType,
          paperType: collection.paper_type,
          paperTypeCode,
          weight,
          janitorName: collection.janitor_name,
          janitorAccount: collection.janitor_account,
          rate,
          amount
        });
      });
    });
    
    return collections;
  }, [supplierData]);

  // Create comprehensive summary by supplier and janitor
  const supplierSummary = useMemo(() => {
    const summary: SupplierSummary[] = [];
    const supplierMap = new Map<number, SupplierSummary>();
    
    processedCollections.forEach(collection => {
      // Initialize supplier if not exists
      if (!supplierMap.has(collection.supplierId)) {
        supplierMap.set(collection.supplierId, {
          supplierId: collection.supplierId,
          supplierName: collection.supplierName,
          janitors: [],
          totalWeight: 0,
          totalAmount: 0
        });
      }
      
      const supplier = supplierMap.get(collection.supplierId)!;
      
      // Find or create janitor
      let janitor = supplier.janitors.find(j => 
        j.janitorName === collection.janitorName && j.janitorAccount === collection.janitorAccount
      );
      
      if (!janitor) {
        janitor = {
          janitorName: collection.janitorName,
          janitorAccount: collection.janitorAccount,
          collectionType: collection.collectionType,
          paperTypes: [],
          totalWeight: 0,
          totalAmount: 0
        };
        supplier.janitors.push(janitor);
      }
      
      // Find or create paper type
      let paperType = janitor.paperTypes.find(p => p.paperTypeCode === collection.paperTypeCode);
      if (!paperType) {
        paperType = {
          paperType: collection.paperType,
          paperTypeCode: collection.paperTypeCode,
          weight: 0,
          amount: 0
        };
        janitor.paperTypes.push(paperType);
      }
      
      // Update values
      paperType.weight += collection.weight;
      paperType.amount += collection.amount;
      janitor.totalWeight += collection.weight;
      janitor.totalAmount += collection.amount;
      supplier.totalWeight += collection.weight;
      supplier.totalAmount += collection.amount;
    });
    
    // Convert map to array
    supplierMap.forEach(supplier => {
      summary.push(supplier);
    });
    
    return summary.sort((a, b) => a.supplierName.localeCompare(b.supplierName));
  }, [processedCollections]);

  const totalPayment = supplierSummary.reduce((sum, supplier) => sum + supplier.totalAmount, 0);
  const totalWeight = supplierSummary.reduce((sum, supplier) => sum + supplier.totalWeight, 0);

  const handleDownloadExcel = () => {
    // This would typically generate an Excel file
    console.log("Downloading Excel file for janitor payment...");
    toast({
      title: "Export initiated",
      description: "Preparing Excel download...",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-green-50 min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-green-700" />
        <h1 className="text-3xl font-bold text-green-800">Janitor Payment Calculator</h1>
      </div>

      {/* Date Range Selector */}
      <Card className="border-green-200 shadow-sm">
        <CardHeader className="bg-green-100 border-b border-green-200">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Calendar className="h-5 w-5" />
            Select Date Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-green-800">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-green-200 focus:ring-green-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-green-800">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-green-200 focus:ring-green-300"
              />
            </div>
            
            <div className="space-y-2 flex items-end">
              <Button 
                onClick={fetchCollectionData}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Fetch Collections"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Rates Reference */}
      <Card className="border-green-200 shadow-sm">
        <CardHeader className="bg-green-100 border-b border-green-200">
          <CardTitle className="text-green-800">Payment Rates (Birr per KG)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50 hover:bg-green-50">
                  <TableHead className="text-green-800 font-bold w-40">Collection Type</TableHead>
                  {PAPER_TYPES.map(type => (
                    <TableHead key={type} className="text-green-800 font-bold text-center min-w-16">{type}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium bg-green-50 text-green-800">Regular-Rate</TableCell>
                  {PAPER_TYPES.map(type => (
                    <TableCell key={type} className="text-center font-medium text-green-700">
                      {PAYMENT_RATES.regular[type as keyof typeof PAYMENT_RATES.regular]}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-green-50 text-green-800">Instore-Rate</TableCell>
                  {PAPER_TYPES.map(type => (
                    <TableCell key={type} className="text-center font-medium text-green-700">
                      {PAYMENT_RATES.instore[type as keyof typeof PAYMENT_RATES.instore]}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Summary Table */}
      {supplierSummary.length > 0 && (
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="bg-green-100 border-b border-green-200 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-green-800">Payment Summary</CardTitle>
              <p className="text-sm text-green-600">
                {startDate} to {endDate} • {supplierSummary.length} Suppliers • {processedCollections.length} Collections
              </p>
            </div>
            <Button onClick={handleDownloadExcel} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50 hover:bg-green-50">
                    <TableHead className="text-green-800 font-bold min-w-60">Supplier</TableHead>
                    <TableHead className="text-green-800 font-bold min-w-40">Type</TableHead>
                    <TableHead className="text-green-800 font-bold min-w-40">Janitor_name</TableHead>
                    <TableHead className="text-green-800 font-bold min-w-40">Janitor_account</TableHead>
                    {PAPER_TYPES.map(type => (
                      <TableHead key={type} className="text-green-800 font-bold text-center min-w-20">{type}</TableHead>
                    ))}
                    <TableHead className="text-green-800 font-bold text-center min-w-20">Total</TableHead>
                    <TableHead className="text-green-800 font-bold text-center min-w-20">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierSummary.map((supplier) => (
                    <>
                      {supplier.janitors.map((janitor, janitorIndex) => (
                        <TableRow 
                          key={`${supplier.supplierId}-${janitor.janitorName}-${janitor.janitorAccount}`}
                          className={janitorIndex === 0 ? "bg-green-50/30" : ""}
                        >
                          {janitorIndex === 0 && (
                            <TableCell 
                              rowSpan={supplier.janitors.length} 
                              className="font-medium text-green-800 align-top min-w-60"
                            >
                              {supplier.supplierName}
                            </TableCell>
                          )}
                          <TableCell className="font-medium">
                            <Badge variant={janitor.collectionType === "instore" ? "default" : "secondary"} className="bg-green-100 text-green-800 border-green-200">
                              {janitor.collectionType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{janitor.janitorName}</TableCell>
                          <TableCell className="text-sm text-green-600">{janitor.janitorAccount}</TableCell>
                          
                          {/* Paper type columns */}
                          {PAPER_TYPES.map(type => {
                            const paperType = janitor.paperTypes.find(p => p.paperTypeCode === type);
                            return (
                              <TableCell key={type} className="text-center">
                                {paperType && paperType.weight > 0 ? (
                                  <span className="font-medium">{paperType.weight.toFixed(2)}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                          
                          <TableCell className="text-center font-medium text-green-700">
                            {janitor.totalWeight.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center font-bold text-green-800">
                            {janitor.totalAmount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Supplier total row */}
                      <TableRow className="bg-green-100 font-bold">
                        <TableCell colSpan={4} className="text-right text-green-800">
                          {supplier.supplierName} Total:
                        </TableCell>
                        {PAPER_TYPES.map(type => {
                          const totalForType = supplier.janitors.reduce((sum, janitor) => {
                            const paperType = janitor.paperTypes.find(p => p.paperTypeCode === type);
                            return sum + (paperType?.weight || 0);
                          }, 0);
                          return (
                            <TableCell key={type} className="text-center text-green-800">
                              {totalForType > 0 ? totalForType.toFixed(2) : "-"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center text-green-800">
                          {supplier.totalWeight.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center text-green-800">
                          {supplier.totalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                  
                  {/* Grand total row */}
                  <TableRow className="bg-green-200 font-bold">
                    <TableCell colSpan={4} className="text-right text-green-800">
                      GRAND TOTAL:
                    </TableCell>
                    {PAPER_TYPES.map(type => {
                      const grandTotalForType = supplierSummary.reduce((sum, supplier) => {
                        return sum + supplier.janitors.reduce((janitorSum, janitor) => {
                          const paperType = janitor.paperTypes.find(p => p.paperTypeCode === type);
                          return janitorSum + (paperType?.weight || 0);
                        }, 0);
                      }, 0);
                      return (
                        <TableCell key={type} className="text-center text-green-800">
                          {grandTotalForType > 0 ? grandTotalForType.toFixed(2) : "-"}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center text-green-800">
                      {totalWeight.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center text-green-800">
                      {totalPayment.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {supplierData.length === 0 && !loading && (
        <Card className="border-green-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calculator className="h-12 w-12 text-green-300 mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">No Collection Data</h3>
            <p className="text-green-600 mb-4">
              Select a date range and click "Fetch Collections" to load data
            </p>
            <Button 
              onClick={fetchCollectionData}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Load Collection Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="border-green-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
            <p className="text-green-700">Loading collection data...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}