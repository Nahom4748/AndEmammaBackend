import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InventoryItem, CollectionTransaction, SaleTransaction } from '@/types/inventory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Package, DollarSign, Users, FileBarChart, Download } from 'lucide-react';

interface InventoryReportsProps {
  items: InventoryItem[];
  collections: CollectionTransaction[];
  sales: SaleTransaction[];
}

export const InventoryReports = ({ items, collections, sales }: InventoryReportsProps) => {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Color palette for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (reportPeriod) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredCollections = collections.filter(c => new Date(c.date) >= startDate);
    const filteredSales = sales.filter(s => new Date(s.date) >= startDate);
    const filteredItems = selectedCategory === 'all' 
      ? items 
      : items.filter(item => item.category === selectedCategory);

    return { filteredCollections, filteredSales, filteredItems };
  }, [items, collections, sales, reportPeriod, selectedCategory]);

  const reportMetrics = useMemo(() => {
    const { filteredCollections, filteredSales, filteredItems } = filteredData;

    // Revenue and profit calculations
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalCosts = filteredCollections.reduce((sum, collection) => sum + collection.totalAmount, 0);
    const grossProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Stock valuation
    const totalStockValue = filteredItems.reduce((sum, item) => sum + (item.currentStock * item.salePrice), 0);
    const totalCostValue = filteredItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

    // Category breakdown
    const categoryBreakdown = filteredItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = {
          name: category.replace('_', ' ').toUpperCase(),
          value: 0,
          revenue: 0,
          items: 0,
          totalStock: 0
        };
      }
      acc[category].value += item.currentStock * item.salePrice;
      acc[category].items += 1;
      acc[category].totalStock += item.currentStock;
      return acc;
    }, {} as Record<string, any>);

    // Sales by category
    const salesByCategory = filteredSales.reduce((acc, sale) => {
      const item = items.find(i => i.id === sale.itemId);
      if (item) {
        const category = item.category;
        if (!acc[category]) {
          acc[category] = { name: category.replace('_', ' ').toUpperCase(), revenue: 0, quantity: 0 };
        }
        acc[category].revenue += sale.totalAmount;
        acc[category].quantity += sale.quantity;
      }
      return acc;
    }, {} as Record<string, any>);

    // Top performing items
    const itemPerformance = filteredItems.map(item => {
      const itemSales = filteredSales.filter(s => s.itemId === item.id);
      const revenue = itemSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const quantity = itemSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const profit = revenue - (quantity * item.unitPrice);
      return {
        ...item,
        revenue,
        quantity,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Low stock alerts
    const lowStockItems = filteredItems.filter(item => item.currentStock <= item.minStockLevel);

    // Supplier performance
    const supplierPerformance = filteredCollections.reduce((acc, collection) => {
      const supplier = collection.supplierName;
      if (!acc[supplier]) {
        acc[supplier] = { name: supplier, totalAmount: 0, collections: 0, lastCollection: collection.date };
      }
      acc[supplier].totalAmount += collection.totalAmount;
      acc[supplier].collections += 1;
      if (new Date(collection.date) > new Date(acc[supplier].lastCollection)) {
        acc[supplier].lastCollection = collection.date;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      totalRevenue,
      totalCosts,
      grossProfit,
      profitMargin,
      totalStockValue,
      totalCostValue,
      categoryBreakdown: Object.values(categoryBreakdown),
      salesByCategory: Object.values(salesByCategory),
      itemPerformance,
      lowStockItems,
      supplierPerformance: Object.values(supplierPerformance)
    };
  }, [filteredData, items]);

  const generateReport = () => {
    // This would generate a PDF or detailed report
    const reportData = {
      period: reportPeriod,
      date: new Date().toISOString(),
      metrics: reportMetrics,
      ...filteredData
    };
    
    // For now, we'll log it - in a real app, you'd generate a PDF
    console.log('Generated Report:', reportData);
    // You could also download as JSON
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `inventory-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Inventory Reports</h2>
          <p className="text-muted-foreground">Comprehensive business analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="mama_products">Mama Products</SelectItem>
              <SelectItem value="bags">Bags</SelectItem>
              <SelectItem value="paper_bags">Paper Bags</SelectItem>
              <SelectItem value="handcrafted">Handcrafted</SelectItem>
              <SelectItem value="home_decor">Home Decor</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">{reportMetrics.totalRevenue.toFixed(0)} ETB</p>
                <p className="text-xs text-muted-foreground">Gross Profit: {reportMetrics.grossProfit.toFixed(0)} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-primary">{reportMetrics.profitMargin.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Total Costs: {reportMetrics.totalCosts.toFixed(0)} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Value</p>
                <p className="text-2xl font-bold text-warning">{reportMetrics.totalStockValue.toFixed(0)} ETB</p>
                <p className="text-xs text-muted-foreground">Cost Value: {reportMetrics.totalCostValue.toFixed(0)} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Items</p>
                <p className="text-2xl font-bold text-secondary">{filteredData.filteredItems.length}</p>
                <p className="text-xs text-muted-foreground">Low Stock: {reportMetrics.lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Value by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportMetrics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {reportMetrics.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toFixed(0)} ETB`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales by Category Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportMetrics.salesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(0)} ETB`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Profit Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportMetrics.itemPerformance.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-success">{item.revenue.toFixed(0)} ETB</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className={item.profit >= 0 ? 'text-success' : 'text-destructive'}>
                        {item.profit.toFixed(0)} ETB
                      </TableCell>
                      <TableCell className={item.profitMargin >= 0 ? 'text-success' : 'text-destructive'}>
                        {item.profitMargin.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {/* Low Stock Alerts */}
          {reportMetrics.lowStockItems.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Low Stock Alerts ({reportMetrics.lowStockItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportMetrics.lowStockItems.map(item => (
                    <div key={item.id} className="p-3 border rounded-lg bg-destructive/5">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Current: {item.currentStock} | Min: {item.minStockLevel}</p>
                      <Badge variant="destructive">Reorder Required</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stock Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Summary by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Average Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportMetrics.categoryBreakdown.map((category: any) => (
                    <TableRow key={category.name}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.items}</TableCell>
                      <TableCell>{category.totalStock}</TableCell>
                      <TableCell className="font-semibold">{category.value.toFixed(0)} ETB</TableCell>
                      <TableCell>{category.items > 0 ? (category.value / category.items).toFixed(0) : 0} ETB</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Total Collections</TableHead>
                    <TableHead>Number of Collections</TableHead>
                    <TableHead>Average per Collection</TableHead>
                    <TableHead>Last Collection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportMetrics.supplierPerformance.map((supplier: any) => (
                    <TableRow key={supplier.name}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell className="font-semibold text-success">{supplier.totalAmount.toFixed(0)} ETB</TableCell>
                      <TableCell>{supplier.collections}</TableCell>
                      <TableCell>{(supplier.totalAmount / supplier.collections).toFixed(0)} ETB</TableCell>
                      <TableCell>{new Date(supplier.lastCollection).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Item Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Total Sold</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'outlet_item' ? 'default' : 'secondary'}>
                          {item.type === 'outlet_item' ? 'Company' : 'Supplier'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.category.replace('_', ' ')}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.unitPrice} ETB</TableCell>
                      <TableCell>{item.salePrice} ETB</TableCell>
                      <TableCell className="font-semibold">{(item.currentStock * item.salePrice).toFixed(0)} ETB</TableCell>
                      <TableCell>{item.totalSold}</TableCell>
                      <TableCell>
                        {item.currentStock <= item.minStockLevel ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="default">Good</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};