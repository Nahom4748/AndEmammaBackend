
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Car, Building, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PerformanceCards } from "@/components/PerformanceCards";
import { CarPerformanceChart } from "@/components/CarPerformanceChart";
import { SupplierPerformanceTable } from "@/components/SupplierPerformanceTable";
import { employeePerformanceData, carPerformanceData, storePerformanceData, supplierPerformanceData } from "@/data/performanceData";

const Performance = () => {
  // Weekly performance trend data
  const weeklyTrendData = [
    { week: 'Week 1', Aschlew: 38000, Sefu: 36000, Zelalem: 12000, Manzefro: 7500 },
    { week: 'Week 2', Aschlew: 35000, Sefu: 34000, Zelalem: 11500, Manzefro: 7200 },
    { week: 'Week 3', Aschlew: 37000, Sefu: 35500, Zelalem: 12200, Manzefro: 7400 },
    { week: 'Week 4', Aschlew: 35000, Sefu: 33000, Zelalem: 11800, Manzefro: 7200 },
  ];

  // Store performance pie chart
  const storeData = storePerformanceData.map(store => ({
    name: store.storeName,
    value: store.totalKg,
    revenue: store.revenue,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleExportReport = () => {
    console.log("Exporting performance report...");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Performance Dashboard</h1>
            <p className="text-muted-foreground">
              Employee, Car, Store & Supplier Performance Analytics
            </p>
          </div>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeePerformanceData.length}</div>
            <p className="text-xs text-muted-foreground">Active personnel</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carPerformanceData.length}</div>
            <p className="text-xs text-muted-foreground">Fleet vehicles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storePerformanceData.length}</div>
            <p className="text-xs text-muted-foreground">Storage facilities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95.2%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Performance Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employee Performance</TabsTrigger>
          <TabsTrigger value="cars">Car Performance</TabsTrigger>
          <TabsTrigger value="stores">Store Management</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          {/* Employee Performance Cards */}
          <PerformanceCards employees={employeePerformanceData} />
          
          {/* Weekly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
              <CardDescription>Collection performance by employee over the past 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} kg`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="Aschlew" stroke="#0088FE" strokeWidth={2} />
                  <Line type="monotone" dataKey="Sefu" stroke="#00C49F" strokeWidth={2} />
                  <Line type="monotone" dataKey="Zelalem" stroke="#FFBB28" strokeWidth={2} />
                  <Line type="monotone" dataKey="Manzefro" stroke="#FF8042" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cars" className="space-y-6">
          <CarPerformanceChart data={carPerformanceData} />
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Store Collection Distribution</CardTitle>
                <CardDescription>Total weight collected by store</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={storeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {storeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} kg`, 'Weight']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Performance Details</CardTitle>
                <CardDescription>Detailed store management metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storePerformanceData.map((store, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{store.storeName}</h4>
                          <p className="text-sm text-muted-foreground">Manager: {store.manager}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{store.efficiency}%</div>
                          <div className="text-xs text-muted-foreground">Efficiency</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="font-medium">{store.totalCollections}</div>
                          <div className="text-muted-foreground">Total Collections</div>
                        </div>
                        <div>
                          <div className="font-medium">{(store.totalKg / 1000).toFixed(1)}t</div>
                          <div className="text-muted-foreground">Total Weight</div>
                        </div>
                        <div>
                          <div className="font-medium">{store.weeklyCollections}</div>
                          <div className="text-muted-foreground">Weekly Collections</div>
                        </div>
                        <div>
                          <div className="font-medium">{store.revenue.toLocaleString()} ETB</div>
                          <div className="text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <SupplierPerformanceTable suppliers={supplierPerformanceData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
