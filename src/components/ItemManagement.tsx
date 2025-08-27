import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InventoryItem, Supplier, CollectionTransaction, SaleTransaction } from '@/types/inventory';
import { ModernInventoryCard } from '@/components/ModernInventoryCard';
import { CollectionForm } from '@/components/CollectionForm';
import { SaleForm } from '@/components/SaleForm';
import { ModernReceiptViewer } from '@/components/ModernReceiptViewer';
import { InventoryReports } from '@/components/InventoryReports';
import { 
  getInventoryItems, 
  saveInventoryItem, 
  getSuppliers, 
  saveSupplier,
  updateSupplier,
  getCollectionTransactions,
  getSaleTransactions 
} from '@/lib/inventoryStorage';
import { sampleInventoryItems, sampleSuppliers } from '@/data/inventoryData';
import { Package, Plus, Users, TrendingUp, BarChart3, Receipt, Warehouse, AlertTriangle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ItemManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [collections, setCollections] = useState<CollectionTransaction[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: 'mama_products' as const,
    type: 'outlet_item' as const,
    currentStock: 0,
    unitPrice: 0,
    salePrice: 0,
    minStockLevel: 10,
    totalCollected: 0,
    totalSold: 0,
    vatRate: 15,
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    status: 'active' as const,
    totalCollections: 0,
  });

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = () => {
    let loadedItems = getInventoryItems();
    let loadedSuppliers = getSuppliers();
    
    // Initialize with sample data if empty
    if (loadedItems.length === 0) {
      sampleInventoryItems.forEach(item => saveInventoryItem(item));
      loadedItems = getInventoryItems();
    }
    
    if (loadedSuppliers.length === 0) {
      sampleSuppliers.forEach(supplier => saveSupplier(supplier));
      loadedSuppliers = getSuppliers();
    }

    setItems(loadedItems);
    setSuppliers(loadedSuppliers);
    setCollections(getCollectionTransactions());
    setSales(getSaleTransactions());
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    saveInventoryItem(newItem);
    setNewItem({
      name: '',
      description: '',
      category: 'mama_products',
      type: 'outlet_item',
      currentStock: 0,
      unitPrice: 0,
      salePrice: 0,
      minStockLevel: 10,
      totalCollected: 0,
      totalSold: 0,
      vatRate: 15,
    });
    setIsAddingItem(false);
    setRefreshKey(prev => prev + 1);
    toast.success('Item added successfully');
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim() || !newSupplier.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    saveSupplier(newSupplier);
    setNewSupplier({
      name: '',
      phone: '',
      address: '',
      email: '',
      status: 'active',
      totalCollections: 0,
    });
    setIsAddingSupplier(false);
    setRefreshKey(prev => prev + 1);
    toast.success('Supplier added successfully');
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Item Management</h1>
          <p className="text-muted-foreground">Manage inventory, collections, and sales</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Warehouse className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold text-primary">{totalItems} qty</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold text-success">{totalValue.toFixed(0)} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Collections</p>
                <p className="text-2xl font-bold text-primary">{monthlyCollections.toFixed(0)} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-success" />
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
        <Card className="border-warning">
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

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemDescription">Description</Label>
                    <Textarea
                      id="itemDescription"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemCategory">Category *</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mama_products">Mama Products</SelectItem>
                          <SelectItem value="bags">Bags</SelectItem>
                          <SelectItem value="paper_bags">Paper Bags</SelectItem>
                          <SelectItem value="handcrafted">Handcrafted Items</SelectItem>
                          <SelectItem value="home_decor">Home Decor</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="itemType">Item Type *</Label>
                      <Select
                        value={newItem.type}
                        onValueChange={(value) => setNewItem(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outlet_item">Company Product</SelectItem>
                          <SelectItem value="supplier_item">Supplier Item</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemPrice">Unit Cost (ETB) *</Label>
                      <Input
                        id="itemPrice"
                        type="number"
                        value={newItem.unitPrice}
                        onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                        placeholder="Cost to produce/buy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salePrice">Sale Price (ETB) *</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={newItem.salePrice}
                        onChange={(e) => setNewItem(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                        placeholder="Price to sell"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemStock">Initial Stock (qty)</Label>
                      <Input
                        id="itemStock"
                        type="number"
                        value={newItem.currentStock}
                        onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemMinStock">Min Stock Level (qty)</Label>
                      <Input
                        id="itemMinStock"
                        type="number"
                        value={newItem.minStockLevel}
                        onChange={(e) => setNewItem(prev => ({ ...prev, minStockLevel: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddItem} className="flex-1">
                      Add Item
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingItem(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Suppliers</h2>
            <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierName">Full Name *</Label>
                      <Input
                        id="supplierName"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplierPhone">Phone *</Label>
                      <Input
                        id="supplierPhone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplierAddress">Address</Label>
                    <Input
                      id="supplierAddress"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierEmail">Email</Label>
                    <Input
                      id="supplierEmail"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddSupplier} className="flex-1">
                      Add Supplier
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingSupplier(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(supplier => (
              <Card key={supplier.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Phone:</strong> {supplier.phone}</p>
                    {supplier.address && <p className="text-sm"><strong>Address:</strong> {supplier.address}</p>}
                    {supplier.email && <p className="text-sm"><strong>Email:</strong> {supplier.email}</p>}
                    <p className="text-sm"><strong>Total Collections:</strong> {supplier.totalCollections.toFixed(2)} ETB</p>
                    {supplier.lastCollection && (
                      <p className="text-sm"><strong>Last Collection:</strong> {new Date(supplier.lastCollection).toLocaleDateString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <CollectionForm
            items={items}
            suppliers={suppliers}
            onSuccess={() => setRefreshKey(prev => prev + 1)}
          />

          <Card>
            <CardHeader>
              <CardTitle>Recent Collections ({collections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collections.slice(0, 10).map(collection => (
                  <div key={collection.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{collection.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {collection.supplierName} • {collection.quantity} qty @ {collection.unitPrice} ETB/qty
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(collection.date).toLocaleString()} • {collection.receiptNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">{collection.totalAmount.toFixed(2)} ETB</p>
                      {collection.image && (
                        <img
                          src={collection.image}
                          alt="Collection"
                          className="w-12 h-12 object-cover rounded mt-1"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <SaleForm
            items={items}
            onSuccess={() => setRefreshKey(prev => prev + 1)}
          />

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales ({sales.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sales.slice(0, 10).map(sale => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{sale.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.customerName || 'Walk-in Customer'} • {sale.quantity} qty @ {sale.unitPrice} ETB/qty
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.date).toLocaleString()} • {sale.receiptNumber} • {sale.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">{sale.totalAmount.toFixed(2)} ETB</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <ModernReceiptViewer />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <InventoryReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}