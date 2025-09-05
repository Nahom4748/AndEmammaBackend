import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Download, Filter, FileText, BarChart3, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { MonthlyReport } from "@/components/MonthlyReport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

// API base URL
const API_BASE_URL = "http://localhost:5000";

interface MonthlyReportData {
  month: string;
  regular: number;
  instore: number;
  total: number;
}

interface SupplierPerformance {
  name: string;
  collections: number;
  regular: number;
  instore: number;
}

interface CollectionType {
  name: string;
  value: number;
  color: string;
}

interface YearlyStats {
  year: string;
  total_collections: number;
  regular_collections: number;
  instore_collections: number;
  growth_percentage: number;
}

const Reports = () => {
  const [date, setDate] = useState<DateRange | undefined>();
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReportData[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [collectionTypes, setCollectionTypes] = useState<CollectionType[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStats[]>([]);
  const [isLoading, setIsLoading] = useState({
    monthly: true,
    suppliers: true,
    collectionTypes: true,
    yearly: true
  });
  const [error, setError] = useState({
    monthly: '',
    suppliers: '',
    collectionTypes: '',
    yearly: ''
  });
  const { toast } = useToast();

  // Fetch monthly report data
  useEffect(() => {
    const fetchMonthlyReport = async () => {
      try {
        setIsLoading(prev => ({ ...prev, monthly: true }));
        const response = await axios.get(`${API_BASE_URL}/api/getYearlyDashboardStats`);
        
        if (response.data.status === "success") {
          // Transform the data to match the expected format
          const transformedData = response.data.data.map((item: any) => ({
            month: item.month,
            regular: parseFloat(item.regular) || 0,
            instore: parseFloat(item.instore) || 0,
            total: (parseFloat(item.regular) || 0) + (parseFloat(item.instore) || 0)
          }));
          setMonthlyReport(transformedData);
        } else {
          setError(prev => ({ ...prev, monthly: 'Failed to load monthly report data' }));
          toast({
            title: "Error",
            description: "Failed to load monthly report data",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching monthly report:", err);
        setError(prev => ({ ...prev, monthly: 'Failed to load monthly report data' }));
        toast({
          title: "Error",
          description: "Failed to load monthly report data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, monthly: false }));
      }
    };

    fetchMonthlyReport();
  }, [toast]);

  // Fetch supplier performance data
  useEffect(() => {
    const fetchSupplierPerformance = async () => {
      try {
        setIsLoading(prev => ({ ...prev, suppliers: true }));
        const response = await axios.get(`${API_BASE_URL}/api/getSupplierPerformance`);
        
        if (response.data.status === "success") {
          // Transform the data to match the expected format
          const transformedData = response.data.data.map((item: any) => ({
            name: item.name,
            collections: parseFloat(item.collections) || 0,
            regular: parseFloat(item.regular) || 0,
            instore: parseFloat(item.instore) || 0
          }));
          setSupplierPerformance(transformedData);
        } else {
          setError(prev => ({ ...prev, suppliers: 'Failed to load supplier performance data' }));
          toast({
            title: "Error",
            description: "Failed to load supplier performance data",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching supplier performance:", err);
        setError(prev => ({ ...prev, suppliers: 'Failed to load supplier performance data' }));
        toast({
          title: "Error",
          description: "Failed to load supplier performance data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, suppliers: false }));
      }
    };

    fetchSupplierPerformance();
  }, [toast]);

  // Fetch collection type breakdown data
  useEffect(() => {
    const fetchCollectionTypes = async () => {
      try {
        setIsLoading(prev => ({ ...prev, collectionTypes: true }));
        const response = await axios.get(`${API_BASE_URL}/api/getCollectionTypeBreakdown`);
        
        if (response.data.status === "success") {
          // Define colors for the pie chart
          const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A4DE6C', '#D0ED57', '#FFC0CB'];
          
          // Transform the data to match the expected format
          const transformedData = response.data.data.map((item: any, index: number) => ({
            name: item.name,
            value: parseFloat(item.value) || 0,
            color: colors[index % colors.length]
          }));
          setCollectionTypes(transformedData);
        } else {
          setError(prev => ({ ...prev, collectionTypes: 'Failed to load collection type data' }));
          toast({
            title: "Error",
            description: "Failed to load collection type data",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching collection types:", err);
        setError(prev => ({ ...prev, collectionTypes: 'Failed to load collection type data' }));
        toast({
          title: "Error",
          description: "Failed to load collection type data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, collectionTypes: false }));
      }
    };

    fetchCollectionTypes();
  }, [toast]);

  // Fetch yearly dashboard stats
  useEffect(() => {
    const fetchYearlyStats = async () => {
      try {
        setIsLoading(prev => ({ ...prev, yearly: true }));
        const response = await axios.get(`${API_BASE_URL}/api/getYearlyDashboardStats`);
        
        if (response.data.status === "success") {
          setYearlyStats(response.data.data);
        } else {
          setError(prev => ({ ...prev, yearly: 'Failed to load yearly stats' }));
          toast({
            title: "Error",
            description: "Failed to load yearly stats",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching yearly stats:", err);
        setError(prev => ({ ...prev, yearly: 'Failed to load yearly stats' }));
        toast({
          title: "Error",
          description: "Failed to load yearly stats",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, yearly: false }));
      }
    };

    fetchYearlyStats();
  }, [toast]);

  const reportTemplates = [
    {
      title: "Monthly Collection Summary",
      description: "Comprehensive monthly overview of all collections",
      icon: FileText,
      lastGenerated: "2025-05-30",
      status: "ready",
    },
    {
      title: "Supplier Performance Report",
      description: "Analysis of supplier efficiency and collection volumes",
      icon: BarChart3,
      lastGenerated: "2025-05-28",
      status: "ready",
    },
    {
      title: "Collection Type Analysis",
      description: "Breakdown of collection types and trends",
      icon: TrendingUp,
      lastGenerated: "2025-05-29",
      status: "processing",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const downloadReport = (type: string) => {
    toast({
      title: "Download Started",
      description: `${type} report download has started`,
    });
    
    // In a real app, this would generate and download the report
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${type} report has been downloaded successfully`,
      });
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Professional reporting and performance evaluation</p>
          </div>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          <MonthlyReport />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Summary</SelectItem>
                      <SelectItem value="supplier">Supplier Performance</SelectItem>
                      <SelectItem value="collection">Collection Analysis</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button>Generate Report</Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Collection Trends</CardTitle>
                <CardDescription>Regular vs in-store collections over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading.monthly ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error.monthly ? (
                  <div className="h-[300px] flex items-center justify-center text-red-500">
                    {error.monthly}
                  </div>
                ) : monthlyReport.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No monthly data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyReport}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} kg`, 'Weight']}
                      />
                      <Legend />
                      <Bar dataKey="regular" fill="#0088FE" name="Regular" />
                      <Bar dataKey="instore" fill="#00C49F" name="In-store" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Types Distribution</CardTitle>
                <CardDescription>Breakdown by collection type</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading.collectionTypes ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error.collectionTypes ? (
                  <div className="h-[300px] flex items-center justify-center text-red-500">
                    {error.collectionTypes}
                  </div>
                ) : collectionTypes.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No collection type data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={collectionTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {collectionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} kg`, 'Weight']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Supplier Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Suppliers</CardTitle>
              <CardDescription>Suppliers ranked by collection volume</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading.suppliers ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error.suppliers ? (
                <div className="h-64 flex items-center justify-center text-red-500">
                  {error.suppliers}
                </div>
              ) : supplierPerformance.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No supplier data available
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Supplier</th>
                        <th className="text-right p-2">Total Collections (kg)</th>
                        <th className="text-right p-2">Regular (kg)</th>
                        <th className="text-right p-2">In-store (kg)</th>
                        <th className="text-right p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierPerformance.map((supplier, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{supplier.name}</td>
                          <td className="p-2 text-right">{supplier.collections.toFixed(2)}</td>
                          <td className="p-2 text-right">{supplier.regular.toFixed(2)}</td>
                          <td className="p-2 text-right">{supplier.instore.toFixed(2)}</td>
                          <td className="p-2 text-right">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-configured report templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {reportTemplates.map((template, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <template.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{template.title}</h4>
                        <Badge className={getStatusColor(template.status)} variant="outline">
                          {template.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Last: {template.lastGenerated}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadReport(template.title)}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;