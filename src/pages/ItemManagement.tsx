import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Warehouse, BarChart3, TrendingUp, TrendingDown, Package, Plus, Users, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { InventoryItemCard } from '@/components/InventoryItemCard';
import { CollectionForm } from '@/components/CollectionForm';
import { SaleForm } from '@/components/SaleForm';
import { ReceiptViewer } from '@/components/ReceiptViewer';
import { AddItemDialog } from '@/components/AddItemDialog';
import { AddSupplierDialog } from '@/components/AddSupplierDialog';
import { SupplierCard } from '@/components/SupplierCard';
import { RecentTransactions } from '@/components/RecentTransactions';

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  currentStock: number;
  unitPrice: number;
  salePrice: number;
  minStockLevel: number;
  totalCollected: number;
  totalSold: number;
  supplierId?: number;
  supplierName?: string;
  lastUpdated: string;
}

interface Supplier {
  id: number;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  status: string;
  totalCollections: number;
  lastCollection?: string;
}

interface CollectionTransaction {
  id: number;
  receiptNumber: string;
  supplierId: number;
  supplierName: string;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  notes?: string;
  image?: string;
  date: string;
}

interface SaleTransaction {
  id: number;
  receiptNumber: string;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  paymentMethod: string;
  date: string;
}

const StatCard = ({ 
  icon, 
  title, 
  value, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  description: string 
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const parseApiResponse = <T,>(response: any, defaultValue: T[] = []): T[] => {
  try {
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error parsing API response:', error);
    return defaultValue;
  }
};

export default function ItemManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [collections, setCollections] = useState<CollectionTransaction[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [itemsRes, suppliersRes, collectionsRes, salesRes] = await Promise.all([
        axios.get('/api/items').catch(() => ({ data: { data: [] }})),
        axios.get('/api/suppliers').catch(() => ({ data: { data: [] }})),
        axios.get('/api/collections').catch(() => ({ data: { data: [] }})),
        axios.get('/api/sales').catch(() => ({ data: { data: [] }}))
      ]);

      setItems(parseApiResponse<InventoryItem>(itemsRes));
      setSuppliers(parseApiResponse<Supplier>(suppliersRes));
      setCollections(parseApiResponse<CollectionTransaction>(collectionsRes));
      setSales(parseApiResponse<SaleTransaction>(salesRes));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Safe calculations with fallbacks
  const lowStockItems = items.filter(item => item.currentStock <= item.minStockLevel);
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const totalItems = items.reduce((sum, item) => sum + item.currentStock, 0);
  
  const currentMonth = new Date().getMonth();
  const monthlyCollections = collections
    .filter(c => new Date(c.date).getMonth() === currentMonth)
    .reduce((sum, c) => sum + c.totalAmount, 0);
  
  const monthlySales = sales
    .filter(s => new Date(s.date).getMonth() === currentMonth)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Error loading data</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Button onClick={fetchData}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage inventory, collections, and sales</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Warehouse className="h-6 w-6" />}
          title="Total Stock"
          value={`${totalItems.toFixed(1)} kg`}
          description="Current inventory quantity"
        />
        <StatCard 
          icon={<BarChart3 className="h-6 w-6" />}
          title="Inventory Value"
          value={`${totalValue.toFixed(0)} ETB`}
          description="Total value of inventory"
        />
        <StatCard 
          icon={<TrendingUp className="h-6 w-6" />}
          title="Monthly Collections"
          value={`${monthlyCollections.toFixed(0)} ETB`}
          description="This month's collections"
        />
        <StatCard 
          icon={<TrendingDown className="h-6 w-6" />}
          title="Monthly Sales"
          value={`${monthlySales.toFixed(0)} ETB`}
          description="This month's sales"
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert ({lowStockItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="text-destructive border-destructive">
                  {item.name}: {item.currentStock} kg (min: {item.minStockLevel} kg)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventory Items ({items.length})</h2>
            <AddItemDialog 
              suppliers={suppliers}
              onSuccess={fetchData}
            />
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  onUpdate={fetchData}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No inventory items</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by adding your first inventory item.
                </p>
                <div className="mt-6">
                  <AddItemDialog 
                    suppliers={suppliers}
                    onSuccess={fetchData}
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Suppliers ({suppliers.length})</h2>
            <AddSupplierDialog onSuccess={fetchData} />
          </div>

          {suppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map(supplier => (
                <SupplierCard 
                  key={supplier.id}
                  supplier={supplier}
                  onUpdate={fetchData}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No suppliers</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by adding your first supplier.
                </p>
                <div className="mt-6">
                  <AddSupplierDialog 
                    onSuccess={fetchData}
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Supplier
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <CollectionForm
            items={items}
            suppliers={suppliers}
            onSuccess={fetchData}
          />

          <RecentTransactions 
            transactions={collections}
            type="collections"
            title="Recent Collections"
            emptyMessage="No collection records found"
          />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <SaleForm
            items={items.filter(item => item.currentStock > 0)}
            onSuccess={fetchData}
          />

          <RecentTransactions 
            transactions={sales}
            type="sales"
            title="Recent Sales"
            emptyMessage="No sales records found"
          />
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <ReceiptViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}