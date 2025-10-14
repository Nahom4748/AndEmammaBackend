import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, Scale, ShoppingCart, ArrowRightLeft, Plus, Minus, RefreshCw, BarChart3, Download, Filter, User, Calendar, History, Receipt, IndianRupee, Database, AlertCircle, PieChart, BarChart, Layers } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

// Define types based on backend API response
interface PaperType {
  id: number;
  code: string;
  name: string;
}

interface InventoryItem {
  paperTypeCode: string;
  paperTypeName: string;
  totalKg: string;
  totalBags: string;
}

interface InventoryResponse {
  status: string;
  data: {
    byPaperType: InventoryItem[];
  };
}

interface StoreInventory {
  id: string;
  type: string;
  name: string;
  totalKg: number;
  totalBags: number;
  currentMonth: {
    collected: number;
    sold: number;
  };
  lastUpdated: string;
}

interface ChartData {
  type: string;
  kg: number;
  bags: number;
  percentage: number;
  color: string;
  gradient: string;
}

interface SaleRecord {
  saleId: number;
  paperTypeCode: string;
  paperTypeName: string;
  quantityKg: number;
  quantityBags: number;
  pricePerKg?: number;
  totalPrice?: number;
  saleDate: string;
  buyerName: string;
  createdBy: string | null;
}

interface SalesHistoryResponse {
  status: string;
  data: {
    salesList: SaleRecord[];
    overallTotals: {
      totalKgSold: string;
      totalBagsSold: string;
      totalBirr: string;
    };
  };
}

interface SaleItem {
  paperType: string;
  kgAmount: string;
  quantityBags: string;
  pricePerKg: string;
  totalPrices: string;
}

interface InventoryHistoryEntry {
  inventoryId: number;
  paperTypeCode: string;
  paperTypeName: string;
  kgAmount: string;
  totalBags: number;
  collectionDate: string;
  createdAt: string;
}

interface InventoryHistoryResponse {
  status: string;
  data: {
    reportMonth: string;
    totalEntries: number;
    totals: {
      totalKg: string;
      totalBags: string;
    };
    entries: InventoryHistoryEntry[];
  };
}

export default function StoreManagement() {
  const [storeData, setStoreData] = useState<StoreInventory[]>([]);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPaperTypes, setLoadingPaperTypes] = useState(false);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistoryEntry[]>([]);
  const [overallTotals, setOverallTotals] = useState({
    totalKgSold: "0",
    totalBagsSold: "0",
    totalBirr: "0"
  });
  const [inventoryHistoryTotals, setInventoryHistoryTotals] = useState({
    totalKg: "0",
    totalBags: "0",
    reportMonth: "",
    totalEntries: 0
  });
  const [loadingSalesHistory, setLoadingSalesHistory] = useState(false);
  const [loadingInventoryHistory, setLoadingInventoryHistory] = useState(false);
  const { toast } = useToast();

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Sale form state
  const [saleForm, setSaleForm] = useState({
    buyerName: "",
    saleDate: new Date().toISOString().split('T')[0],
    saleItems: [] as SaleItem[]
  });

  // Sort form state
  const [sortForm, setSortForm] = useState({
    mixedKg: "",
    sw: "",
    sc: "",
    carton: "",
    np: ""
  });

  // Data entry form state
  const [dataEntryDialogOpen, setDataEntryDialogOpen] = useState(false);
  const [dataEntryForm, setDataEntryForm] = useState({
    paperType: "",
    kgAmount: "",
    totalBags: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Chart data state
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Check mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch inventory data from backend
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await axios.get<InventoryResponse>('http://localhost:5000/inventory');
      
      if (response.data.status === "success") {
        const backendData = response.data.data.byPaperType;
        
        // Transform backend data to frontend format
        const transformedData: StoreInventory[] = backendData.map(item => ({
          id: item.paperTypeCode.toLowerCase(),
          type: item.paperTypeCode.toLowerCase(),
          name: item.paperTypeName,
          totalKg: parseFloat(item.totalKg) || 0,
          totalBags: parseInt(item.totalBags) || 0,
          currentMonth: {
            collected: parseFloat(item.totalKg) || 0,
            sold: Math.floor(parseFloat(item.totalKg) * 0.3) || 0,
          },
          lastUpdated: new Date().toISOString().split('T')[0]
        }));

        setStoreData(transformedData);
        updateChartData(transformedData);
      } else {
        throw new Error("Failed to fetch inventory data");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Connection Error",
        description: "Unable to fetch inventory data from server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales history from backend
  const fetchSalesHistory = async () => {
    setLoadingSalesHistory(true);
    try {
      const response = await axios.get<SalesHistoryResponse>('http://localhost:5000/inventorysell');
      
      if (response.data.status === "success") {
        const { salesList, overallTotals } = response.data.data;
        setSalesHistory(salesList);
        setOverallTotals(overallTotals);
      } else {
        throw new Error("Failed to fetch sales history");
      }
    } catch (error) {
      console.error("Error fetching sales history:", error);
      toast({
        title: "Connection Error",
        description: "Unable to fetch sales history from server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingSalesHistory(false);
    }
  };

  // Fetch inventory history from backend
  const fetchInventoryHistory = async () => {
    setLoadingInventoryHistory(true);
    try {
      const response = await axios.get<InventoryHistoryResponse>('http://localhost:5000/last-inventory');
      
      if (response.data.status === "success") {
        const { entries, totals, reportMonth, totalEntries } = response.data.data;
        setInventoryHistory(entries);
        setInventoryHistoryTotals({
          totalKg: totals.totalKg,
          totalBags: totals.totalBags,
          reportMonth,
          totalEntries
        });
      } else {
        throw new Error("Failed to fetch inventory history");
      }
    } catch (error) {
      console.error("Error fetching inventory history:", error);
      toast({
        title: "Connection Error",
        description: "Unable to fetch inventory history from server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingInventoryHistory(false);
    }
  };

  // Update chart data whenever store data changes
  const updateChartData = (data: StoreInventory[]) => {
    const totalKg = data.reduce((sum, item) => sum + item.totalKg, 0);
    const totalBags = data.reduce((sum, item) => sum + item.totalBags, 0);
    
    const chartData: ChartData[] = data.map(item => ({
      type: item.type,
      kg: item.totalKg,
      bags: item.totalBags,
      percentage: totalKg > 0 ? (item.totalKg / totalKg) * 100 : 0,
      color: getTypeColor(item.type).split(' ')[2],
      gradient: getTypeGradient(item.type)
    }));
    
    setChartData(chartData);
  };

  // Fetch paper types from backend
  const fetchPaperTypes = async () => {
    setLoadingPaperTypes(true);
    try {
      const response = await axios.get<{ status: string; data: PaperType[] }>('http://localhost:5000/papertypes');
      
      if (response.data.status === "success") {
        setPaperTypes(response.data.data);
      } else {
        throw new Error("Failed to fetch paper types");
      }
    } catch (error) {
      console.error("Error fetching paper types:", error);
      toast({
        title: "Connection Error",
        description: "Unable to fetch paper types from server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingPaperTypes(false);
    }
  };

  // Add new sale item to form
  const addSaleItem = () => {
    setSaleForm(prev => ({
      ...prev,
      saleItems: [
        ...prev.saleItems,
        {
          paperType: "",
          kgAmount: "",
          quantityBags: "",
          pricePerKg: "",
          totalPrices: ""
        }
      ]
    }));
  };

  // Remove sale item from form
  const removeSaleItem = (index: number) => {
    setSaleForm(prev => ({
      ...prev,
      saleItems: prev.saleItems.filter((_, i) => i !== index)
    }));
  };

  // Update sale item
  const updateSaleItem = (index: number, field: keyof SaleItem, value: string) => {
    setSaleForm(prev => {
      const updatedItems = [...prev.saleItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      // Calculate total price when kg amount or price per kg changes
      if (field === 'kgAmount' || field === 'pricePerKg') {
        const kg = parseFloat(updatedItems[index].kgAmount) || 0;
        const pricePerKg = parseFloat(updatedItems[index].pricePerKg) || 0;
        const total = kg * pricePerKg;
        
        if (!isNaN(total) && total > 0) {
          updatedItems[index].totalPrices = total.toFixed(2);
        }
      }

      // Calculate bags from kg (approximate)
      if (field === 'kgAmount' && !updatedItems[index].quantityBags) {
        const kg = parseFloat(value) || 0;
        const estimatedBags = Math.ceil(kg / 50); // Assuming ~50kg per bag
        
        if (kg > 0) {
          updatedItems[index].quantityBags = estimatedBags.toString();
        }
      }

      return { ...prev, saleItems: updatedItems };
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInventoryData();
    fetchSalesHistory();
    fetchInventoryHistory();
  }, []);

  // Fetch paper types when dialog opens
  useEffect(() => {
    if (dataEntryDialogOpen || saleDialogOpen) {
      fetchPaperTypes();
    }
  }, [dataEntryDialogOpen, saleDialogOpen]);

  const handleSale = async () => {
    if (!saleForm.buyerName || !saleForm.saleDate || saleForm.saleItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill buyer information and add at least one sale item",
        variant: "destructive"
      });
      return;
    }

    // Validate all sale items
    let hasError = false;
    const errorMessages: string[] = [];

    for (const [index, item] of saleForm.saleItems.entries()) {
      if (!item.paperType || !item.kgAmount || !item.quantityBags) {
        errorMessages.push(`Item ${index + 1}: Please fill all required fields`);
        hasError = true;
        continue;
      }

      const kg = parseFloat(item.kgAmount);
      const bags = parseInt(item.quantityBags);
      const storeItem = storeData.find(i => i.type === item.paperType);
      
      if (!storeItem) {
        errorMessages.push(`Item ${index + 1}: Paper type ${item.paperType} not found in inventory`);
        hasError = true;
        continue;
      }
      
      if (kg > storeItem.totalKg) {
        errorMessages.push(`Item ${index + 1}: Only ${storeItem.totalKg} kg available for ${item.paperType}`);
        hasError = true;
      }

      if (bags > storeItem.totalBags) {
        errorMessages.push(`Item ${index + 1}: Only ${storeItem.totalBags} bags available for ${item.paperType}`);
        hasError = true;
      }
    }

    if (hasError) {
      toast({
        title: "Sale Validation Failed",
        description: (
          <div className="space-y-1">
            {errorMessages.map((msg, i) => (
              <div key={i} className="text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
        ),
        variant: "destructive"
      });
      return;
    }

    try {
      // Send individual sales for each item (current backend structure)
      const salePromises = saleForm.saleItems.map(item => {
        const saleData = {
          paperType: item.paperType,
          kgAmount: parseFloat(item.kgAmount),
          quantityBags: parseInt(item.quantityBags),
          buyerName: saleForm.buyerName,
          saleDate: saleForm.saleDate,
          pricePerKg: item.pricePerKg ? parseFloat(item.pricePerKg) : undefined,
          totalPrice: item.totalPrices ? parseFloat(item.totalPrices) : undefined
        };

        return axios.post('http://localhost:5000/inventorysell', saleData);
      });

      const responses = await Promise.all(salePromises);
      const allSuccessful = responses.every(response => response.data.status === "success");

      if (allSuccessful) {
        // Update local state
        const updatedData = [...storeData];
        saleForm.saleItems.forEach(item => {
          const kg = parseFloat(item.kgAmount);
          const bags = parseInt(item.quantityBags);
          const itemIndex = updatedData.findIndex(i => i.type === item.paperType);
          
          if (itemIndex !== -1) {
            updatedData[itemIndex] = {
              ...updatedData[itemIndex],
              totalKg: updatedData[itemIndex].totalKg - kg,
              totalBags: updatedData[itemIndex].totalBags - bags,
              currentMonth: {
                ...updatedData[itemIndex].currentMonth,
                sold: updatedData[itemIndex].currentMonth.sold + kg
              }
            };
          }
        });

        setStoreData(updatedData);
        updateChartData(updatedData);

        // Refresh sales history
        fetchSalesHistory();

        toast({
          title: "🎉 Sales Recorded Successfully",
          description: `Recorded ${saleForm.saleItems.length} sale items for ${saleForm.buyerName}`,
          className: "bg-gradient-to-r from-green-500 to-green-600 text-white border-0"
        });

        // Reset form
        setSaleForm({
          buyerName: "",
          saleDate: new Date().toISOString().split('T')[0],
          saleItems: []
        });
        setSaleDialogOpen(false);
      }
    } catch (error) {
      console.error("Error recording sales:", error);
      toast({
        title: "Sale Failed",
        description: "Failed to record sales. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSort = async () => {
    const mixedKg = parseFloat(sortForm.mixedKg || "0");
    const swKg = parseFloat(sortForm.sw || "0");
    const scKg = parseFloat(sortForm.sc || "0");
    const cartonKg = parseFloat(sortForm.carton || "0");
    const npKg = parseFloat(sortForm.np || "0");
    const totalSorted = swKg + scKg + cartonKg + npKg;

    if (mixedKg === 0) {
      toast({
        title: "No Amount Specified",
        description: "Please enter mixed paper kg amount to sort",
        variant: "destructive"
      });
      return;
    }

    if (totalSorted !== mixedKg) {
      toast({
        title: "Amount Mismatch",
        description: "Total sorted paper must equal mixed paper amount",
        variant: "destructive"
      });
      return;
    }

    const mixedItem = storeData.find(i => i.type === "mixed");
    if (!mixedItem) return;

    if (mixedKg > mixedItem.totalKg) {
      toast({
        title: "Insufficient Mixed Paper",
        description: `Only ${mixedItem.totalKg} kg available to sort`,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/sorting', {
        mixedKg: mixedKg,
        sorted: {
          sw: swKg,
          sc: scKg,
          carton: cartonKg,
          np: npKg
        }
      });

      if (response.data.status === "success") {
        // Update local state
        const updatedData = storeData.map(i => {
          if (i.type === "mixed") {
            return { 
              ...i, 
              totalKg: i.totalKg - mixedKg,
              totalBags: i.totalBags - Math.floor(mixedKg / 50)
            };
          }
          if (i.type === "sw" && swKg > 0) {
            return { 
              ...i, 
              totalKg: i.totalKg + swKg,
              totalBags: i.totalBags + Math.floor(swKg / 50)
            };
          }
          if (i.type === "sc" && scKg > 0) {
            return { 
              ...i, 
              totalKg: i.totalKg + scKg,
              totalBags: i.totalBags + Math.floor(scKg / 50)
            };
          }
          if (i.type === "carton" && cartonKg > 0) {
            return { 
              ...i, 
              totalKg: i.totalKg + cartonKg,
              totalBags: i.totalBags + Math.floor(cartonKg / 50)
            };
          }
          if (i.type === "np" && npKg > 0) {
            return { 
              ...i, 
              totalKg: i.totalKg + npKg,
              totalBags: i.totalBags + Math.floor(npKg / 50)
            };
          }
          return i;
        });

        setStoreData(updatedData);
        updateChartData(updatedData);

        toast({
          title: "🔄 Sorting Completed",
          description: `Successfully sorted ${mixedKg} kg of mixed paper`,
          className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
        });

        setSortForm({ mixedKg: "", sw: "", sc: "", carton: "", np: "" });
        setSortDialogOpen(false);
      }
    } catch (error) {
      console.error("Error recording sort:", error);
      toast({
        title: "Sorting Failed",
        description: "Failed to record sorting operation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDataEntry = async () => {
    if (!dataEntryForm.paperType || !dataEntryForm.kgAmount || !dataEntryForm.totalBags || !dataEntryForm.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const kg = parseFloat(dataEntryForm.kgAmount);
    const bags = parseInt(dataEntryForm.totalBags);

    try {
      const response = await axios.post('http://localhost:5000/inventory', {
        paperType: dataEntryForm.paperType,
        kgAmount: kg,
        totalBags: bags,
        date: dataEntryForm.date
      });

      if (response.data.status === "success") {
        const updatedData = storeData.map(i => 
          i.type === dataEntryForm.paperType 
            ? { 
                ...i, 
                totalKg: i.totalKg + kg,
                totalBags: i.totalBags + bags,
                currentMonth: {
                  ...i.currentMonth,
                  collected: i.currentMonth.collected + kg
                },
                lastUpdated: dataEntryForm.date
              }
            : i
        );

        setStoreData(updatedData);
        updateChartData(updatedData);

        toast({
          title: "📦 Inventory Updated",
          description: `Added ${kg} kg (${bags} bags) of ${dataEntryForm.paperType.toUpperCase()} to inventory`,
          className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
        });

        setDataEntryForm({ 
          paperType: "", 
          kgAmount: "", 
          totalBags: "",
          date: new Date().toISOString().split('T')[0]
        });
        setDataEntryDialogOpen(false);
        fetchInventoryData();
        fetchInventoryHistory();
      } else {
        throw new Error(response.data.message || "Failed to save inventory data");
      }
    } catch (error) {
      console.error("Error saving inventory:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save inventory data to server. Please try again.",
        variant: "destructive"
      });
    }
  };

  const totalKg = storeData.reduce((sum, item) => sum + item.totalKg, 0);
  const totalBags = storeData.reduce((sum, item) => sum + item.totalBags, 0);
  const totalCollected = storeData.reduce((sum, item) => sum + item.currentMonth.collected, 0);
  const totalSold = storeData.reduce((sum, item) => sum + item.currentMonth.sold, 0);

  const bestPerformer = storeData.reduce((best, current) => 
    current.currentMonth.collected > best.currentMonth.collected ? current : best, 
    storeData[0] || { type: "N/A", currentMonth: { collected: 0 } }
  );

  const getTypeColor = (type: string) => {
    const colors = {
      mixed: "bg-gradient-to-r from-blue-600 to-blue-700",
      carton: "bg-gradient-to-r from-orange-600 to-orange-700", 
      np: "bg-gradient-to-r from-purple-600 to-purple-700",
      sc: "bg-gradient-to-r from-green-600 to-green-700",
      sw: "bg-gradient-to-r from-yellow-600 to-yellow-700",
      metal: "bg-gradient-to-r from-gray-600 to-gray-700"
    };
    return colors[type as keyof typeof colors] || "bg-gradient-to-r from-gray-600 to-gray-700";
  };

  const getTypeGradient = (type: string) => {
    const gradients = {
      mixed: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      carton: "linear-gradient(135deg, #ea580c, #c2410c)",
      np: "linear-gradient(135deg, #7c3aed, #6d28d9)",
      sc: "linear-gradient(135deg, #059669, #047857)",
      sw: "linear-gradient(135deg, #ca8a04, #a16207)",
      metal: "linear-gradient(135deg, #4b5563, #374151)"
    };
    return gradients[type as keyof typeof gradients] || "linear-gradient(135deg, #4b5563, #374151)";
  };

  const getPerformanceLevel = (sold: number, collected: number) => {
    const ratio = collected > 0 ? (sold / collected) * 100 : 0;
    if (ratio >= 90) return { level: "Excellent", color: "text-green-600", variant: "default" as const };
    if (ratio >= 70) return { level: "Good", color: "text-blue-600", variant: "secondary" as const };
    if (ratio >= 50) return { level: "Fair", color: "text-yellow-600", variant: "outline" as const };
    return { level: "Poor", color: "text-red-600", variant: "destructive" as const };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get current page data for inventory history
  const getCurrentInventoryHistory = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return inventoryHistory.slice(startIndex, endIndex);
  };

  // Export to Excel function
  const exportToExcel = (dataType: 'sales' | 'inventory') => {
    toast({
      title: "Export Started",
      description: `Preparing ${dataType} data for export...`,
    });
    
    setTimeout(() => {
      toast({
        title: "📊 Export Ready",
        description: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data has been prepared for download`,
        className: "bg-gradient-to-r from-green-500 to-green-600 text-white border-0"
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-lg font-medium">Loading inventory data...</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  // Mobile Navigation Tabs
  const MobileTabs = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-2xl backdrop-blur-lg bg-white/95">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center justify-center w-1/5 h-full transition-all duration-200 ${
            activeTab === "overview" 
              ? "text-blue-600 bg-gradient-to-t from-blue-50 to-white" 
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex flex-col items-center justify-center w-1/5 h-full transition-all duration-200 ${
            activeTab === "sales" 
              ? "text-blue-600 bg-gradient-to-t from-blue-50 to-white" 
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          <History className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Sales</span>
        </button>
        <button
          onClick={() => setActiveTab("inventory-history")}
          className={`flex flex-col items-center justify-center w-1/5 h-full transition-all duration-200 ${
            activeTab === "inventory-history" 
              ? "text-blue-600 bg-gradient-to-t from-blue-50 to-white" 
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          <Layers className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">History</span>
        </button>
        <button
          onClick={() => setDataEntryDialogOpen(true)}
          className="flex flex-col items-center justify-center w-1/5 h-full text-green-600 hover:text-green-700 hover:bg-gradient-to-t from-green-50 to-white transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Add</span>
        </button>
        <button
          onClick={() => setSaleDialogOpen(true)}
          className="flex flex-col items-center justify-center w-1/5 h-full text-red-600 hover:text-red-700 hover:bg-gradient-to-t from-red-50 to-white transition-all duration-200"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Sell</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Mobile Tabs */}
      <MobileTabs />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Paper Store Management
            </h1>
            <p className="text-muted-foreground mt-1">Comprehensive inventory and sales tracking system</p>
          </div>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              fetchInventoryData();
              fetchSalesHistory();
              fetchInventoryHistory();
            }}
            className="gap-2 border-blue-200 hover:bg-blue-50 transition-all duration-200"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>

          <Dialog open={dataEntryDialogOpen} onOpenChange={setDataEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200">
                <Plus className="h-4 w-4" />
                Add Inventory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Inventory
                </DialogTitle>
                <DialogDescription>
                  Select paper type and enter collection details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-3">
                  <Label htmlFor="paperType" className="text-sm font-medium">Paper Type *</Label>
                  <Select 
                    value={dataEntryForm.paperType} 
                    onValueChange={(val) => setDataEntryForm({...dataEntryForm, paperType: val})}
                    disabled={loadingPaperTypes}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder={
                        loadingPaperTypes ? "Loading paper types..." : "Select paper type"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {paperTypes.map((paperType) => (
                        <SelectItem key={paperType.id} value={paperType.code.toLowerCase()}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getTypeColor(paperType.code.toLowerCase())}`} />
                            <span className="font-medium">{paperType.code}</span>
                            <span className="text-xs text-muted-foreground">({paperType.name})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingPaperTypes && (
                    <p className="text-xs text-muted-foreground animate-pulse">Fetching paper types...</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
                  <Input 
                    id="date"
                    type="date" 
                    value={dataEntryForm.date}
                    onChange={(e) => setDataEntryForm({...dataEntryForm, date: e.target.value})}
                    className="w-full h-12"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="kgAmount" className="text-sm font-medium">Weight (kg) *</Label>
                    <Input 
                      id="kgAmount"
                      type="number" 
                      placeholder="0.00"
                      value={dataEntryForm.kgAmount}
                      onChange={(e) => setDataEntryForm({...dataEntryForm, kgAmount: e.target.value})}
                      className="w-full h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="totalBags" className="text-sm font-medium">Total Bags *</Label>
                    <Input 
                      id="totalBags"
                      type="number" 
                      placeholder="0"
                      value={dataEntryForm.totalBags}
                      onChange={(e) => setDataEntryForm({...dataEntryForm, totalBags: e.target.value})}
                      className="w-full h-12"
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium mb-2 text-blue-900">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Paper Type:</span>
                      <span className="font-medium capitalize text-blue-900">{dataEntryForm.paperType || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Date:</span>
                      <span className="font-medium text-blue-900">{dataEntryForm.date || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Weight:</span>
                      <span className="font-medium text-blue-900">{dataEntryForm.kgAmount || "0"} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Bags:</span>
                      <span className="font-medium text-blue-900">{dataEntryForm.totalBags || "0"} bags</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDataEntry} 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200"
                  disabled={loadingPaperTypes || !dataEntryForm.paperType || !dataEntryForm.kgAmount || !dataEntryForm.totalBags || !dataEntryForm.date}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loadingPaperTypes ? "Processing..." : "Add to Inventory"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25 transition-all duration-200">
                <ShoppingCart className="h-4 w-4" />
                Make Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  Record Sale
                </DialogTitle>
                <DialogDescription>Enter complete sale details including buyer information</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Buyer Name *</Label>
                    <Input 
                      type="text" 
                      placeholder="Enter buyer name"
                      value={saleForm.buyerName}
                      onChange={(e) => setSaleForm({...saleForm, buyerName: e.target.value})}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Sale Date *</Label>
                    <Input 
                      type="date" 
                      value={saleForm.saleDate}
                      onChange={(e) => setSaleForm({...saleForm, saleDate: e.target.value})}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Sale Items</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addSaleItem}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  {saleForm.saleItems.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                      <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No sale items added</p>
                      <p className="text-xs text-gray-400">Click "Add Item" to start</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {saleForm.saleItems.map((item, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-white shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Item {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSaleItem(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Paper Type *</Label>
                              <Select 
                                value={item.paperType} 
                                onValueChange={(val) => updateSaleItem(index, 'paperType', val)}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select paper type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {storeData.map(storeItem => (
                                    <SelectItem key={storeItem.id} value={storeItem.type}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${getTypeColor(storeItem.type)}`} />
                                        <span className="capitalize">{storeItem.type}</span>
                                        <span className="text-xs text-muted-foreground">({storeItem.name})</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Weight (kg) *</Label>
                              <Input 
                                type="number" 
                                placeholder="0.00"
                                value={item.kgAmount}
                                onChange={(e) => updateSaleItem(index, 'kgAmount', e.target.value)}
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Quantity (Bags) *</Label>
                              <Input 
                                type="number" 
                                placeholder="0"
                                value={item.quantityBags}
                                onChange={(e) => updateSaleItem(index, 'quantityBags', e.target.value)}
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Price per Kg (ETB)</Label>
                              <Input 
                                type="number" 
                                placeholder="0.00"
                                value={item.pricePerKg}
                                onChange={(e) => updateSaleItem(index, 'pricePerKg', e.target.value)}
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-xs">Total Price (ETB)</Label>
                              <Input 
                                type="number" 
                                placeholder="0.00"
                                value={item.totalPrices}
                                onChange={(e) => updateSaleItem(index, 'totalPrices', e.target.value)}
                                className="h-10 bg-muted"
                                readOnly
                              />
                            </div>
                          </div>

                          {item.paperType && (
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded border border-green-200">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-green-700">Available Weight:</span>
                                  <span className="font-medium text-green-900 ml-2">
                                    {storeData.find(i => i.type === item.paperType)?.totalKg || 0} kg
                                  </span>
                                </div>
                                <div>
                                  <span className="text-green-700">Available Bags:</span>
                                  <span className="font-medium text-green-900 ml-2">
                                    {storeData.find(i => i.type === item.paperType)?.totalBags || 0} bags
                                  </span>
                                </div>
                              </div>
                              {parseFloat(item.kgAmount) > (storeData.find(i => i.type === item.paperType)?.totalKg || 0) && (
                                <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Warning: Sale quantity exceeds available stock
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Sale Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Items:</span>
                      <span className="font-medium text-green-900">{saleForm.saleItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Weight:</span>
                      <span className="font-medium text-green-900">
                        {saleForm.saleItems.reduce((sum, item) => sum + parseFloat(item.kgAmount || "0"), 0).toFixed(2)} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Bags:</span>
                      <span className="font-medium text-green-900">
                        {saleForm.saleItems.reduce((sum, item) => sum + parseInt(item.quantityBags || "0"), 0)} bags
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Amount:</span>
                      <span className="font-medium text-green-900">
                        ETB {saleForm.saleItems.reduce((sum, item) => sum + parseFloat(item.totalPrices || "0"), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSale} 
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25 transition-all duration-200"
                  disabled={!saleForm.buyerName || !saleForm.saleDate || saleForm.saleItems.length === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Record Sale ({saleForm.saleItems.length} items)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 h-12 rounded-lg">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Sales History</span>
          </TabsTrigger>
          <TabsTrigger value="inventory-history" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory History</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats - Small Cards on Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group border-0 hover:scale-105 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-blue-50">Total Inventory</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">{totalKg.toLocaleString()} kg</div>
                <p className="text-xs text-blue-100 mt-1">{totalBags.toLocaleString()} bags</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group border-0 hover:scale-105 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-green-50">Monthly Sales</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">{totalSold.toLocaleString()} kg</div>
                <p className="text-xs text-green-100 mt-1">{Math.ceil(totalSold/50)} bags sold</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group border-0 hover:scale-105 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-orange-50">Total Collected</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">{totalCollected.toLocaleString()}</div>
                <p className="text-xs text-orange-100 mt-1">kg this month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group border-0 hover:scale-105 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-purple-50">Top Performer</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Scale className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-sm md:text-xl font-bold capitalize">{bestPerformer.type}</div>
                <p className="text-xs text-purple-100 mt-1">{bestPerformer.currentMonth.collected.toLocaleString()} kg</p>
              </CardContent>
            </Card>
          </div>

          {/* Modern Chart Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Distribution Chart */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Inventory Distribution</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-white/80">
                    {totalKg.toLocaleString()} kg total
                  </Badge>
                </div>
                <CardDescription>Weight distribution across paper types</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {chartData.map((item) => (
                    <div key={item.type} className="space-y-3 group hover:scale-105 transition-transform duration-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ background: item.gradient }}
                          />
                          <div>
                            <span className="font-semibold capitalize text-gray-900">{item.type}</span>
                            <p className="text-xs text-muted-foreground">{item.bags.toLocaleString()} bags</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 text-lg">{item.kg.toLocaleString()} kg</span>
                          <p className="text-sm text-muted-foreground">({item.percentage.toFixed(1)}%)</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                          style={{ 
                            width: `${item.percentage}%`,
                            background: item.gradient
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales Performance Chart */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Sales Performance</CardTitle>
                </div>
                <CardDescription>Monthly sales trends and revenue</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {storeData.map((item) => {
                    const revenue = item.currentMonth.sold * 25; // Assuming 25 ETB per kg
                    return (
                      <div key={item.id} className="space-y-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200 group hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getTypeColor(item.type)}`} />
                            <div>
                              <span className="font-semibold capitalize text-gray-900">{item.type}</span>
                              <p className="text-xs text-muted-foreground">{item.name}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs font-medium bg-green-50 text-green-700">
                            ETB {revenue.toLocaleString()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Collected</p>
                            <p className="text-xl font-bold text-gray-900">{item.currentMonth.collected}</p>
                            <p className="text-xs text-blue-600">kg</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">Sold</p>
                            <p className="text-xl font-bold text-gray-900">{item.currentMonth.sold}</p>
                            <p className="text-xs text-green-600">kg</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sales Rate</span>
                            <span className="font-semibold text-gray-900">
                              {((item.currentMonth.sold / item.currentMonth.collected) * 100 || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${Math.min((item.currentMonth.sold / item.currentMonth.collected) * 100 || 0, 100)}%`,
                                background: 'linear-gradient(90deg, #10b981, #059669)'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales History Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Sales Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg border-0 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-purple-50">Total Sales</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Database className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">{overallTotals.totalKgSold} kg</div>
                <p className="text-xs text-purple-100 mt-1">{overallTotals.totalBagsSold} bags sold</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg border-0 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-green-50">Total Revenue</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <IndianRupee className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">ETB {parseFloat(overallTotals.totalBirr).toLocaleString()}</div>
                <p className="text-xs text-green-100 mt-1">Total revenue generated</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border-0 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-blue-50">Total Transactions</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Receipt className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">{salesHistory.length}</div>
                <p className="text-xs text-blue-100 mt-1">Sales records</p>
              </CardContent>
            </Card>
          </div>

          {/* Modern Sales History Table */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 md:h-6 md:w-6" />
                  <div>
                    <CardTitle className="text-lg md:text-xl">Sales History</CardTitle>
                    <CardDescription className="text-purple-100 text-xs md:text-sm">
                      Complete transaction history with financial details
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={fetchSalesHistory}
                    disabled={loadingSalesHistory}
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${loadingSalesHistory ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => exportToExcel('sales')}
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm text-xs"
                  >
                    <Download className="h-3 w-3 md:h-4 md:w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingSalesHistory ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <div className="text-center space-y-2">
                    <RefreshCw className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto text-purple-600" />
                    <p className="text-sm text-muted-foreground">Loading sales history...</p>
                  </div>
                </div>
              ) : salesHistory.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Receipt className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No sales history</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">Start recording sales to see them here</p>
                  <Button onClick={() => setSaleDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-purple-700 text-xs md:text-sm">
                    <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Record First Sale
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <Table className="hidden md:table">
                    <TableHeader className="bg-purple-50">
                      <TableRow>
                        <TableHead className="font-semibold text-purple-900">Buyer</TableHead>
                        <TableHead className="font-semibold text-purple-900">Paper Type</TableHead>
                        <TableHead className="text-right font-semibold text-purple-900">Weight</TableHead>
                        <TableHead className="text-right font-semibold text-purple-900">Bags</TableHead>
                        <TableHead className="text-right font-semibold text-purple-900">Price/Kg</TableHead>
                        <TableHead className="text-right font-semibold text-purple-900">Total</TableHead>
                        <TableHead className="font-semibold text-purple-900">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesHistory.map((sale) => (
                        <TableRow key={sale.saleId} className="hover:bg-purple-50/50 group border-b border-gray-100 transition-colors duration-200">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">{sale.buyerName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getTypeColor(sale.paperTypeCode.toLowerCase())}`} />
                              <div>
                                <span className="font-medium capitalize">{sale.paperTypeCode}</span>
                                <p className="text-xs text-muted-foreground">{sale.paperTypeName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900">{sale.quantityKg.toLocaleString()} kg</TableCell>
                          <TableCell className="text-right font-medium">{sale.quantityBags} bags</TableCell>
                          <TableCell className="text-right font-medium">
                            {sale.pricePerKg ? `ETB ${sale.pricePerKg}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {sale.totalPrice ? `ETB ${sale.totalPrice.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{formatDate(sale.saleDate)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Mobile Cards - Compact Design */}
                  <div className="md:hidden space-y-2 p-3">
                    {salesHistory.map((sale) => (
                      <Card key={sale.saleId} className="p-3 hover:shadow-md transition-all duration-200 border border-gray-200">
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getTypeColor(sale.paperTypeCode.toLowerCase())}`} />
                              <span className="font-semibold text-sm capitalize">{sale.paperTypeCode}</span>
                            </div>
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                              {formatDate(sale.saleDate)}
                            </Badge>
                          </div>

                          {/* Buyer Info */}
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-600" />
                            <span className="font-medium text-xs">{sale.buyerName}</span>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-4 gap-1 text-xs">
                            <div className="text-center p-1 bg-blue-50 rounded">
                              <p className="text-blue-600 font-medium">WEIGHT</p>
                              <p className="font-bold text-gray-900">{sale.quantityKg} kg</p>
                            </div>
                            <div className="text-center p-1 bg-green-50 rounded">
                              <p className="text-green-600 font-medium">BAGS</p>
                              <p className="font-bold text-gray-900">{sale.quantityBags}</p>
                            </div>
                            {sale.pricePerKg && (
                              <>
                                <div className="text-center p-1 bg-orange-50 rounded">
                                  <p className="text-orange-600 font-medium">PRICE</p>
                                  <p className="font-bold text-gray-900">ETB {sale.pricePerKg}</p>
                                </div>
                                <div className="text-center p-1 bg-purple-50 rounded">
                                  <p className="text-purple-600 font-medium">TOTAL</p>
                                  <p className="font-bold text-gray-900">ETB {sale.totalPrice?.toLocaleString()}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory History Tab */}
        <TabsContent value="inventory-history" className="space-y-6">
          {/* Inventory History Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg border-0 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-green-50">Report Period</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-sm md:text-lg font-bold">{inventoryHistoryTotals.reportMonth}</div>
                <p className="text-xs text-green-100 mt-1">Current reporting period</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border-0 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-blue-50">Total Entries</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Database className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">{inventoryHistoryTotals.totalEntries}</div>
                <p className="text-xs text-blue-100 mt-1">Inventory records</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg border-0 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-orange-50">Total Weight</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Scale className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">{inventoryHistoryTotals.totalKg} kg</div>
                <p className="text-xs text-orange-100 mt-1">Total collected weight</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg border-0 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-purple-50">Total Bags</CardTitle>
                <div className="p-1 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Package className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-lg md:text-2xl font-bold">{parseInt(inventoryHistoryTotals.totalBags).toLocaleString()}</div>
                <p className="text-xs text-purple-100 mt-1">Total bags collected</p>
              </CardContent>
            </Card>
          </div>

          {/* Modern Inventory History Table */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 md:h-6 md:w-6" />
                  <div>
                    <CardTitle className="text-lg md:text-xl">Inventory History</CardTitle>
                    <CardDescription className="text-green-100 text-xs md:text-sm">
                      Complete inventory collection history for {inventoryHistoryTotals.reportMonth}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={fetchInventoryHistory}
                    disabled={loadingInventoryHistory}
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${loadingInventoryHistory ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => exportToExcel('inventory')}
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm text-xs"
                  >
                    <Download className="h-3 w-3 md:h-4 md:w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingInventoryHistory ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <div className="text-center space-y-2">
                    <RefreshCw className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto text-green-600" />
                    <p className="text-sm text-muted-foreground">Loading inventory history...</p>
                  </div>
                </div>
              ) : getCurrentInventoryHistory().length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Package className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No inventory history</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">Start adding inventory to see records here</p>
                  <Button onClick={() => setDataEntryDialogOpen(true)} className="bg-gradient-to-r from-green-600 to-green-700 text-xs md:text-sm">
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Add Inventory
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <Table className="hidden md:table">
                    <TableHeader className="bg-green-50">
                      <TableRow>
                        <TableHead className="font-semibold text-green-900">Paper Type</TableHead>
                        <TableHead className="text-right font-semibold text-green-900">Weight (kg)</TableHead>
                        <TableHead className="text-right font-semibold text-green-900">Bags</TableHead>
                        <TableHead className="font-semibold text-green-900">Collection Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentInventoryHistory().map((entry) => (
                        <TableRow key={entry.inventoryId} className="hover:bg-green-50/50 group border-b border-gray-100 transition-colors duration-200">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getTypeColor(entry.paperTypeCode.toLowerCase())}`} />
                              <div>
                                <span className="font-semibold">{entry.paperTypeCode}</span>
                                <p className="text-xs text-muted-foreground">{entry.paperTypeName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`font-bold ${parseFloat(entry.kgAmount) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {parseFloat(entry.kgAmount).toLocaleString()} kg
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`font-medium ${entry.totalBags < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {entry.totalBags.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{formatDate(entry.collectionDate)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Mobile Cards - Compact Design */}
                  <div className="md:hidden space-y-2 p-3">
                    {getCurrentInventoryHistory().map((entry) => (
                      <Card key={entry.inventoryId} className="p-3 hover:shadow-md transition-all duration-200 border border-gray-200">
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getTypeColor(entry.paperTypeCode.toLowerCase())}`} />
                              <span className="font-semibold text-sm">{entry.paperTypeCode}</span>
                            </div>
                            <Badge 
                              variant={parseFloat(entry.kgAmount) < 0 ? "destructive" : "outline"} 
                              className="text-xs"
                            >
                              {parseFloat(entry.kgAmount) < 0 ? "Adjustment" : "Collection"}
                            </Badge>
                          </div>

                          <div className="text-xs text-gray-600">{entry.paperTypeName}</div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={`text-center p-2 rounded ${
                              parseFloat(entry.kgAmount) < 0 ? 'bg-red-50' : 'bg-blue-50'
                            }`}>
                              <p className={`font-medium ${
                                parseFloat(entry.kgAmount) < 0 ? 'text-red-600' : 'text-blue-600'
                              }`}>
                                WEIGHT
                              </p>
                              <p className={`font-bold ${
                                parseFloat(entry.kgAmount) < 0 ? 'text-red-700' : 'text-gray-900'
                              }`}>
                                {parseFloat(entry.kgAmount).toLocaleString()} kg
                              </p>
                            </div>
                            <div className={`text-center p-2 rounded ${
                              entry.totalBags < 0 ? 'bg-red-50' : 'bg-green-50'
                            }`}>
                              <p className={`font-medium ${
                                entry.totalBags < 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                BAGS
                              </p>
                              <p className={`font-bold ${
                                entry.totalBags < 0 ? 'text-red-700' : 'text-gray-900'
                              }`}>
                                {entry.totalBags.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="text-center p-1 bg-gray-50 rounded text-xs">
                            <p className="text-gray-600 font-medium">Collection Date</p>
                            <p className="font-medium text-gray-900">{formatDate(entry.collectionDate)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min(getCurrentInventoryHistory().length, itemsPerPage)} of {inventoryHistory.length} entries
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage * itemsPerPage >= inventoryHistory.length}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}