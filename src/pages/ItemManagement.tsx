import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryItem, Supplier, CollectionTransaction, SaleTransaction } from '@/types/inventory';
import { ModernInventoryCard } from '@/components/ModernInventoryCard';
import { InventoryReports } from '@/components/InventoryReports';
import { SupplierForm } from '@/components/SupplierForm';
import { EnhancedItemForm } from '@/components/EnhancedItemForm';
import { ModernShoppingCart } from '@/components/ModernShoppingCart';
import { ModernReceiptSystem } from '@/components/ModernReceiptSystem';
import { 
  getSuppliers, 
  saveSupplier,
  getCollectionTransactions,
  getSaleTransactions,
  saveSaleTransaction,
  updateInventoryItem,
  saveReceipt
} from '@/lib/inventoryStorage';
import { sampleSuppliers } from '@/data/inventoryData';
import { Package, Users, TrendingUp, BarChart3, Receipt, Warehouse, AlertTriangle, TrendingDown, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

export default function ItemManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [collections, setCollections] = useState<CollectionTransaction[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch items from backend API
      const itemsResponse = await fetch(`${API_BASE_URL}/items`);
      const itemsData = await itemsResponse.json();
      
      if (itemsData.status === 'success') {
        // Transform backend data to match frontend InventoryItem type
        const transformedItems: InventoryItem[] = itemsData.data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description || '',
          category: item.category,
          currentStock: item.current_stock,
          unitPrice: parseFloat(item.unit_price),
          salePrice: parseFloat(item.sale_price),
          minStockLevel: item.min_stock_level,
          notes: item.notes || '',
          collectionDate: item.collection_date,
          image: item.image ? `${API_BASE_URL}${item.image}` : '',
          size: item.size || '',
          dimension: item.dimension || '',
          supplier: item.supplier_name || '',
          contactPerson: item.contact_person || '',
          supplierEmail: item.supplier_email || '',
          supplierPhone: item.supplier_phone || '',
          type: 'supplier_item', // Default type
          vatRate: 15, // Default VAT rate
          sku: '', // Default empty SKU
          totalCollected: 0, // Default value
          totalSold: 0, // Default value
          lastUpdated: new Date().toISOString(), // Current date
          supplierId: item.supplier_id ? item.supplier_id.toString() : undefined,
        }));
        
        setItems(transformedItems);
      }
      
      // Fetch receipts from backend API
      const receiptsResponse = await fetch(`${API_BASE_URL}/api/receipts`);
      const receiptsData = await receiptsResponse.json();
      
      if (receiptsData.status === 'success') {
        setReceipts(receiptsData.data || []);
      }
      
      // Load other data from local storage
      let loadedSuppliers = getSuppliers();
      if (loadedSuppliers.length === 0) {
        sampleSuppliers.forEach(supplier => saveSupplier(supplier));
        loadedSuppliers = getSuppliers();
      }

      setSuppliers(loadedSuppliers);
      setCollections(getCollectionTransactions());
      setSales(getSaleTransactions());
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  // Function to transform backend receipt data to frontend format
  const transformBackendReceipt = (backendReceipt: any) => {
    return {
      id: backendReceipt.sale_id.toString(),
      receiptNumber: `SAL-${backendReceipt.sale_id}`,
      type: 'sale' as const,
      items: backendReceipt.items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        totalAmount: item.quantity * parseFloat(item.unit_price),
        vatAmount: (item.quantity * parseFloat(item.unit_price)) * 0.15,
      })),
      subtotal: parseFloat(backendReceipt.subtotal),
      totalVAT: parseFloat(backendReceipt.vat),
      totalAmount: parseFloat(backendReceipt.total),
      date: backendReceipt.sale_date,
      customerName: backendReceipt.customer_name || 'Walk-in Customer',
      paymentMethod: backendReceipt.payment_method as 'cash' | 'mobile' | 'bank',
      companyInfo: {
        name: "AndE Mamma Manufacturing PLC",
        address: "Addis Ababa, Ethiopia",
        phone: "+251-911-123456",
        tinNumber: "0123456789",
        vatNumber: "ETH-VAT-001234567",
      },
    };
  };

  const handleCheckout = async (cartItems: any[], paymentMethod: string, customerName?: string) => {
    try {
      // Create a single receipt number for all items from the same customer
      const receiptNumber = `SAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const saleDate = new Date().toISOString();

      // Calculate totals for the consolidated receipt
      const subtotal = cartItems.reduce((sum, item) => sum + (item.cartQuantity * item.salePrice), 0);
      const vatAmount = subtotal * 0.15;
      const total = subtotal + vatAmount;

      for (const cartItem of cartItems) {
        // Create sale transaction with the same receipt number
        const saleTransaction = {
          itemId: cartItem.id,
          itemName: cartItem.name,
          quantity: cartItem.cartQuantity,
          unitPrice: cartItem.salePrice,
          totalAmount: cartItem.cartQuantity * cartItem.salePrice,
          customerName,
          date: saleDate,
          receiptNumber: receiptNumber,
          paymentMethod: paymentMethod as 'cash' | 'mobile' | 'bank',
        };

        saveSaleTransaction(saleTransaction);

        // Update inventory - you might want to send this to your backend too
        const updates = {
          currentStock: cartItem.currentStock - cartItem.cartQuantity,
          totalSold: cartItem.totalSold + cartItem.cartQuantity,
          lastUpdated: new Date().toISOString(),
        };
        updateInventoryItem(cartItem.id, updates);
      }

      // Generate one consolidated receipt for all items
      const consolidatedReceipt = {
        id: crypto.randomUUID(),
        receiptNumber: receiptNumber,
        type: 'sale' as const,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.cartQuantity,
          unitPrice: item.salePrice,
          totalAmount: item.cartQuantity * item.salePrice,
          vatAmount: (item.cartQuantity * item.salePrice) * 0.15,
        })),
        subtotal,
        totalVAT: vatAmount,
        totalAmount: total,
        date: saleDate,
        customerName,
        paymentMethod: paymentMethod as 'cash' | 'mobile' | 'bank',
        companyInfo: {
          name: "AndE Mamma Manufacturing PLC",
          address: "Addis Ababa, Ethiopia",
          phone: "+251-911-123456",
          tinNumber: "0123456789",
          vatNumber: "ETH-VAT-001234567",
        },
      };

      saveReceipt(consolidatedReceipt);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      throw new Error('Failed to process sale');
    }
  };

  const lowStockItems = items.filter(item => item.currentStock <= item.minStockLevel);
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const totalItems = items.reduce((sum, item) => sum + item.currentStock, 0);
  const monthlyCollections = collections.filter(c => 
    new Date(c.date).getMonth() === new Date().getMonth()
  ).reduce((sum, c) => sum + c.totalAmount, 0);
  const monthlySales = sales.filter(s => 
    new Date(s.date).getMonth() === new Date().getMonth()
  ).reduce((sum, s) => sum + s.totalAmount, 0);

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Professional Item Management</h1>
          <p className="text-muted-foreground">Comprehensive inventory, supplier, and sales management system</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Warehouse className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold text-primary">{totalItems} qty</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold text-success">{totalValue.toFixed(0)} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Collections</p>
                <p className="text-2xl font-bold text-primary">{monthlyCollections.toFixed(0)} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-10 w-10 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Sales</p>
                <p className="text-2xl font-bold text-success">{monthlySales.toFixed(0)} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert ({lowStockItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="text-warning border-warning">
                  {item.name}: {item.currentStock} qty
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Receipts
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-6">
          <SupplierForm suppliers={suppliers} onSupplierAdded={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <EnhancedItemForm suppliers={suppliers} onItemAdded={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary">Inventory Items</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <ModernInventoryCard
                key={item.id}
                item={item}
                onUpdate={() => setRefreshKey(prev => prev + 1)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary">Sales System</h2>
          </div>
          <ModernShoppingCart items={items} onCheckout={handleCheckout} />
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <ModernReceiptSystem 
            receipts={receipts.map(transformBackendReceipt)} 
            onGenerateReceipt={transformBackendReceipt} 
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <InventoryReports 
            items={items}
            collections={collections}
            sales={sales}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}