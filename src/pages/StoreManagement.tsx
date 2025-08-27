import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Package, TrendingUp, DollarSign, Scale } from "lucide-react";
import { storeInventoryData } from "@/data/employeeData";
import { StoreInventory } from "@/types/employee";

export default function StoreManagement() {
  const totalKg = storeInventoryData.reduce((sum, item) => sum + item.totalKg, 0);
  const totalRevenue = storeInventoryData.reduce((sum, item) => sum + item.currentMonth.revenue, 0);
  const totalCollected = storeInventoryData.reduce((sum, item) => sum + item.currentMonth.collected, 0);
  const totalSold = storeInventoryData.reduce((sum, item) => sum + item.currentMonth.sold, 0);

  // Find best performing item
  const bestPerformer = storeInventoryData.reduce((best, current) => 
    current.currentMonth.revenue > best.currentMonth.revenue ? current : best
  );

  const getTypeColor = (type: string) => {
    const colors = {
      mixed: "bg-blue-500 text-blue-500",
      carton: "bg-amber-500 text-amber-500", 
      newspaper: "bg-violet-500 text-violet-500",
      sc: "bg-emerald-500 text-emerald-500",
      sw: "bg-yellow-500 text-yellow-500"
    };
    return colors[type as keyof typeof colors] || "bg-gray-500 text-gray-500";
  };

  const getPerformanceLevel = (sold: number, collected: number) => {
    const ratio = collected > 0 ? (sold / collected) * 100 : 0;
    if (ratio >= 90) return { level: "Excellent", color: "text-green-600", variant: "default" as const };
    if (ratio >= 70) return { level: "Good", color: "text-green-500", variant: "secondary" as const };
    if (ratio >= 50) return { level: "Fair", color: "text-yellow-500", variant: "outline" as const };
    return { level: "Poor", color: "text-red-500", variant: "destructive" as const };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Store Management</h1>
          <p className="text-green-600/80 mt-2">Monitor inventory, sales, and store performance</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200/50 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{totalKg.toLocaleString()} kg</div>
            <p className="text-xs text-green-600/70">All paper types</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200/50 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">This Month Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{totalRevenue.toLocaleString()} ETB</div>
            <p className="text-xs text-green-600/70">From all sales</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200/50 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Collected This Month</CardTitle>
            <Scale className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{totalCollected.toLocaleString()} kg</div>
            <p className="text-xs text-green-600/70">New collections</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200/50 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Best Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 capitalize">{bestPerformer.type}</div>
            <p className="text-xs text-green-600/70">{bestPerformer.currentMonth.revenue.toLocaleString()} ETB revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-green-200/50">
          <CardHeader>
            <CardTitle className="text-green-800">Inventory Distribution</CardTitle>
            <CardDescription className="text-green-600/70">Current stock levels by paper type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeInventoryData.map((item) => {
              const percentage = (item.totalKg / totalKg) * 100;
              const typeColor = getTypeColor(item.type).split(' ')[0];
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${typeColor}`} />
                      <span className="font-medium capitalize">{item.type}</span>
                    </div>
                    <span className="text-sm text-green-600/80">{item.totalKg.toLocaleString()} kg</span>
                  </div>
                  <Progress value={percentage} className="h-2 bg-green-100" indicatorClassName={typeColor} />
                  <p className="text-xs text-green-600/70">{percentage.toFixed(1)}% of total inventory</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-green-200/50">
          <CardHeader>
            <CardTitle className="text-green-800">Monthly Sales Performance</CardTitle>
            <CardDescription className="text-green-600/70">Sales efficiency by paper type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeInventoryData.map((item) => {
              const sellRate = item.currentMonth.collected > 0 
                ? (item.currentMonth.sold / item.currentMonth.collected) * 100 
                : 0;
              const performance = getPerformanceLevel(item.currentMonth.sold, item.currentMonth.collected);
              const typeColor = getTypeColor(item.type).split(' ')[0];
              
              return (
                <div key={item.id} className="flex items-center justify-between p-3 border border-green-100 rounded-lg bg-green-50/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${typeColor}`} />
                    <div>
                      <p className="font-medium capitalize text-green-800">{item.type}</p>
                      <p className="text-sm text-green-600/70">
                        {item.currentMonth.sold}kg sold / {item.currentMonth.collected}kg collected
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={performance.variant} className="mb-1">
                      {performance.level}
                    </Badge>
                    <p className={`text-sm ${performance.color}`}>{sellRate.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Inventory Table */}
      <Card className="border-green-200/50">
        <CardHeader>
          <CardTitle className="text-green-800">Detailed Inventory & Sales Report</CardTitle>
          <CardDescription className="text-green-600/70">Comprehensive view of all paper types and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-green-50/30">
                <TableHead className="text-green-800">Paper Type</TableHead>
                <TableHead className="text-green-800">Total Stock (kg)</TableHead>
                <TableHead className="text-green-800">Collected This Month (kg)</TableHead>
                <TableHead className="text-green-800">Sold This Month (kg)</TableHead>
                <TableHead className="text-green-800">Price per kg (ETB)</TableHead>
                <TableHead className="text-green-800">Revenue (ETB)</TableHead>
                <TableHead className="text-green-800">Sales Rate</TableHead>
                <TableHead className="text-green-800">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeInventoryData.map((item) => {
                const sellRate = item.currentMonth.collected > 0 
                  ? (item.currentMonth.sold / item.currentMonth.collected) * 100 
                  : 0;
                const performance = getPerformanceLevel(item.currentMonth.sold, item.currentMonth.collected);
                const typeColor = getTypeColor(item.type).split(' ')[0];
                
                return (
                  <TableRow key={item.id} className="hover:bg-green-50/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${typeColor}`} />
                        <span className="font-medium capitalize text-green-800">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-700">{item.totalKg.toLocaleString()}</TableCell>
                    <TableCell className="text-green-700">{item.currentMonth.collected.toLocaleString()}</TableCell>
                    <TableCell className="text-green-700">{item.currentMonth.sold.toLocaleString()}</TableCell>
                    <TableCell className="text-green-700">{item.price}</TableCell>
                    <TableCell className="font-medium text-green-700">{item.currentMonth.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={sellRate} className="h-2 w-16 bg-green-100" indicatorClassName={typeColor} />
                        <span className="text-sm text-green-700">{sellRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={performance.variant}>
                        {performance.level}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}