import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, Edit, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

// Define TypeScript interfaces
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

interface InventoryItemCardProps {
  item: InventoryItem;
  onUpdate: () => void;
}

export const InventoryItemCard = ({ item, onUpdate }: InventoryItemCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item);
  const [loading, setLoading] = useState(false);

  const isLowStock = item.currentStock <= item.minStockLevel;
  const stockPercentage = (item.currentStock / (item.minStockLevel * 2)) * 100;

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/items/${item.id}`, formData);
      
      if (response.status === 200) {
        toast.success('Item updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      grains: 'bg-orange-100 text-orange-800 border-orange-200',
      vegetables: 'bg-green-100 text-green-800 border-green-200',
      fruits: 'bg-red-100 text-red-800 border-red-200',
      dairy: 'bg-blue-100 text-blue-800 border-blue-200',
      meats: 'bg-pink-100 text-pink-800 border-pink-200',
      beverages: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || colors.other;
  };

  const getTypeColor = (type: string) => {
    return type === 'company_product' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const formatCategoryName = (category: string) => {
    return category.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{item.name}</CardTitle>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grains">Grains</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="meats">Meats</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Item Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company_product">Company Product</SelectItem>
                        <SelectItem value="supplier_item">Supplier Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitPrice">Unit Price (ETB)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price (ETB)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock (kg)</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStockLevel">Min Stock Level (kg)</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdate} className="flex-1" disabled={loading}>
                    {loading ? "Updating..." : "Update Item"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFormData(item);
                      setIsEditing(false);
                    }} 
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <Badge variant="outline" className={getCategoryColor(item.category)}>
            {formatCategoryName(item.category)}
          </Badge>
          <Badge variant="outline" className={getTypeColor(item.type)}>
            {item.type === 'company_product' ? 'Company Product' : 'Supplier Item'}
          </Badge>
          {item.supplierName && (
            <Badge variant="outline" className="text-xs">
              Supplier: {item.supplierName}
            </Badge>
          )}
          {isLowStock && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-lg font-semibold text-primary">{item.currentStock} kg</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isLowStock ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Min: {item.minStockLevel} kg</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sale Price</p>
              <p className="text-lg font-semibold text-success">{item.salePrice.toLocaleString()} ETB</p>
              <p className="text-xs text-muted-foreground">Cost: {item.unitPrice.toLocaleString()} ETB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Total Collected</p>
                <p className="font-semibold">{item.totalCollected} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Total Sold</p>
                <p className="font-semibold">{item.totalSold} kg</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
              {item.supplierName && ` • Supplier: ${item.supplierName}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};