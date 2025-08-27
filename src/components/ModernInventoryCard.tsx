import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InventoryItem } from '@/types/inventory';
import { Package, Edit, AlertTriangle, TrendingUp, TrendingDown, Barcode, Hash } from 'lucide-react';
import { updateInventoryItem } from '@/lib/inventoryStorage';
import { toast } from 'sonner';

interface ModernInventoryCardProps {
  item: InventoryItem;
  onUpdate: () => void;
}

export const ModernInventoryCard = ({ item, onUpdate }: ModernInventoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item);

  const isLowStock = item.currentStock <= item.minStockLevel;
  const stockPercentage = (item.currentStock / (item.minStockLevel * 2)) * 100;

  const handleUpdate = () => {
    const updated = updateInventoryItem(item.id, formData);
    if (updated) {
      toast.success('Item updated successfully');
      setIsEditing(false);
      onUpdate();
    } else {
      toast.error('Failed to update item');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      mama_products: 'bg-primary/10 text-primary border-primary/20',
      bags: 'bg-secondary/10 text-secondary border-secondary/20',
      paper_bags: 'bg-accent/10 text-accent border-accent/20',
      handcrafted: 'bg-success/10 text-success border-success/20',
      home_decor: 'bg-warning/10 text-warning border-warning/20',
      accessories: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      other: 'bg-muted/10 text-muted-foreground border-muted/20',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getTypeColor = (type: string) => {
    return type === 'outlet_item' 
      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
      : 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2">
      <div className="relative">
        {item.image && (
          <div className="h-48 overflow-hidden rounded-t-lg">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="flex items-center gap-1 shadow-lg">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Edit Item - {item.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Stock Keeping Unit"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
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
                    <Label htmlFor="type">Item Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
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
                  <div>
                    <Label htmlFor="vatRate">VAT Rate (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      value={formData.vatRate || 15}
                      onChange={(e) => setFormData(prev => ({ ...prev, vatRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitPrice">Unit Cost (ETB) *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price (ETB) *</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock (qty)</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStockLevel">Min Stock Level (qty)</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdate} className="flex-1">
                    Update Item
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getCategoryColor(item.category)}>
            {item.category.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline" className={getTypeColor(item.type)}>
            {item.type === 'outlet_item' ? 'Company Product' : 'Supplier Item'}
          </Badge>
          {item.supplier && (
            <Badge variant="outline" className="text-xs">
              {item.supplier}
            </Badge>
          )}
          {item.sku && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {item.sku}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-bold text-primary">{item.currentStock} qty</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isLowStock ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Min: {item.minStockLevel} qty</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pricing</p>
              <div className="space-y-1">
                <p className="text-lg font-bold text-success">{item.salePrice.toFixed(2)} ETB</p>
                <p className="text-xs text-muted-foreground">Cost: {item.unitPrice.toFixed(2)} ETB</p>
                <p className="text-xs text-success">
                  Profit: {(item.salePrice - item.unitPrice).toFixed(2)} ETB
                </p>
                <p className="text-xs text-muted-foreground">VAT: {item.vatRate || 15}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Total Collected</p>
                <p className="font-semibold">{item.totalCollected} qty</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Sold</p>
                <p className="font-semibold">{item.totalSold} qty</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};