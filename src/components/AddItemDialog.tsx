import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface AddItemDialogProps {
  suppliers: {
    id: number;
    name: string;
  }[];
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export const AddItemDialog = ({ suppliers, onSuccess, trigger }: AddItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'mama_products',
    type: 'outlet_item',
    currentStock: 0,
    unitPrice: 0,
    salePrice: 0,
    minStockLevel: 10,
    supplierId: undefined as number | undefined,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }
    
    if (formData.salePrice <= 0) {
      newErrors.salePrice = 'Sale price must be greater than 0';
    }
    
    if (formData.salePrice < formData.unitPrice) {
      newErrors.salePrice = 'Sale price should not be less than unit price';
    }
    
    if (formData.currentStock < 0) {
      newErrors.currentStock = 'Stock cannot be negative';
    }
    
    if (formData.minStockLevel < 0) {
      newErrors.minStockLevel = 'Minimum stock level cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        supplierId: formData.supplierId || null,
      };

      await axios.post('/api/items', payload);
      toast.success('Item added successfully', {
        style: { background: '#4CAF50', color: 'white', border: 'none' }
      });
      setIsOpen(false);
      onSuccess();
      setFormData({
        name: '',
        description: '',
        category: 'mama_products',
        type: 'outlet_item',
        currentStock: 0,
        unitPrice: 0,
        salePrice: 0,
        minStockLevel: 10,
        supplierId: undefined,
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding item:', error);
      let errorMessage = 'Failed to add item';
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        style: { background: '#F44336', color: 'white', border: 'none' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-green-700">Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-gray-700">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="type" className="text-gray-700">Item Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outlet_item">Company Product</SelectItem>
                  <SelectItem value="supplier_item">Supplier Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unitPrice" className="text-gray-700">Unit Cost (ETB) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                disabled={isLoading}
                className={errors.unitPrice ? 'border-red-500' : ''}
              />
              {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
            </div>
            <div>
              <Label htmlFor="salePrice" className="text-gray-700">Sale Price (ETB) *</Label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                disabled={isLoading}
                className={errors.salePrice ? 'border-red-500' : ''}
              />
              {errors.salePrice && <p className="text-red-500 text-xs mt-1">{errors.salePrice}</p>}
            </div>
            <div>
              <Label htmlFor="currentStock" className="text-gray-700">Initial Stock (kg)</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                step="0.1"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                disabled={isLoading}
                className={errors.currentStock ? 'border-red-500' : ''}
              />
              {errors.currentStock && <p className="text-red-500 text-xs mt-1">{errors.currentStock}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStockLevel" className="text-gray-700">Min Stock Level (kg)</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                step="0.1"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) || 0 })}
                disabled={isLoading}
                className={errors.minStockLevel ? 'border-red-500' : ''}
              />
              {errors.minStockLevel && <p className="text-red-500 text-xs mt-1">{errors.minStockLevel}</p>}
            </div>
            <div>
              <Label htmlFor="supplierId" className="text-gray-700">Supplier (Optional)</Label>
              <Select
                value={formData.supplierId ? formData.supplierId.toString() : ''}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  supplierId: value ? parseInt(value) : undefined 
                })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Adding...' : 'Add Item'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};