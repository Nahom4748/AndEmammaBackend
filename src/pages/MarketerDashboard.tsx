import { useState, useEffect } from "react";
import { useAuth } from "@/components/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Users,
  Package,
  TrendingUp,
  Building2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Target,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Collection {
  type: string;
  totalKg: string;
}

interface SupplierPerformance {
  supplierName: string;
  collections: Collection[];
}

interface PerformanceSummary {
  totalInstoreCollections: number;
  totalRegularCollections: number;
  totalKgCollected: string;
}

interface PerformanceData {
  results: SupplierPerformance[];
  summary: PerformanceSummary;
}

export const MarketerDashboard = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("thisMonth");
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/marketersperformance/${user?.user_id}/suppliers`);
      if (response.data.status === "success") {
        setPerformanceData(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch performance data");
      console.error("Error fetching performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchPerformanceData();
    }
  }, [user]);

  const calculateTotalCollected = () => {
    if (!performanceData || !performanceData.summary) return 0;
    
    const totalValue = performanceData.summary.totalKgCollected;
    
    if (typeof totalValue === 'number') {
      return totalValue;
    }
    
    if (typeof totalValue === 'string') {
      const digitSequences = totalValue.match(/\d+/g);
      
      if (digitSequences && digitSequences.length > 0) {
        let longestSequence = "";
        for (const seq of digitSequences) {
          if (seq.length > longestSequence.length) {
            longestSequence = seq;
          }
        }
        
        if (longestSequence) {
          const numericValue = parseInt(longestSequence, 10);
          return isNaN(numericValue) ? 0 : numericValue;
        }
      }
      
      const numericString = totalValue.replace(/[^\d]/g, '');
      const numericValue = parseInt(numericString, 10);
      return isNaN(numericValue) ? 0 : numericValue;
    }
    
    return 0;
  };

  const monthlyTarget = 2000;
  const calculateProgress = () => {
    const totalCollected = calculateTotalCollected();
    return Math.min((totalCollected / monthlyTarget) * 100, 100);
  };

  const toggleSupplierExpansion = (supplierName: string) => {
    setExpandedSupplier(expandedSupplier === supplierName ? null : supplierName);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md mx-4 border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading performance data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Marketing Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Overview of your performance and assigned suppliers for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[140px] md:w-[180px] bg-blue-50 border-blue-100">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <SelectValue placeholder="Select time frame" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisQuarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchPerformanceData} 
              className="bg-blue-50 border-blue-100 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-0 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">Assigned Suppliers</CardTitle>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-gray-900">{performanceData ? performanceData.results.length : 0}</div>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">Active this month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Collection</CardTitle>
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-gray-900">{calculateTotalCollected().toLocaleString()} kg</div>
              <div className="flex items-center mt-2">
                <Target className="h-3 w-3 text-gray-500 mr-1" />
                <span className="text-xs text-gray-500">
                  {((calculateTotalCollected() / monthlyTarget) * 100).toFixed(1)}% of target
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">Regular Collections</CardTitle>
              <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-gray-900">{performanceData ? performanceData.summary.totalRegularCollections : 0}</div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Regular pickup count</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">In-Store Collections</CardTitle>
              <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-gray-900">{performanceData ? performanceData.summary.totalInstoreCollections : 0}</div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">In-store collection count</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress and Performance */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <Card className="col-span-2 bg-white border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center text-blue-800">
                <BarChart3 className="h-5 w-5 mr-2" />
                Collection Progress
              </CardTitle>
              <CardDescription className="text-blue-600">
                Your progress towards the monthly target of {monthlyTarget.toLocaleString()} kg
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Collection</span>
                  <span className="text-sm font-medium text-blue-700">{calculateTotalCollected().toLocaleString()} kg</span>
                </div>
                <Progress value={calculateProgress()} className="h-3 bg-gray-100" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">0 kg</span>
                  <span className="text-xs text-gray-500">{monthlyTarget.toLocaleString()} kg</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-xs font-medium text-gray-700">Regular</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {performanceData ? performanceData.results.reduce((sum, supplier) => {
                        const regular = supplier.collections.find(c => c.type === "Regular");
                        return sum + (regular ? parseFloat(regular.totalKg || "0") : 0);
                      }, 0).toLocaleString() : 0} kg
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs font-medium text-gray-700">In-Store</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {performanceData ? performanceData.results.reduce((sum, supplier) => {
                        const instore = supplier.collections.find(c => c.type === "Instore");
                        return sum + (instore ? parseFloat(instore.totalKg || "0") : 0);
                      }, 0).toLocaleString() : 0} kg
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">Performance Overview</CardTitle>
              <CardDescription className="text-gray-500">
                Your supplier engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Collection Rate</p>
                    <p className="text-sm text-gray-600">
                      {performanceData ? Math.round((calculateTotalCollected() / monthlyTarget) * 100) : 0}% of monthly target
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Supplier Engagement</p>
                    <p className="text-sm text-gray-600">
                      {performanceData ? performanceData.results.length : 0} active suppliers
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers List */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-blue-800">Suppliers Collection Summary</CardTitle>
            <CardDescription className="text-blue-600">
              Detailed breakdown of collection by supplier for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 hover:bg-blue-50">
                    <TableHead className="text-blue-800 font-semibold py-3 w-[50px]"></TableHead>
                    <TableHead className="text-blue-800 font-semibold py-3">Supplier Name</TableHead>
                    <TableHead className="text-blue-800 font-semibold py-3 text-right">Total (kg)</TableHead>
                    <TableHead className="text-blue-800 font-semibold py-3 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData?.results.map((supplier) => {
                    const regularCollection = supplier.collections.find(c => c.type === "Regular");
                    const instoreCollection = supplier.collections.find(c => c.type === "Instore");
                    const regularKg = regularCollection ? parseFloat(regularCollection.totalKg || "0") : 0;
                    const instoreKg = instoreCollection ? parseFloat(instoreCollection.totalKg || "0") : 0;
                    const totalKg = regularKg + instoreKg;
                    const isActive = totalKg > 0;
                    const isExpanded = expandedSupplier === supplier.supplierName;

                    return (
                      <>
                        <TableRow key={supplier.supplierName} className="border-b border-blue-100 group hover:bg-blue-50 cursor-pointer" onClick={() => toggleSupplierExpansion(supplier.supplierName)}>
                          <TableCell className="py-3">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900 py-3">{supplier.supplierName}</TableCell>
                          <TableCell className="text-gray-900 font-medium py-3 text-right">{totalKg.toLocaleString()} kg</TableCell>
                          <TableCell className="py-3 text-right">
                            {isActive ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-blue-25 border-b border-blue-100">
                            <TableCell colSpan={4} className="p-0">
                              <div className="bg-blue-25 p-4 pl-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white p-3 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-blue-700">In-Store Collection</span>
                                      <Badge variant="outline" className="bg-blue-50">{instoreKg.toLocaleString()} kg</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Collection from in-store operations</p>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-green-700">Regular Collection</span>
                                      <Badge variant="outline" className="bg-green-50">{regularKg.toLocaleString()} kg</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Regular pickup collection</p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {(!performanceData || performanceData.results.length === 0) && (
              <div className="text-center py-8 px-4">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No suppliers found</h3>
                <p className="text-gray-500">
                  No supplier data is available for the current period.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};